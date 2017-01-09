const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');

gulp.task('minifyCSS', function() {
	return gulp.src('css/*.css')
		.pipe(cleanCSS())
		.pipe(gulp.dest('minifiedCSS'));
});

gulp.task('buildJS', function() {
	return gulp.src('js/*.js')
		.pipe(babel())
		.pipe(gulp.dest('compiledJS'));
})

// watch all css files for changes
gulp.task('watch', function() {
	gulp.watch('css/*.css', ['minifyCSS']);
	gulp.watch('js/*.js', ['compiledJS']);

});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch']);
