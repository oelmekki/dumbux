var gulp   = require( 'gulp' );
var babel  = require( 'gulp-babel' );
var rename = require( 'gulp-rename' );
var uglify = require( 'gulp-uglify' );

gulp.task( 'default', [ 'plain', 'min' ]);

gulp.task( 'plain', function(){
  gulp.src( 'lib/index.js' )
      .pipe( babel({ presets: [ 'es2015' ] }) )
      .pipe( rename( 'index.js' ) )
      .pipe( gulp.dest( 'dist/' ) );
});

gulp.task( 'min', function(){
  gulp.src( 'lib/index.js' )
      .pipe( babel({ presets: [ 'es2015' ] }) )
      .pipe( rename( 'index.min.js' ) )
      .pipe( uglify() )
      .pipe( gulp.dest( 'dist/' ) );
});
