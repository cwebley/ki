var gulp = require('gulp');
	browserify = require('gulp-browserify'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass');

gulp.task('browserify', function() {
    gulp.src('src/js/main.js')
      .pipe(browserify({transform: 'reactify'}))
      .pipe(concat('main.js'))
      .pipe(gulp.dest('../public/dist/js'));
});

gulp.task('sass', function() {
	gulp.src('src/sass/app.scss')
		.pipe(sass().on('error',sass.logError))
		.pipe(gulp.dest('../public/dist/css'));
});

gulp.task('copy', function() {
    gulp.src('src/index.html')
      .pipe(gulp.dest('../public/dist'));
    gulp.src('src/assets/**/*.*')
      .pipe(gulp.dest('../public/dist/assets'));
});

gulp.task('default',['browserify', 'sass', 'copy']);

gulp.task('watch', function() {
    gulp.watch('src/**/*.*', ['default']);
});

