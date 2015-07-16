// import modules
var gulp = require('gulp');
var watch = require('gulp-watch');
var wiredep = require('wiredep').stream;
var inject = require('gulp-inject');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var jshint = require('gulp-jshint');
var compass = require('compass-importer');
var series = require('stream-series');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var reload = browserSync.reload;
var mainBowerFiles = require('main-bower-files');

// declare paths
var paths = {
    html: './src/**/*.html',
    index: './src/index.html',
    scripts: ['./src/assets/**/*.js', './src/app/**/*.js'],
    glob: './src/app/**/*.js',
    assetsglob: './src/assets/**/*.js',
    sass: './src/styles/sass/*.scss',
    css: './src/styles/*.css'
}

//<======== Clean and Production ========>

// clean build
gulp.task('build-clean', function(cb){
    del(['dist'], cb);
});

gulp.task('bower', function() {
    return gulp.src(mainBowerFiles(), { base: 'bower_components'})
        .pipe(gulp.dest('dist/lib')); 
})
                                                                          

// minify and copy js with sourcemaps
gulp.task('minify-scripts', function(){
    var stream = gulp.src(paths.scripts, { base: 'src' })
        .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(concat('all.min.js'))
        .pipe(sourcemaps.write('../'))
        .pipe(gulp.dest('dist/js'));
    return stream;
});

// minify html into dist
gulp.task('minify-html', function() {
    return gulp.src(paths.html)
        .pipe(gulp.dest('dist'));
});

// minify and copy css
gulp.task('minify-css', ['sass'], function(){ 
    return gulp.src(paths.css)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(minifyCss())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write('../'))
        .pipe(gulp.dest('dist/css'));
});
gulp.task('build', function(){
    runSequence('build-clean', ['bower', 'minify-html', 'minify-scripts', 'minify-css']);
});

//<=========== Set Up Index =============>
// wire dependencies to index.html
gulp.task('wiredep', function() {
    return gulp.src(paths.index)
        .pipe(wiredep())
        .pipe(gulp.dest('./src'));
});
// injecting css and js href to index
gulp.task('inject-css', function() {
    var sources = gulp.src(paths.css, {read: false});
    return gulp.src(paths.index)
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('./src'));
});
gulp.task('inject-js', function() {
    var jsGlobSrc = gulp.src(paths.glob, {read: false});
    var jsAssetsGlobSrc = gulp.src(paths.assetsglob, {read: false});
    return gulp.src(paths.index)
        .pipe(inject(series(jsAssetsGlobSrc, jsGlobSrc), {relative: true}))
        .pipe(gulp.dest('./src'));
});
gulp.task('inject', function(){
    runSequence('wiredep', 'inject-js', 'inject-css');
});

//<============= Watch and Sync=================>
// compile sass to css with browsersync
gulp.task('sass', function() {
    return gulp.src(paths.sass)
        .pipe(sass({
            includePaths: ['./bower_components/compass-mixins/lib']
            //importer: [compass]
        }).on('error', sass.logError))
        .pipe(gulp.dest('./src/styles'))
        .pipe(browserSync.stream());
});
// lint js files
gulp.task('jshint', function() {
    gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});
// watch and lint js ; browsersync css/html
gulp.task('serve', ['sass', 'jshint'], function(){
    browserSync.init({
        server: {
            baseDir: './src',
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });
    gulp.watch(paths.scripts, ['jshint']);
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.html).on('change', reload);
    gulp.watch(paths.scripts).on('change', reload);
})

gulp.task('default', ['serve']);
