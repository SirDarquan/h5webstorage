var fs = require("fs");
var path = require("path");

var rootDir = path.resolve(__dirname, "..")
var packageVersion = require(path.resolve(rootDir, "package.json")).version;




function createNpmIgnore(){
	var files = fs.readdirSync(rootDir);
    var ndx = files.indexOf("README.md");
    files.splice(ndx,1);

    ndx = files.indexOf("package.json");
    files.splice(ndx, 1);

	fs.writeFile(path.resolve(rootDir, ".npmignore"), files.join('\n'));

}
function copyFile(source, target) {
    return new Promise(function(resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on('error', reject);
        var wr = fs.createWriteStream(target);
        wr.on('error', reject);
        wr.on('finish', resolve);
        rd.pipe(wr);
    });
}

function getDirList(path){
    return fs.readdirSync(path);
}

function copyFiles(sourceDir, targetDir){
    var files = getDirList(sourceDir);
    files.forEach(function(item){
        !item.match(/\.(spec|map)/) &&
        copyFile(path.resolve(sourceDir, item), path.resolve(targetDir, item));
    })
}

function updatePackage(){
    var packageData = require(path.resolve(rootDir, "src/package.json"));
    packageData.version = packageVersion;
    fs.writeFileSync(path.resolve(rootDir, "dist/src/package.json"), JSON.stringify(packageData, null, 2));
}

function createNpmrc(){
    var npmToken = process.env.NPM_TOKEN;
    fs.writeFileSync('.npmrc', '//registry.npmjs.org/:_authToken=' + npmToken +'\n');
}

createNpmrc();
//createNpmIgnore();
//copyFiles(path.resolve(rootDir, "dist/src"), rootDir);
copyFile(path.resolve(rootDir, "README.md"), path.resolve(rootDir, "dist/src/README.md"));
//copyFile(path.resolve(rootDir, "src/package.json"),path.resolve(rootDir, "dist/src"));
updatePackage();