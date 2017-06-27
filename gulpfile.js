// make dependencies listed in package.json available to interact with //
var utilities = require('gulp-util');
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var jshint = require('gulp-jshint');
var buildProduction = utilities.env.production;
var browserSync = require('browser-sync').create();
// var sass = require('gulp-sass');
// var sourcemaps = require('gulp-sourcemaps');

// tells bower-files where to find the bootstrap files we want

var lib = require('bower-files')({
  "overrides":{
    "bootstrap" : {
      "main": [
        "less/bootstrap.less",
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    }
  }
});

// define task concatInterface. retrieve all files named -interface from the js folder and concat them together //

gulp.task('concatInterface', function() {
  return gulp.src(['./js/*-interface.js'])
    .pipe(concat('allConcat.js'))
    .pipe(gulp.dest('./tmp'));
});

// make files ready for the browser, run concatInterface first, then place files in build/js folder //

gulp.task('jsBrowserify', ['concatInterface'], function() {
  return browserify({entries: ['./tmp/allConcat.js'] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/js'));
});

// compress scripts with minify, first run jsBrowserify, then minify scripts and put them in the build folder //

gulp.task("minifyScripts", ["jsBrowserify"], function() {
  return gulp.src("./build/js/app.js")
    .pipe(uglify())
    .pipe(gulp.dest("./build/js"));
});

// get all the js files that bower downloaded, concat, uglify, then place them into the build/js folder where the HTML can point to them //

gulp.task('bowerJS', function () {
  return gulp.src(lib.ext('js').files)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

// get all the files that end in css concat, uglify, then place them into the build/css folder where the HTML can point to them //

gulp.task('bowerCSS', function(){
  return gulp.src(lib.ext('css').files)
  .pipe(concat('vendor.css'))
  .pipe(gulp.dest('./build/css'));
});

// combines tasks jsBower and cssBower into one task to be called on later //

gulp.task('bower', ['bowerJS', 'bowerCSS']);

// clean up any temporary files //

gulp.task("clean", function(){
  return del (['build', 'tmp']);
});

// tells gulp to run minify when deploying our work to a production server. If not, run jsBrowserify //

gulp.task("build", ['clean'], function() {
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
  gulp.start('bower');
  // gulp.start('cssBuild');
});

// runs a built in debugger of sorts on all files in the js folder //

gulp.task('jshint', function(){
  return gulp.src(['js/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

// creates a server that is located in the base directory and not nested in any folders //

gulp.task('serve', ['build'], function(){
  browserSync.init ({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });

//watch for changes in our directories and runs things automatically //

gulp.watch(['js/*.js'], ['jsBuild']);
gulp.watch(['bower.json'], ['bowerBuild']);
gulp.watch(['*.html'], ['htmlBuild']);
// gulp.watch(['scss/*.scss'], ['cssBuild']);
});

// when watching for changes, constantly updates and reloads files with browserSync.reload() //

gulp.task('jsBuild', ['jsBrowserify', 'jshint'], function(){
  browserSync.reload();
});
gulp.task('bowerBuild', ['bower'], function(){
  browserSync.reload();
});
gulp.task('htmlBuild', function(){
  browserSync.reload();
});

// takes any SASS files and compiles them down to CSS to be used //
//
gulp.task('cssBuild', function(){
  return gulp.src('scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});
