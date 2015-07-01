var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');


gulp.task('web-less', function() {
    return gulp.src('./web/public/less/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/web'));
});

gulp.task('web-js', function() {
    return gulp.src('./web/public/js/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('web.js'))
        .pipe(gulp.dest('public/web'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('public/web'));
});

gulp.task('default', function() {
    gulp.start('web-less', 'web-js');
});

gulp.task('dev', function() {
    var web = require('./web/main');
    web.listen(3000);
    
    gulp.watch('web/public/**/*.less', ['web-less']);
    gulp.watch('web/public/**/*.js', ['web-js']);
});
