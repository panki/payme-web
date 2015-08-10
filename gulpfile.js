var gulp = require('gulp');
var addStream = require('add-stream');
var b2v = require('buffer-to-vinyl');
var concat = require('gulp-concat');
var del = require('del');
var debug = require('gulp-debug');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var gulpNgConfig = require('gulp-ng-config');
var filter = require('gulp-filter');
var less = require('gulp-less');
var mainBowerFiles = require('main-bower-files');
var minifyCss = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var web_config = require('./payme_web/config');


function makeNgConfig() {
    var json = JSON.stringify({config: web_config.ng});

    return b2v.stream(new Buffer(json), 'config.js')
        .pipe(gulpNgConfig('app', {createModule: false}));
}


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
        .pipe(gulp.dest('public/build/js'));
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
        .pipe(gulp.dest('public/build/css'));
});

gulp.task('app:less', function() {
    return gulp.src('./public/app/styles/app.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('app.css'))

        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/build/css'));
});

gulp.task('app:js', function() {
    return gulp.src('./public/app/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))

        .pipe(addStream.obj(makeNgConfig()))
        .pipe(concat('app.js'))

        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/build/js'));
});

gulp.task('app:templates', function() {
    var locals = {
        config: web_config
    };
    return gulp.src('./public/app/templates/**/*.jade')
        .pipe(jade({
            locals: locals
        }))
        .pipe(gulp.dest('./public/build/templates/'))
});

gulp.task('app:fonts', function() {
    return gulp.src(['./public/deps/font-awesome/fonts/*.*'])
        .pipe(gulp.dest('./public/build/fonts/'));
});

gulp.task('dev', function() {
    gulp.start('app:js', 'app:less', 'app:templates');

    gulp.watch('public/app/**/*.less', ['app:less']);
    gulp.watch('public/app/**/*.js', ['app:js']);
    gulp.watch('public/app/**/*.jade', ['app:templates']);
    
    nodemon({
        script: 'payme_web/main.js',
        ext: 'js',
        watch: './payme_web'
    });
});

gulp.task('default', function() {
    gulp.start('deps:js', 'deps:less', 'app:js', 'app:less', 'app:templates', 'app:fonts');
});
