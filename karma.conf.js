
// configures browsers to run test against
// any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
var browsers =
  (process.env.TEST_BROWSERS || 'PhantomJS')
    .replace(/^\s+|\s+$/, '')
    .split(/\s*,\s*/g);

module.exports = function(karma) {

  karma.set({
    frameworks: [
      'browserify',
      'mocha',
      'chai'
    ],

    files: [
      'test/**/*Spec.js'
    ],

    preprocessors: {
      'test/**/*Spec.js': [ 'browserify' ]
    },

    reporters: [ 'spec' ],

    browsers: browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [
        [ 'babelify', { global: true } ],
        [ 'brfs', { global: true } ]
      ]
    }
  });

};
