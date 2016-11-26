var fs = require("fs");
var path = require("path");

var rootDir = path.resolve(__dirname, "..")
var packageVersion = require(path.resolve(rootDir, "package.json")).version;




function createNpmIgnore(content){
	fs.writeFile(path.resolve(rootDir, ".npmignore"), content.join('\n'));
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
    packageData.version = process.env.TRAVIS_TAG;
    fs.writeFileSync(path.resolve(rootDir, "dist/src/package.json"), JSON.stringify(packageData, null, 2));
}

function createNpmrc(){
    var npmToken = process.env.NPM_TOKEN;
    fs.writeFileSync('.npmrc', '//registry.npmjs.org/:_authToken=' + npmToken +'\n');
}

createNpmrc();
createNpmIgnore(["*.spec.*"]);
copyFile(path.resolve(rootDir, "README.md"), path.resolve(rootDir, "dist/src/README.md"));
updatePackage();