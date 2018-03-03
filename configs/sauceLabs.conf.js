module.exports = function (config) {
	config.sauceLabs = {
		testName: "h5webstorage",
		startConnect: false,
		recordVideo: false,
		recordScreenshots: false,
		captureTimeout: 60000,
	};

	if (!process.env.TRAVIS) {
		setupSauceLabsCreds(config);
	}
	else {
		config.sauceLabs.build = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')'
		config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
	}
	config.singleRun = true;

	config.customLaunchers = require('./browsers');
	config.browsers = Object.keys(config.customLaunchers).filter(b => config.customLaunchers[b].disabled !== true);
	config.reporters = config.reporters || [];
	config.reporters.push("saucelabs");
}

function setupSauceLabsCreds(config) {
	try {
		var fs = require("fs");
		var args = process.argv.slice(2);
		const credsFileArg = args.find((value) => value.match(/sauce-creds=.+/i));
		const credsFile = credsFileArg.match(/sauce-creds=(.+)/i)[1];
		const sauceCreds = require(credsFile);
		config.sauceLabs.username = sauceCreds.username;
		config.sauceLabs.accessKey = sauceCreds.accessKey;
		config.sauceLabs.startConnect = true;
	}
	catch (e) {
		throw new Error("SauceLabs credentials were not supplied.\n" + e);
	}	
}
