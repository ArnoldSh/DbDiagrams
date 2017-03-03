'use strict';
var     gulp    =   require('gulp'),
        concat  =   require('gulp-concat'),
        rename  =   require('gulp-rename'),
        uglify  =   require('gulp-uglify'),
        pump    =   require('pump'),
        minCss  =   require('gulp-clean-css');

// for npm
/*"scripts": {
    "postinstall": "echo Copy lodash dist... && cd node_modules/lodash && md dist && copy index.js dist && cd dist && rename index.js lodash.js"
}*/

// path variables

var srcLib = {
    'jquery': 'node_modules/jquery/dist/jquery.js',
    'lodash': 'node_modules/lodash/index.js',
    'underscore': 'node_modules/underscore/underscore.js',
    'backbone': 'node_modules/backbone/backbone.js'
};
var jointLibJs = 'node_modules/jointjs/dist/joint.js';
var jointLibCss = 'node_modules/jointjs/dist/joint.css';

var srcJs = 'src/client/js/*.js';
var distJs = 'dist/client/js';

var srcCss = 'src/client/css/*.css';
var distCss = 'dist/client/css';

var distJsName = 'db-diagrams.min.js';
var distCssName = 'db-diagrams.min.css';

gulp.task('rename-lodash', function(callback) {
   pump(
       [
           gulp.src('node_modules/lodash/index.js'),
           rename('lodash.js'),
           gulp.dest('node_modules/lodash/')
       ],
       callback
   );
});

gulp.task('copy-and-compress-js', ['rename-lodash'], function(callback) {

    var mergedJs = [];

    mergedJs.push(srcLib['jquery']);
    mergedJs.push(srcLib['lodash']);
    //mergedJs.push(srcLib['underscore']);
    mergedJs.push(srcLib['backbone']);
    mergedJs.push(jointLibJs);
    mergedJs.push(srcJs);

    pump(
        [
            gulp.src(mergedJs),
            concat(distJsName),
            //uglify(),
            gulp.dest(distJs),
        ],
        callback
    );
});

gulp.task('copy-css', ['rename-lodash'], function(callback) {

    var mergedCss = [];

    mergedCss.push(jointLibCss);
    mergedCss.push(srcCss);

    pump(
        [
            gulp.src(mergedCss),
            concat(distCssName),
            //minCss(),
            gulp.dest(distCss)
        ],
        callback
    );
});

gulp.task('prepare-test', ['copy-and-compress-js', 'copy-css'], function(callback) {
   pump(
       [
           gulp.src('dist/client/js/db-diagrams.min.js'),
           gulp.dest('test/js'),
           gulp.src('dist/client/css/db-diagrams.min.css'),
           gulp.dest('test/css')
       ],
       callback
   )
});

gulp.task('default', ['prepare-test']);
