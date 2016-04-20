// Karma configuration
// Generated on Wed Apr 20 2016 11:58:09 GMT-0500 (Central Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['systemjs','jasmine'],
    
    plugins:[
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-systemjs'
    ],
    
    systemjs:{
      serveFiles:[
        'node_modules/**/*.js',
        'dist/src/*.js',
      ],
      includeFiles:[
        'node_modules/angular2/bundles/angular2-polyfills.js'
      ],
      config:{
        defaultJSExtensions: true,
        paths:{
          systemjs: "node_modules/systemjs/dist/system.js",
          'system-polyfills': "node_modules/systemjs/dist/system-polyfills.js",
        },
        transpiler: null,
        map:{
          "angular2": "node_modules/angular2",
          "rxjs": "node_modules/rxjs",
        }
      }
    },

    // list of files / patterns to load in the browser
    files: [
      {pattern: 'dist/src/*.spec.js', included: true},
    ],


    // list of files to exclude
    exclude: [
      'src/api.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
