const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const webp = require('gulp-webp');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include')


function pages() {
  return src('app/pages/*.html')
  .pipe(include({
    includePaths: 'app/components'
  }))
  .pipe(dest('app'))
  .pipe(browserSync.stream())
}

function buildStyles() {
  return src('app/scss/style.scss')
    .pipe(concat('style.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'], 
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
};

function scripts() {
  return src([
    "app/js/main.js"
  ])
  .pipe(concat("main.min.js"))
  .pipe(uglify())
  .pipe(dest("app/js"))
  .pipe(browserSync.stream())
};

function images(){
  return src([
    'app/images/src/**/*.*',
    '!app/images/src/**/*.svg',
  ])

  .pipe(src('app/images/src/**/*.*'))
  .pipe(newer('app/images'))
  .pipe(webp())
  .pipe(dest('app/images'))
}

function sprite(){
  return src('app/images/*.svg')
  .pipe(svgSprite({
    mode: {
      stack: {
        sprite: '../sprite.svg',
        example: true
      }
    }
  }))
  .pipe(dest('app/images'))
}

function fonts(){
  return src('app/fonts/src/*.*')
  .pipe(fonter({
    formats: ['woff', 'ttf']
  }))
  .pipe(src('app/fonts/*.ttf'))
  .pipe(ttf2woff2())
  .pipe(dest('app/fonts'))
}


function watching() {
  browserSync.init({
    server: {
        baseDir: "app/"
    },
    ui: {
      port: 5500}
  });
  watch(['app/components/*', 'app/pages/*'], pages)
  watch(['app/scss/*.scss'], buildStyles)
  watch(['app/js/main.js'], scripts)
  watch(['app/images/src'], images)
  watch(['app/fonts/src'], fonts)
  watch(['app/**/*.html']).on('change', browserSync.reload)
};

function cleanDist(){
  return src('dust')
  .pipe(clean())
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/images/*.*',
    '!app/images/*.svg',
    'app/images/sprite.svg',
    'app/fonts/*.*',
    'app/*.html'
    ], {base : 'app'})
    .pipe(dest('dist'))
}


exports.buildStyles = buildStyles;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.pages = pages;

exports.build = series(cleanDist, building)
exports.default = parallel(buildStyles, scripts, pages, watching)