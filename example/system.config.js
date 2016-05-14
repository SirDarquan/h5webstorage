var packages = {
	'example': { main: 'index.js', defaultExtension: 'js' },
	'rxjs': { defaultExtension: 'js' },
};
var packageNames = [
	'@angular/common',
	'@angular/compiler',
	'@angular/core',
	'@angular/http',
	'@angular/platform-browser',
	'@angular/platform-browser-dynamic',
	'@angular/router',
	'@angular/router-deprecated',
	'@angular/testing',
	'@angular/upgrade',
];
packageNames.forEach(function (pkgName) {
	packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
});

System.config({
	defaultJSExtensions: true,
	map: {
		"@angular": "../node_modules/@angular",
		"rxjs": "../node_modules/rxjs",
		"example": "../../dist/example"
	},
	packages: packages
});
