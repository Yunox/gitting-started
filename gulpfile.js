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
    return gulp.src(input.javascript)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

/* compile scss files */
gulp.task('build-css', function () {
    return gulp.src(input.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output.sourcestylesheets))
        .pipe(gulp.dest(output.stylesheets));
});

/* minify css */
gulp.task('minify-css', function () {
    return gulp.src(output.sourcestylesheets + '/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(output.stylesheets));
});

/* concat javascript files, minify if --type production */
gulp.task('build-js', function () {
    return gulp.src(input.javascript)
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        //only uglify if gulp is ran with '--type production'
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output.javascript));
});

/* optimize images */
gulp.task('image-opt', function () {
    gulp.src(input.images)
        .pipe(imagemin())
        .pipe(gulp.dest(output.images))
});

/*copy html */
gulp.task('copy-html', function () {
    return gulp.src(input.html)
        .pipe(gulp.dest(output.html));
});

gulp.task('w3cjs', function () {
    gulp.src(output.html + '/*.html')
        .pipe(w3cjs())
        .pipe(w3cjs.reporter());
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
});

/* Watch these files for changes and run the task on update */
gulp.task('watch', function () {
    gulp.watch(input.javascript, ['jshint', 'build-js']);
    gulp.watch(input.sass, ['build-css']);
    gulp.watch(input.html, ['copy-html','w3cjs']);
    gulp.watch(input.images, ['image-opt']);
});
