import gulp from 'gulp';
import sass from 'gulp-sass';
import browserSync  from 'browser-sync';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import jsmin from 'gulp-jsmin';
import cssmin from 'gulp-cssmin';
import babel from 'gulp-babel';
import fileinclude from 'gulp-html-extend';
import { series, parallel } from 'gulp';


//compile scss to css + create sourcemaps
const style = () => {
  return (
    gulp.src("src/scss/import.scss")
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(rename('buddy.css'))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(browserSync.stream())
  );
};

//minify css + create sourcemaps
const cssMinify = () => {
  return (
    gulp.src("build/css/buddy.css")
    .pipe(sourcemaps.init())
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/css"))
  );
};

//transpile ES6 to ES5 + sourcemaps
const script = () => {
  return (
    gulp.src("src/js/script.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', function(err) {
        console.log('[Compilation Error]');
        console.log(err.fileName + ( err.loc ? `( ${err.loc.line}, ${err.loc.column} ): ` : ': '));
        console.log('error Babel: ' + err.message + '\n');
        console.log(err.codeFrame);
        this.emit('end');
    })
    .pipe(rename('buddy.js')) 
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/js"))
    .pipe(browserSync.stream())
  );
};

//minify js + create sourcemaps
const jsMinify = () => {
  return (
    gulp.src("build/js/buddy.js")
    .pipe(sourcemaps.init())
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/js"))
  );
};

//copy html files from src to build
const includes = () => {
  return (
    gulp.src(['src/*.html'])
    .pipe(fileinclude({
      annotations: false,
      verbose: false
    }))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
  );
};

//copy assets folder from src to build
const copyAssets = () => {
  return  (
    gulp.src('src/assets/**')
    .pipe(gulp.dest('build/assets'))
    .pipe(browserSync.stream())
  );
};

//watch when scss files are edited to compile
const watch = () => {
  gulp.watch(["src/scss/import.scss", "src/scss/**/*.scss"], style);
  gulp.watch("src/js/script.js", script)
  gulp.watch(["src/*.html", "src/includes/*.html"], includes)
  gulp.watch("src/assets/**", copyAssets)
}

//create a web server
const server = () => {
  browserSync.init({
    server: "build/"
  });
};

//tasks 
exports.style = style;
exports.cssMinify = cssMinify;
exports.script = script;
exports.jsMinify = jsMinify;
exports.includes = includes;
exports.copyAssets = copyAssets;
exports.watch = watch;
exports.server = server;

//default task
exports.default = parallel(server, series(style, cssMinify), series(script, jsMinify), includes, copyAssets, watch);