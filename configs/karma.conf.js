// Karma configuration
// Generated on Wed Apr 20 2016 11:58:09 GMT-0500 (Central Daylight Time)

module.exports = function (config) {
  const base = {

    
    plugins: [
      'karma-sauce-launcher',
      'karma-ie-launcher',
    ],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['IE'],

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5,

    browserNoActivityTimeout: 120000,
    captureTimeout: 120000
  };
  var args = process.argv.slice(2);
  var usingSauceLabs = process.env.TRAVIS || args.some(function (value) {
    return value.match(/--sauce-creds/i);
  });

  if (usingSauceLabs) {
    var sauceLabsConfig = require("./sauceLabs.conf");
    sauceLabsConfig(base);
  }
  config.set(base);
  return base;
}