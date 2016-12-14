var packages = {
	'example': { main: 'index.js', defaultExtension: 'js' },
	'rxjs': { defaultExtension: 'js' },
	'h5webstorage':{main: 'index.js', defaultExtension: 'js'}
};
var packageNames = [
	'@angular/common',
	'@angular/compiler',
	'@angular/core',
	'@angular/forms',
	'@angular/http',
	'@angular/platform-browser',
	'@angular/platform-browser-dynamic',
	'@angular/router',
	'@angular/router-deprecated',
	'@angular/testing',
	'@angular/upgrade',
];
packageNames.forEach(function (pkgName) {
	var name = pkgName.match(/\/([\w-]+)/)[1];
	packages[pkgName] = { main: 'bundles/${name}.umd.js'.replace("${name}", name), defaultExtension: 'js' };
});

System.config({
	defaultJSExtensions: true,
	map: {
		"@angular": "../node_modules/@angular",
		"rxjs": "../node_modules/rxjs",
		"example": "../../dist/example",
		"h5webstorage": "../dist/src"
	},
	packages: packages
});
