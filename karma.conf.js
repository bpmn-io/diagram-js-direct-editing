
// configures browsers to run test against
// any of [ 'Chrome', 'Firefox' ]
var browsers =
  (process.env.TEST_BROWSERS || 'ChromeHeadless')
    .replace(/^\s+|\s+$/, '')
    .split(/\s*,\s*/g);

module.exports = function(karma) {

  karma.set({
    frameworks: [
      'webpack',
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/suite.js'
    ],

    preprocessors: {
      'test/suite.js': [ 'webpack' ]
    },

    reporters: [ 'spec' ],

    browsers: browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development'
    }
  });

};
