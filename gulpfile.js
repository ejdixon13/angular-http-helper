var gulp = require('gulp')
    , sass = require('gulp-sass')
    , sourcemaps = require('gulp-sourcemaps')
    , autoprefixer = require('gulp-autoprefixer')
    , ngannotate = require('gulp-ng-annotate')
    , uglify = require('gulp-uglify')
    , stripdebug = require('gulp-strip-debug')
    , concat = require('gulp-concat')
    , browserSync = require('browser-sync')
    , config = require('./gulp.config')()
    , util = require('gulp-util')
    , watch = require('gulp-watch')
    , del = require('del')
    , rename = require('gulp-rename')
    , plumber = require('gulp-plumber')
    , wiredep = require('wiredep')
    , plugins = require('gulp-load-plugins')()
    , runSequence = require('run-sequence');



/*******************************
 * ON ERROR
 * ****************************/
var onErrorGen = onErrorGenFunc;

/*******************************
 * END Tasks for ALM
 * ****************************/


gulp.task('default', ['prod'], function () {
    'use strict';
});

gulp.task('local', [], function () {
    'use strict';

    console.log('Starting BrowserSync');
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.task('watch', function(){
        gulp.watch(config.js, ['js-watch']);
        gulp.watch(['index.html'], browserSync.reload);
        gulp.watch(config.appScss, ['sass']);
    });
    gulp.task('js-watch', ['js'], browserSync.reload);

    gulp.start('watch');
});

/*******************************
 * Delete build folder
 * ****************************/
gulp.task('clean', function(cb) {
    return del([config.buildTarget], cb);
});


/*******************************
 * Make build folder
 * ****************************/
gulp.task('build', ['clean'], function (cb) {
    'use strict';
    console.log('Entered build phase');
    return runSequence('sass', 'js', 'wiredep', cb);
});

/***************************************************************************
 * SASS
 * Convert app.scss file to css, cachebust and copy to build folder
 *
 * *************************************************************************/
gulp.task('sass', function () {
    'use strict';
    //manages all things css and sass.

    return gulp.src('./src/' + config.appName + '.scss')
        .pipe(plumber(onErrorGen))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rename(config.appName + '.css'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.buildTarget))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

/***************************************************************************
 * JS
 * concats minifies, and uglifies all NON thirdparty js files and copies
 * to build folder ['unitTests']
 * *************************************************************************/
gulp.task('js', function () {
    'use strict';
    //build the final js output
    return gulp.src(config.js)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(ngannotate())
        .pipe(stripdebug())
        .pipe(concat(config.appName + '.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildTarget));
});

/*****************************************************************************************************
 * WIREDEP
 * Injects scripts into our index.html file
 *****************************************************************************************************/
gulp.task('wiredep', function () {
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe(plugins.inject(gulp.src(config.js.concat(config.appCss)), { relative: true }))
        .pipe(gulp.dest('./'));
});

/******************************************************************************************
 * ERROR function
 * ****************************************************************************************/
function onErrorGenFunc(err) {
    util.beep();

    var error
        , message = util.colors.red('\n-----------------------------------');

    message += util.colors.red('\nSass Error!');
    message += util.colors.yellow('\n' + err.message);
    message += util.colors.yellow('\non line: ' + err.line + ' at character: ' + err.column);
    message += util.colors.white('\nin ' + err.file);
    message += util.colors.red('\n-----------------------------------');

    error = new util.PluginError('SASS', {
        message: message
    });

    console.log(error);
    this.emit('end');
}
