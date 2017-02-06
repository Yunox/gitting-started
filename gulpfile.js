const gulp = require('gulp'),
    gutil = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs-extra'),
    rename = require("gulp-rename"),
    w3cjs = require('gulp-w3cjs'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,

    input = {
        'html': 'source/*.html',
        'images': 'source/assets/images/**/*.*',
        'sass': 'source/assets/scss/**/*.scss',
        'javascript': 'source/assets/javascript/**/*.js',
        'vendorjs': 'public/assets/javascript/vendor/**/*.js'
    },
    output = {
        'html': 'public',
        'stylesheets': 'public/assets/stylesheets',
        'sourcestylesheets': 'source/assets/stylesheets',
        'javascript': 'public/assets/javascript',
        'images': 'public/assets/images',
        'network': ''
    };

/* run the watch task when gulp is called without arguments */
gulp.task('default', ['watch']);

/* run javascript through jshint */
gulp.task('jshint', function () {
    gulp.src(input.javascript)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
});

/* compile scss files */
gulp.task('build-css', function () {
    gulp.src(input.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output.sourcestylesheets))
        .pipe(gulp.dest(output.stylesheets))
        .pipe(reload({ stream:true }))

});

/* minify css */
gulp.task('minify-css', function () {
    gulp.src(output.sourcestylesheets + '/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(output.stylesheets))
});

/* concat javascript files, minify if --type production */
gulp.task('build-js', function () {
        gulp.src(input.javascript)
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        //only uglify if gulp is ran with '--type production'
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output.javascript))
        .pipe(reload({ stream:false }))
});

/* optimize images */
gulp.task('image-opt', function () {
    gulp.src(input.images)
        .pipe(imagemin())
        .pipe(gulp.dest(output.images))
        .pipe(reload({ stream:true }))
});

/*copy html */
gulp.task('copy-html', function () {
    gulp.src(input.html)
        .pipe(gulp.dest(output.html))
        .pipe(reload({ stream:true }))
});

/* Validate HTML */
gulp.task('w3cjs', function () {
    gulp.src(output.html + '/*.html')
        .pipe(w3cjs())
        .pipe(w3cjs.reporter())
});

/*sync browser with every edit*/
gulp.task('browser-sync', function() {
  bs.init({
    proxy: {
      target: "localhost:8080", // can be [virtual host, sub-directory, localhost with port]
      ws: true // enables websockets
    }
});
});

/*copy to network path */
gulp.task('publish-internal', function () {
    fs.copy(output.html, output.network, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log("Copied to: " + output.network);
        }
    })
    gulp.start('w3cjs');

});

gulp.task('serve', function() {
    browserSync.init({
        server: {
        baseDir: "public",
      },
      port: "1337",
      ui: {
       port: "7331"
       }
    });
  });


/*swallow errors */
function swallowError (error) { error.end(); }

/* Watch these files for changes and run the task on update */
gulp.task('watch', function () {
  gulp.start('serve');
    gulp.watch(input.javascript, ['jshint', 'build-js']);
    gulp.watch(input.sass, ['build-css']);
    gulp.watch(input.html, ['copy-html']);
    gulp.watch(input.images, ['image-opt']);
});

/*Initial*/
gulp.task('init', ['copy-html', 'build-css', 'build-js', 'image-opt']);
