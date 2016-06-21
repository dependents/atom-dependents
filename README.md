# Dependents

> Navigate front-end codebases

* Supports JavaScript (AMD, CommonJS, ES6)
* Supports CSS (Sass, Stylus)

### Configuring settings

These can be specified by creating a `.deprc` file with the following
settings in the root directory of your codebase:

```
{
  "root": "public/assets/js",
  "config": "public/assets/js/config.js",  # Optional
  "webpack_config": "public/assets/js/webpack.config.js",  # Optional
  "styles_root": "public/assets/sass",       # Optional
  "exclude": ['jquery.js', 'require.js'],  # Optional
  "build_config": "public/assets/js/build.json", # Optional
  "node_path": "/my/node/install/folder"   # Optional
}
```

* You must supply a value for either `root` or `styles_root`

Settings explanation:

* `"root"`: the location where your JS files reside
* `"config"`: the location of your RequireJS configuration for AMD codebases
* `"webpack_config"`: the location of your Webpack configuration
* `"styles_root"`: the location of your stylesheets (Sass, Stylus)
* `"exclude"`: a list of files and folder names to exclude in the search for dependents
* `"build_config"`: the location of your requirejs build configuration file
* `"node_path"`: the location of your node executable

Please modify the values according to your codebase.

### Menu Options

You can find other features of this plugin from:

Packages -> Dependents

Or by right clicking on a file and going to the Dependents menu

### Keyboard Shortcuts

* Jump to Dependency: `Alt + Click` (or `CMD + Alt + Right Arrow`) on the import name.
* Find Dependents: `CMD + Alt + Up Arrow`

Use `Ctrl` instead of `CMD` for Windows/Linux.
