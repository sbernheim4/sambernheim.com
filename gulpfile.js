require('dotenv').config();

const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const gulpStylelint = require('gulp-stylelint');

gulp.task('buildHTML', () => {
	return gulp.src('html/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('minihtml'))
		.pipe(browserSync.stream());
});


gulp.task('buildCSS', () => {
	return gulp.src('scss/main.scss')
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(concat('index.css'))
		.pipe(gulp.dest('server/public'))
		.pipe(browserSync.stream());
});

gulp.task('buildJS', () => {
	return gulp.src('js/*.js')
		.pipe(babel())
		.pipe(concat('index.js'))
		.pipe(gulp.dest('server/public'))
		.pipe(browserSync.stream());
})

gulp.task('lintJS', () => {
	return gulp.src('js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('lintCSS', () => {
	return gulp.src('./scss/*.scss')
        .pipe(gulpStylelint({
			reporters: [
				{formatter: 'string', console: true}
			]
		}));
});

gulp.task('lint', () => {
	gulp.start('lintJS')
	gulp.start('lintCSS')
});

gulp.task('browser-sync', () => {
	browserSync.init({
		proxy: `localhost:${process.env.PORT}`,
		port: 5000,
		online: true
	});
});

// watch all css files for changes
gulp.task('watch', () => {
	gulp.watch('scss/*.scss', ['buildCSS', 'lintCSS']);
	gulp.watch('js/*.js', ['buildJS', 'lintJS']);
	gulp.watch('html/*.html', ['buildHTML']);
});

// The default task (called when you run `gulp` from cli)
// first run buildCSS, then buildJS, and then start watching
gulp.task('default', ['browser-sync', 'buildCSS', 'buildJS', 'buildHTML','watch', 'lint']);

gulp.task('buildProduction', ['buildHTMLProd', 'buildJSProd', 'buildCSSProd']);

gulp.task('buildHTMLProd', () => {
	return gulp.src('html/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('minihtml'))
});

gulp.task('buildCSSProd', () => {
	return gulp.src('scss/main.scss')
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(concat('index.css'))
		.pipe(gulp.dest('server/public'))
});

gulp.task('buildJSProd', () => {
	return gulp.src('js/*.js')
		.pipe(babel())
		.pipe(concat('index.js'))
		.pipe(gulp.dest('server/public'))
})

