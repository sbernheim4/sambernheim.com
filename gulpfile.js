const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync');
const reload = browserSync.reload;

gulp.task('buildHTML', function() {
	return gulp.src('html/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('minihtml'))
		.pipe(browserSync.stream());
});


gulp.task('buildCSS', function() {
	return gulp.src('scss/main.scss')
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(concat('index.css'))
		.pipe(gulp.dest('server/public'))
		.pipe(browserSync.stream());
});

gulp.task('buildJS', function() {
	return gulp.src('js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(babel())
		.pipe(concat('index.js'))
		.pipe(gulp.dest('server/public'))
		.pipe(browserSync.stream());
})

gulp.task('browser-sync', () => {
	browserSync.init({
		proxy: 'localhost:1337',
		port: 5000
	});
});

// watch all css files for changes
gulp.task('watch', function() {
	gulp.watch('scss/*.scss', ['buildCSS']);
	gulp.watch('js/*.js', ['buildJS']);
	gulp.watch('html/*.html', ['buildHTML']);
});

// The default task (called when you run `gulp` from cli)
// first run buildCSS, then buildJS, and then start watching
gulp.task('default', ['browser-sync', 'buildCSS', 'buildJS', 'buildHTML','watch']);

gulp.task('buildProduction', ['buildHTMLProd', 'buildJSProd', 'buildCSSProd']);

gulp.task('buildHTMLProd', function() {
	return gulp.src('html/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('minihtml'))
});

gulp.task('buildCSSProd', function() {
	return gulp.src('scss/main.scss')
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(concat('index.css'))
		.pipe(gulp.dest('server/public'))
});

gulp.task('buildJSProd', function() {
	return gulp.src('js/*.js')
		.pipe(babel())
		.pipe(concat('index.js'))
		.pipe(gulp.dest('server/public'))
})

