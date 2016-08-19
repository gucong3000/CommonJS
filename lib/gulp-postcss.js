"use strict";

const through = require("through2");
const postcss = require("postcss");
const gutil = require("gulp-util");
const path = require("path");
const cosmiconfig = require("cosmiconfig");

function hijack(cwd) {
	require.cache[require.resolve("cosmiconfig")].exports = function(moduleName, options) {
		if (options) {
			options.cwd = cwd;
		} else {
			options = {
				cwd: cwd
			};
		}
		return cosmiconfig(moduleName, options);
	}
}

module.exports = function(processors, optFactory) {

	if (!Array.isArray(processors)) {
		throw new gutil.PluginError("gulp-postcss", "Please provide array of postcss processors!");
	}

	/**
	 * 使用postcss处理buffer中的css内容
	 * @param  {Buffer} buf  文件内容
	 * @param  {Vinyl}  file 文件对象
	 * @return {Promise}处理结果
	 */
	function fixBuffer(buf, file) {

		let opts = (typeof optFactory === "function") ? optFactory(file) : optFactory;

		opts = Object.assign({
			from: file.path,
			to: file.path,
			map: file.sourceMap ? {
				annotation: false
			} : false,
		}, opts);

		hijack(file.cwd);

		/**
		 * [handleResult description]
		 * @param  {Result} result postcss的结果对象，postcss的Result类型
		 * @return {Buffer}        css内容的buffer
		 */
		function handleResult(result) {
			let map;

			// Apply source map to the chain
			if (file.sourceMap) {
				map = result.map.toJSON();
				map.file = file.relative;
				map.sources = [].map.call(map.sources, function(source) {
					return path.join(path.dirname(file.relative), source);
				});
				const applySourceMap = require("vinyl-sourcemaps-apply");
				applySourceMap(file, map);
			}

			file.postcss = result;

			return new Buffer(result.css);
		}

		/**
		 * 错误处理
		 * @param  {Error} error 错误对象
		 * @return {undefined}
		 */
		function handleError(error) {

			let errorOptions = {
				fileName: error.file || (error.input && error.input.file) || file.path,
				lineNumber: error.line,
				showStack: true
			};

			let newError = new gutil.PluginError("gulp-postcss", error.name && error.reason ? error.name + ": " + error.reason : (error.message || error), errorOptions);

			newError.columnNumber = error.column;

			if (error.showSourceCode) {
				newError.source = error.showSourceCode(false).replace(/[\r\n]+\s*\^([\r\n]*)/, "$1").replace(/^[\r\n]+/, "").replace(/[\r\n]+$/, "");
				newError.showSourceCode = function() {
					return error.showSourceCode.apply(error, arguments);
				};
			}

			if(error.stack) {
				newError.stack = error.stack;
			}

			throw newError;
		}

		return postcss(processors)
			.process(file.contents, opts)
			.then(handleResult)
			.catch(handleError);

	}

	return through.obj(function(file, encoding, cb) {
		let throwErr = err => {
			this.emit("error", err);
			cb(null, file);
		};

		if (!file.isNull()) {
			if (file.isStream()) {
				const BufferStreams = require("bufferstreams");
				file.contents = file.contents.pipe(new BufferStreams((err, buf, done) => {
					fixBuffer(buf, file).then(buf => {
						done(null, buf);
						cb(null, file);
					}).catch(throwErr);
				}));
				return;
			} else if (file.isBuffer()) {
				fixBuffer(file.contents, file).then(buf => {
					file.contents = buf;
					cb(null, file);
				}).catch(throwErr);
				return;
			}
		}
		cb(null, file);
	});
};
module.exports.hijackcwd = hijack;
