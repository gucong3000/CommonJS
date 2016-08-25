"use strict";
const gulp = require("gulp");
const path = require("path");

module.exports = function(config) {
	return function(globs) {
		let postcss = require("./gulp-postcss");

		if(config.cwd){
			postcss.hijackcwd(config.cwd);
		}

		let processors = [
			require("stylefmt")({
				configBasedir: config.cwd,
			}),
			require("stylelint")({
				configBasedir: config.cwd,
			}),
			// css未来标准提前使用
			require("postcss-cssnext")({
				features: {
					"autoprefixer": {
						browsers: ["last 3 version", "ie > 8", "Android >= 3", "Safari >= 5.1", "iOS >= 5"],

						// should Autoprefixer use Visual Cascade, if CSS is uncompressed.
						cascade: false,

						// If you have no legacy code, this option will make Autoprefixer about 10% faster.
						remove: false
					}
				}
			}),

			// scss风格的预处理器
			// require("precss")(),
			// IE8期以下兼容rem
			require("pixrem"),

			// IE9兼容vmin
			require("postcss-vmin"),

			// IE8以下兼容合集
			// require("cssgrace"),
			// background: linear-gradient(to bottom, #1e5799, #7db9e8);输出为IE滤镜
			require("postcss-filter-gradient"),
			// css压缩
			require("cssnano"),
		];

		return gulp.src(globs, config)

		.pipe(postcss(processors, (file => {
			return {
				to: config.dest ? path.resolve(config.cwd, config.dest, file.relative) : undefined,
			}
		})));
	}
};