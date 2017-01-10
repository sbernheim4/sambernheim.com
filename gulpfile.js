const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sass = require('gulp-sass');

gulp.task('buildCSS', function() {
	return gulp.src('scss/*.css')
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(concat('index.css'))
		.pipe(gulp.dest('server/public'));
});

gulp.task('buildJS', function() {
	return gulp.src('js/*.js')
		.pipe(babel())
		.pipe(concat('index.js'))
		.pipe(gulp.dest('server/public'));
})


// watch all css files for changes
gulp.task('watch', function() {
	gulp.watch('css/*.css', ['buildCSS']);
	gulp.watch('js/*.js', ['buildJS']);

});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch']);
