module.exports = function (config) {
	config.sauceLabs = {
		testName: "h5webstorage",
		startConnect: false,
		recordVideo: false,
		recordScreenshots: false,
		captureTimeout: 60000,
	};

	if (!process.env.TRAVIS) {
		var fs = require("fs");
		var args = process.argv.slice(2);
		try {
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
	else {
		config.sauceLabs.build = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')'
		config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
	}
	config.singleRun = true;

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
		SL_Edge_Mezzo: {
			base: "SauceLabs",
			browserName: "microsoftedge",
			version: "latest-1",
			platform: 'Windows 10'
		},
		SL_Edge_Omega: {
			base: "SauceLabs",
			browserName: "microsoftedge",
			version: "latest-2",
			platform: 'Windows 10'
		}/*,
		SL_Safari_Prime:{
			base: "SauceLabs",
			browserName: "safari",
			version: "11.0",
			platform: "macOS 10.13",
			disabled: true
		},
		SL_Safari_Mezzo:{
			base: "SauceLabs",
			browserName: "safari",
			version: "10.1",
			platform: "macOS 10.12",
			disabled: true
		},
		SL_Safari_Omega:{
			base: "SauceLabs",
			browserName: "safari",
			version: "9.0",
			platform: "OS X 10.11",
			disabled: true
		},
		SL_iOS_Safari_Prime:{
			base: "SauceLabs",
			browserName: "Safari",
			platformName: "iOS",
			platformVersion: "10.0",
			deviceName: "iPhone Simulator",
			appiumVersion: "1.6.1",
			disabled: true
		},
		SL_iOS_Safari_Omega:{
			base: "SauceLabs",
			browserName: "Safari",
			platformName: "iOS",
			platformVersion: "9.3",
			deviceName: "iPhone Simulator",
			appiumVersion: "1.6.1",
			disabled: true
		}*/
	};
	config.browsers = Object.keys(config.customLaunchers).filter(b=> config.customLaunchers[b].disabled !== true);
	if(config.reporters){
		config.reporters.push("saucelabs");
	}
	else{
		config.reporters = ['saucelabs'];
	}
}