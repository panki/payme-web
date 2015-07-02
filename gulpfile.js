var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var jshint = require('gulp-jshint');
var filter = require('gulp-filter');
var less = require('gulp-less');
var mainBowerFiles = require('main-bower-files');
var minifyCss = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');


gulp.task('clean', function(cb) {
    del(['public/build/**/*'], cb)
});

gulp.task('deps:js', function() {
    var files = mainBowerFiles({
        checkExistence: true
    });
    
    return gulp.src(files, {base: 'public/deps'})
        .pipe(filter('**/*.js'))
        .pipe(concat('deps.js'))
        
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('public/build'));
});

gulp.task('deps:less', function() {
    var files = mainBowerFiles({
        checkExistence: true
    });
    
    return gulp.src(files, {base: 'public/deps'})
        .pipe(filter('**/*.less'))
        .pipe(less())
        .pipe(concat('deps.css'))
        
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(gulp.dest('public/build'));
});

gulp.task('web:less', function() {
    return gulp.src('./public/web/less/main.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('web.css'))
        
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/build'));
});

gulp.task('web:js', function() {
    return gulp.src('./public/web/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        
        .pipe(concat('web.js'))
        
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/build'));
});

gulp.task('dev', function() {
    gulp.start('web:js', 'web:less');
    
    gulp.watch('public/web/**/*.less', ['web:less']);
    gulp.watch('public/web/**/*.js', ['web:js']);
        
    nodemon({
        script: 'web/main.js',
        ext: 'js',
        watch: './web'
    });
});

gulp.task('default', function() {
    gulp.start('deps:js', 'deps:less', 'web:js', 'web:less');
});
