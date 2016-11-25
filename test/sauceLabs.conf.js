module.exports = function (config) {
	config.sauceLabs = {
		testName: "h5webstorage",
		startConnect: false,
		recordVideo: false,
		recordScreenshots: false,
		captureTimeout: 60000,
	};

	var testingLocally = !process.env.TRAVIS;


	if (testingLocally) {
		var fs = require("fs");
		var args = process.argv.slice(2);
		var credsFileArg = args.find(function (value) {
			return value.match(/--sauce-creds=.+/i);
		});
		if (!credsFileArg) {
			throw new Error("SauceLabs credentials must supplied when testing locally.");
		}
		var credsFile = credsFileArg.match(/--sauce-creds=(.+)/i)[1];
		console.log("credsFile", credsFile);
		var sauceCreds = null;
		try {
			sauceCreds = require(credsFile);
		}
		catch (e) {
			throw new Error("SauceLabs credentials were not supplied.\n" + e);
		}
		config.sauceLabs.username = sauceCreds.username;
		config.sauceLabs.accessKey = sauceCreds.accessKey;
		config.sauceLabs.startConnect = true;
	}
	else {
		config.sauceLabs.build = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')'
		config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
	}

	config.customLaunchers = {
		SL_Chrome_Prime: {
			base: "SauceLabs",
			browserName: "chrome",
			version: "latest",
			platform: 'Windows 10'
		},
		SL_Chrome_Mezzo: {
			base: "SauceLabs",
			browserName: "chrome",
			version: "latest-1",
			platform: 'Windows 10'
		},
		SL_Chrome_Omega: {
			base: "SauceLabs",
			browserName: "chrome",
			version: "latest-2",
			platform: 'Windows 10'
		},
		SL_Firefox_Prime: {
			base: "SauceLabs",
			browserName: "firefox",
			version: "latest",
			platform: 'Windows 10'
		},
		SL_Firefox_Mezzo: {
			base: "SauceLabs",
			browserName: "firefox",
			version: "latest-1",
			platform: 'Windows 10'
		},
		SL_Firefox_Omega: {
			base: "SauceLabs",
			browserName: "firefox",
			version: "latest-2",
			platform: 'Windows 10'
		},
		SL_IE: {
			base: "SauceLabs",
			browserName: "internet explorer",
			version: "latest",
			platform: 'Windows 10'
		},
		SL_Edge_Prime: {
			base: "SauceLabs",
			browserName: "microsoftedge",
			version: "latest",
			platform: 'Windows 10'
		},
		SL_Edge_Omega: {
			base: "SauceLabs",
			browserName: "microsoftedge",
			version: "13",
			platform: 'Windows 10'
		}
	};
	config.browsers = Object.keys(config.customLaunchers);
	config.reporters.push("saucelabs");
}