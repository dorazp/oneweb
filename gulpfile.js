var gulp = require('gulp');
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var connect = require('gulp-connect');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var hb = require('gulp-hb');
var rename = require("gulp-rename");

var production = process.env.NODE_ENV === 'production';

/*
 |--------------------------------------------------------------------------
 | Compile LESS stylesheets.
 |--------------------------------------------------------------------------
 */

//使用connect启动一个Web服务器
gulp.task('connect', function () {
    connect.server({
        root: 'build',
        livereload: true
    });
});

gulp.task('clean', function () {
    // return gulp.src('build', {read: false})
    //            .pipe(clean());
});

gulp.task('static', function () {
    gulp.src(['src/images/**/*'])
        .pipe(connect.reload())
        .pipe(gulp.dest('build/images'));

    gulp.src(['src/fonts/**/*'])
        .pipe(connect.reload())
        .pipe(gulp.dest('build/fonts'));
});


gulp.task('js', function () {
    gulp.src('src/**/*.js')
        .pipe(connect.reload())
        .pipe(gulp.dest('build/'));
});

gulp.task('html', function () {

    // gulp-hb用法参考 [REF] #https://www.npmjs.com/package/gulp-hb
    var hbStream = hb()
        // Partials 
        .partials('./src/templates/module/**/*.hbs')
        .partials('./partials/layouts/**/*.{hbs,js}')
        .partials({
            boo: '{{#each boo}}{{greet}}{{/each}}',
            far: '{{#each far}}{{length}}{{/each}}'
        })
 
        // Helpers 
        .helpers('./helpers/**/*.js')
        .helpers({
            'repeat': require('handlebars-helper-repeat'),
            'import': require('handlebars-helper-import')(hb.handlebars),
            'raw': function(options) { return options.fn(this);}
        })
 
        // Decorators 
        .decorators('./decorators/**/*.js')
        .decorators({
            baz: function () {  },
            qux: function () {  }
        })
 
        // Data 
        .data('./global.json')
        .data('./data/**/*.{js,json}')
        .data({
            lorem: 'dolor',
            ipsum: 'sit amet'
        });

    gulp.src('./src/templates/*.hbs')
        .pipe(hbStream)
        .pipe(rename(function (path) {
            path.extname = ".html"
        }))
        .pipe(gulp.dest('build/templates'));
});

gulp.task('styles', function() {
  return gulp.src('src/css/*.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulpif(production, cssmin()))
    .pipe(gulp.dest('build/css'))
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.less', 'src/**/*.hbs'], ['styles', 'js', 'html', 'static']);
});

gulp.task('default', ['clean', 'connect', 'styles', 'js', 'html', 'static', 'watch']);