"use strict";

const through = require("through2");
const beautify = require("js-beautify").js_beautify;
const gutil = require("gulp-util");
const RcLoader = require("rcloader");
const path = require("path");

var rcLoader = new RcLoader(".jsbeautifyrc", {
	defaultFile: path.join(process.cwd(), ".jsbeautifyrc")
});

/**
 * 加载`.jsbeautifyrc`配置文件
 * @param  {String} filePath		文件路径
 * @param  {[Object]} userConfig	用户自定义配置，默认undefined
 * @return {Promise}				Promise对象
 * @returns {Promise.Object}		配置jsbeautify对象
 */
function loadConfig(filePath, userConfig) {
	return new Promise((resolve) => {
		rcLoader.for(filePath, (err, jsbeautifyrc) => {
			resolve(Object.assign({}, jsbeautifyrc || require("js-beautify/js/config/defaults.json"), userConfig || {}));
		});
	});
}

/**
 * gulp 插件，用于json格式化,js格式化功能暂未完成，使用[js-beautify](https://www.npmjs.com/package/js-beautify)
 * 强烈建议前置在`gulp-editorconfig.js`使用
 * @param  {Object}  options 此参数直接传递给[js-beautify](https://www.npmjs.com/package/js-beautify)
 * @return {Function}	gulp插件
 */
module.exports = function(options) {

	/**
	 * 之中buffer对象中的代码
	 * @param  {Buffer} buf  包含代码的buffer对象
	 * @param  {Vinyl}  file  文件对象
	 * @return {Promise}  Promise对象
	 */
	function fixBuffer(buf, file) {

		return loadConfig(file.path, options)

		.then(jsbeautifyrc => {
			file.jsbeautify = jsbeautifyrc;
			let code = buf.toString();
			let newCode = beautify(code, jsbeautifyrc);
			file.jsbeautify.fixed = code !== newCode;

			if (file.jsbeautify.fixed) {
				return new Buffer(newCode);
			} else {
				return buf;
			}
		}).catch(error => {
			var errorOptions = {
				fileName: file.path,
				showStack: true
			};

			// Prevent stream’s unhandled exception from
			// being suppressed by Promise
			throw new gutil.PluginError("gulp-jsbeautify", error, errorOptions);
		});
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
