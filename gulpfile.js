const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');

gulp.task('minifyCSS', function() {
	return gulp.src('css/*.css')
	.pipe(cleanCSS())
	.pipe(gulp.dest('minifiedCSS'));
});
