# Developing H5webstorage

## Tasks

The following commands are available through `npm run` (or, if configured
`ngl`):

Command     | Purpose
---         | ---
build       | Runs code through build process via Angular compiler (ngc)
g           | Generate code files (see above)
lint        | Verify code matches linting rules
start       | Run Webpack's dev-server on project (can be run as `npm start`)
[test](#unit)        | Execute unit tests (can be run as `npm test <type>`)
tagVersion  | Creates tag for new version and publishes

## Adding External Scripts

To add an external script, add it with a `script-loader!` prefix to the
`scripts` array of `entry` in `webpack/webpack.dev.js` (for the dev server)
and add it to the files array of `karma.conf.js` (for testing).

An example, adding the file at `node_modules/ext-dep/dist/dep.min.js`:

```javascript
/** webpack.dev.js **/
module.exports = {
    // other config
    entry: {
        app: [ path.resolve(rootDir, 'examples', 'example.main') ],
        scripts: [
            // this is the external script line
            'script-loader!' + path.resolve(rootDir, 'node_modules/ext-dep/dep.min')
        ],
        vendor: [ path.resolve(rootDir, 'src', 'vendor')],
        styles: [ path.resolve(rootDir, 'examples', 'styles.scss') ]
    },
    // rest of config
};

/** karma.conf.js **/
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            // this is the external script line
            'node_modules/hammerjs/hammer.min.js',
            { pattern: './src/test.js', watched: false }
        ],
        // rest of config
    });
};
```

## <a name="unit"></a>Unit Testing

Unit testing is done using Karma and Webpack. The setup is all done during the `initialize` command.
The provided testing commands will watch your files for changes.

The two following command is provided by default:

```shell
npm test <type>
```

This command calls the script at `tasks/test.js` and runs the Karma test runner to execute the tests.
Prior to running Karma, the `test` command looks for a command line argument, if the argument is known,
it will run the associated configuration, otherwise it will run the default configuration.

#### Configurations

Type | Testing TypeScript
---     | ---
default | Run through PhantomJS one time with no file watching
all     | Run through Chrome & PhantomJS with files being watched & tests automatically re-run
headless| Run through PhantomJS with files being watched & tests automatically re-run
watch   | Run through Chrome with files being watched & tests automatically re-run

Note that Chrome still requires a manual refresh on the Debug tab to see updated test results.

## <a name="pack"></a>Packaging

Packaging is as simple as publishing to NPM by doing

```shell
npm run tagVersion
```

To test your packages output before publishing, you can run

```shell
npm pack
```

Which will generate a compressed file containing your library as it will look when packaged up and
published to NPM. The basic structure of a published library is:

```
|__bundles/
   |__h5webstorage.umd.js
   |__h5webstorage.umd.js.map
   |__h5webstorage.umd.min.js
   |__h5webstorage.bundle.min.js.map
|__index.d.ts
|__package.json
|__README.md
|__*.d.ts
|__h5webstorage.d.ts
|__h5webstorage.module.d.ts
|__h5webstorage.es5.js
|__h5webstorage.es5.js.map
|__h5webstorage.js
|__h5webstorage.js.map
|__h5webstorage.metadata.json
```

As you can see, the packaging removes any files specific to developing your
library. It, more importantly, creates distribution files for usage with many
different module systems.
