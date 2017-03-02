'use strict';
var     gulp    =   require('gulp'),
        concat  =   require('gulp-concat'),
        uglify  =   require('gulp-uglify'),
        jsdoc   =   require('gulp-jsdoc3'),
        pump    =   require('pump'),
        exec    =   require('child_process').exec;

//var libs = ['jquery', 'underscore', 'backbone'];

gulp.task('concat-and-compress-js', function (callback) {
    pump(
        [
            gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/underscore/underscore.js', 'node_modules/backbone/backbone.js', 'node_modules/lodash/dist/lodash.js', 'node_modules/jointjs/dist/*.js', 'src/client/js/test.js']),
            concat('db-diagrams.min.js'),
            //uglify(),
            gulp.dest('dist/client/js')
        ],
        callback
    );
});

gulp.task('concat-css', function(callback) {
   pump(
       [
           gulp.src(['node_modules/jointjs/dist/joint.min.css', 'src/client/css/*.css']),
           concat('db-diagrams.min.css'),
           gulp.dest('dist/client/css')
       ],
       callback
   );
});

gulp.task('prepare-test', ['prepare-dist'], function(callback) {
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

gulp.task('prepare-dist', ['concat-css', 'concat-and-compress-js']);

gulp.task('default', ['prepare-test']);
