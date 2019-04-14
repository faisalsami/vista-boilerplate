module.exports = function ( grunt ) {

  /**
  * Load required Grunt tasks. These are installed based on the versions listed
  * in `package.json` when you do `npm install` in this directory.
  */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-nodemon');

  /**
  * Load in our build configuration file.
  */
  var userConfig = require( './build.config.js' );
  var fs = require('fs');
  var ldash = require('lodash');
  var htmljs = function(){
    var hobj = {};
    for(var i=0; i< userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      hobj[app.name + '-app'] = {
        options: {
          base: 'src/' + app.name + '/app'
        },
        src: [ 'src/' + app.name + '/app/**/*.tpl.html' ],
        dest: userConfig.build_dir + '/' + app.name + '/' + 'templates-app.js'
      };
      hobj[app.name + '-common'] = {
        options: {
          base: 'src/' + app.name + '/common'
        },
        src: [ 'src/' + app.name + '/common/**/*.tpl.html' ],
        dest: userConfig.build_dir + '/' + app.name + '/' + 'templates-common.js'
      };
    }
    return hobj;
  };
  var coffee = function(){
    var cobj = {};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      cobj[app.name + '-coffee'] = {
        options: {
          bare: true
        },
        expand: true,
        cwd: '.',
        src: [ 'src/' + app.name + '/**/*.coffee', '!src/' + app.name + '/**/*.spec.coffee' ],
        dest: userConfig.build_dir + '/' + app.name,
        ext: '.js'
      };
    }
    return cobj;
  };
  var sass = function(){
    var bobj = {};
    var cobj = {};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      var btarget = userConfig.build_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.css';
      var ctarget = userConfig.build_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.min.css';
      bobj[btarget] = 'src/' + app.name + '/sass/main.scss';
      cobj[ctarget] = 'src/' + app.name + '/sass/main.scss';
    }
    var sobj = {
      build: {
        files: bobj,
        options: {
          sourcemap: 'none'
        }
      },
      dist: {
        files: cobj,
        options: {
          style: 'compressed',
          sourcemap: 'none'
        }
      }
    };
    return sobj;
  };
  var concatBuildAppJs = function(){
    var cobj = {files: {}};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      for(var j=0; j<app.modules.length; j++){
        cobj.files[userConfig.build_dir + '/' + app.name + '/app/' + app.name + '.' + app.modules[j] + '-' + app.version + '.js'] = [
          'src/' + app.name + '/app/' + app.modules[j] + '/**/*.js',
          '!src/' + app.name + '/app/' + app.modules[j] + '/**/*.spec.js'
        ];
      }
    }
    return cobj;
  };
  var copyBuildTests = function(){
    var cobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      cobj.files.push({
        src: ['**/*.spec.js'],
        dest: userConfig.build_dir + '/' + app.name + '/tests/',
        cwd: 'src/' + app.name,
        expand: true
      });
    }
    return cobj;
  };
  var copyBuildAppAssets = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: [ '**' ],
        dest: userConfig.build_dir + '/' + app.name + '/assets/',
        cwd: 'src/' + app.name + '/assets',
        expand: true
      });
    }
    return aobj;
  };
  var copyDistAppAssets = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: [ '**' ],
        dest: userConfig.dist_dir + '/' + app.name + '/assets/',
        cwd: 'src/' + app.name + '/assets',
        expand: true
      });
    }
    return aobj;
  };
  var copyBuildVendorAssets = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: app.vendor_files.assets,
        dest: userConfig.build_dir + '/' + app.name + '/',
        cwd: '.',
        expand: true
      });
    }
    return aobj;
  };
  var copyDistVendorAssets = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: app.vendor_files.assets,
        dest: userConfig.dist_dir + '/' + app.name + '/',
        cwd: '.',
        expand: true
      });
    }
    return aobj;
  };
  var copyBuildAppJs = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: [
          'common/**/*.js',
          'app/config.js',
          'app/application.js',
          '!common/**/*.spec.js',
        ],
        dest: userConfig.build_dir + '/' + app.name + '/',
        cwd: 'src/' + app.name,
        expand: true
      });
    }
    return aobj;
  };
  var copyBuildVendorJs = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: app.vendor_files.js,
        dest: userConfig.build_dir + '/' + app.name + '/',
        cwd: '.',
        expand: true
      });
    }
    return aobj;
  };
  var copyDistVendorJs = function(){
      var aobj = {files: []};
      for(var i=0; i<userConfig.vista_apps.length; i++){
        var app = userConfig.vista_apps[i];
        aobj.files.push({
          src: app.vendor_files.min.js,
          dest: userConfig.dist_dir + '/' + app.name + '/',
          cwd: '.',
          expand: true
        });
      }
    return aobj;
  };
  var copyBuildVendorCss = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: app.vendor_files.css,
        dest: userConfig.build_dir + '/' + app.name + '/',
        cwd: '.',
        expand: true
      });
    }
    return aobj;
  };
    var copyDistAppVendorCss = function() {
      var aobj = {files: []};
        for (var i = 0; i < userConfig.vista_apps.length; i++) {
          var app = userConfig.vista_apps[i];
          aobj.files.push({
            src: app.vendor_files.min.css,
            dest: userConfig.dist_dir + '/' + app.name + '/',
            cwd: '.',
            expand: true
          });
          aobj.files.push({
            src: userConfig.build_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.min.css',
            dest: userConfig.dist_dir + '/' + app.name + '/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          });
        }
        return aobj;
    };
  var copyAppServerModule = function(){
    var aobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      aobj.files.push({
        src: [
          '*.js'
        ],
        dest: 'node_modules/',
        cwd: 'src/' + app.name + '/ewdjs modules/',
        expand: true
      });
    }
    return aobj;
  };
  var setupEWDJS = function(){
    var eobj = {files: [
      {
        src: [
          'www/**'
        ],
        dest: 'node_modules/ewdjs/',
        cwd: '.',
        expand: true
      }
    ]};
    return eobj;
  };
  var copyEwdMonitorApp = function(){
    var eobj = {files: [
      {
        src: [
          'ewdjs/*.*'
        ],
        dest: userConfig.build_dir + '/',
        cwd: 'node_modules/ewdjs/www',
        expand: true
      },
      {
        src: [
          'ewd/ewdMonitor/*.*'
        ],
        dest: userConfig.build_dir + '/',
        cwd: 'node_modules/ewdjs/www',
        expand: true
      }
    ]};
    return eobj;
  };
  var indexDist = function(){
    var iobj = {};
    iobj['apps'] = [];
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      var aobj = {
        name: app.name,
        version: app.version,
        dir: userConfig.dist_dir + '/' + app.name,
        license: app.license,
        js: [],
        css: []
      };
        for(var j=0; j<app.vendor_files.min.js.length; j++){
            aobj.js.push(app.vendor_files.min.js[j]);
        }
      aobj.js.push(userConfig.dist_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.min.js');
        for(j=0; j<app.vendor_files.min.css.length; j++){
            aobj.css.push(app.vendor_files.min.css[j]);
        }
      aobj.css.push(userConfig.dist_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.min.css');
      iobj.apps.push(aobj);
    }
    return iobj;
  };
  var indexBuild = function(){
    var iobj = {};
    iobj['apps'] = [];
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      var aobj = {
          name: app.name,
          version: app.version,
          dir: userConfig.build_dir + '/' + app.name,
          license: app.license,
        js: [],
        css: []
      };
      for(var j=0; j<app.vendor_files.js.length; j++){
        aobj.js.push(app.vendor_files.js[j]);
      }
      aobj.js.push(userConfig.build_dir + '/' + app.name + '/app/config.js');
      aobj.js.push(userConfig.build_dir + '/' + app.name + '/app/application.js');
      for(j=0; j<app.modules.length; j++){
        aobj.js.push(userConfig.build_dir + '/' + app.name + '/app/' + app.name + '.' + app.modules[j] + '-' + app.version + '.js');
      }
      var commonjs = grunt.file.expand('src/' + app.name + '/common/**/*.js');
      for(j=0; j<commonjs.length; j++){
        aobj.js.push(commonjs[j].replace('src/' + app.name + '/',''));
      }
      aobj.js.push(userConfig.build_dir + '/' + app.name + '/' + 'templates-common.js');
      aobj.js.push(userConfig.build_dir + '/' + app.name + '/' + 'templates-app.js');
      for(j=0; j<app.vendor_files.css.length; j++){
        aobj.css.push(app.vendor_files.css[j]);
      }
      aobj.css.push(userConfig.build_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.css');
      iobj.apps.push(aobj);
    }
    return iobj;
  };
  var karmaconfig = function(){
    var kobj = {};
    kobj['apps'] = [];
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      var aobj = {
        name: app.name,
        version: app.version,
        dir: userConfig.build_dir + '/' + app.name,
        units: []
      };
      for(var j=0; j<app.vendor_files.js.length; j++){
        aobj.units.push(app.vendor_files.js[j]);
      }
      aobj.units.push('app/config.js');
      aobj.units.push('app/application.js');
      aobj.units.push('templates-common.js');
      aobj.units.push('templates-app.js');
      for(j=0; j<app.modules.length; j++){
        aobj.units.push('app/' + app.name + '.' + app.modules[j] + '-' + app.version + '.js');
      }
      var commonjs = grunt.file.expand('src/' + app.name + '/common/**/*.js');
      for(j=0; j<commonjs.length; j++){
        aobj.units.push(commonjs[j].replace('src/' + app.name + '/',''));
      }
      for(j=0; j<userConfig.test_files.js.length; j++){
        aobj.units.push(userConfig.test_files.js[j]);
      }
      var tests = grunt.file.expand('src/' + app.name + '/**/*.spec.js');
      for(j=0; j<tests.length; j++){
        aobj.units.push(tests[j].replace('src/' + app.name + '/','tests/'));
      }
      kobj.apps.push(aobj);
    }
    return kobj;
  };
  var ngminDist = function(){
    var nobj = {files: []};
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      var files = [];
      files.push('app/config.js');
      files.push('app/application.js');
      for(var j=0; j<app.modules.length; j++){
        files.push('app/' + app.name + '.' + app.modules[j] + '-' + app.version + '.js');
      }
      var commonjs = grunt.file.expand('src/' + app.name + '/common/**/*.js');
      for(j=0; j<commonjs.length; j++){
        files.push(commonjs[j].replace('src/' + app.name + '/',''));
      }
      nobj.files.push({
        src: files,
        cwd: userConfig.build_dir + '/' + app.name,
        dest: userConfig.build_dir + '/' + app.name,
        expand: true
      });
    }
    return nobj;
  };
  var concatDistJs = function(){
    //Todo: Banner needed to be customized for each application
    var cobj = {
      options: {
        banner: '<%= meta.banner %>'
      },
      files: {}
    };
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      var dest = userConfig.dist_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.js';
      var files = [];
      files.push('module.prefix');
      files.push(userConfig.build_dir + '/' + app.name + '/app/config.js');
      files.push(userConfig.build_dir + '/' + app.name + '/app/application.js');
      for(j=0; j<app.modules.length; j++){
        files.push(userConfig.build_dir + '/' + app.name + '/app/' + app.name + '.' + app.modules[j] + '-' + app.version + '.js');
      }
      var commonjs = grunt.file.expand('src/' + app.name + '/common/**/*.js');
      for(j=0; j<commonjs.length; j++){
        files.push(commonjs[j].replace('src/',userConfig.build_dir + '/'));
      }
      files.push(userConfig.build_dir + '/' + app.name + '/templates-app.js');
      files.push(userConfig.build_dir + '/' + app.name + '/templates-common.js');
      files.push('module.suffix');
      cobj.files[dest] = files;
    }
    return cobj;
  };
  var uglifyDist = function(){
    //Todo: Banner needed to be customized for each application
    var uobj = {
      options: {
        banner: '<%= meta.banner %>'
      },
      files: {}
    };
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      var dest = userConfig.dist_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.min.js';
      uobj.files[dest] = [userConfig.dist_dir + '/' + app.name + '/assets/' + app.name + '-' + app.version + '.js'];
    }
    return uobj;
  };
  var watchHtmlAppHtml = function(){
    var files = [];
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      files.push('src/' + app.name + '/index.html');
    }
    return files;
  };
  var watchTemplates = function(){
    var files = [];
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      files.push('src/' + app.name + '/app/**/*.tpl.html');
      files.push('src/' + app.name + 'common/**/*.tpl.html');
    }
    return files;
  };
  var watchAssets = function(){
    var files = [];
    for(var i=0; i<userConfig.vista_apps.length; i++){
      var app = userConfig.vista_apps[i];
      files.push('src/' + app.name + '/assets/**/*');
    }
    var aobj = {
      files: files,
      tasks: [ 'copy:build_app_assets', 'copy:build_vendor_assets' ]
    };
    return aobj;
  };
  /**
   * This is the configuration object Grunt uses to give each plugin its 
   * instructions.
   */
  var taskConfig = {
    /**
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON("package.json"),

    /**
     * The banner is the comment that is placed at the top of our compiled 
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner:
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.license.type %> <<%= pkg.license.url %>>\n' +
        ' */\n'
    },

    /**
     * Creates a changelog on a new version.
     */
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        template: 'changelog.tpl'
      }
    },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          "package.json", 
          "bower.json"
        ],
        commit: false,
        commitMessage: 'chore(release): v%VERSION%',
        commitFiles: [
          "package.json", 
          "client/bower.json"
        ],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    },    

    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: {
      build: ['<%= build_dir %>'],
      dist: ['<%= dist_dir %>'],
      initialize_ewdjs: ['www/', 'ssl/', 'ewdStart-cache-linux.js','ewdStart-cache-win.js','ewdStart-globals.js','ewdStart-globals-centos-root.js',
                         'ewdStart-globals-win.js','ewdStart-gtm.js','ewdStart-mongo.js','ewdStart-pi.js','ewdStart-pi-mongo.js',
                         'externalMsgTests.js','test-globals.js','test-gtm.js','test-isc-linux.js','test-isc-win.js','test-noDB.js']
    },

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `dist_dir`.
     */
    copy: {
      build_app_assets: copyBuildAppAssets(),
      build_vendor_assets: copyBuildVendorAssets(),
      build_appjs: copyBuildAppJs(),
      build_vendorjs: copyBuildVendorJs(),
      build_vendorcss: copyBuildVendorCss(),
      build_tests: copyBuildTests(),
      initialize_ewdjs: setupEWDJS(),
      build_ewdMonitor: copyEwdMonitorApp(),
      build_serverModules: copyAppServerModule(),
      dist_app_assets: copyDistAppAssets(),
      dist_vendor_assets: copyDistVendorAssets(),
      dist_app_vendor_css : copyDistAppVendorCss(),
      dist_app_js: copyDistVendorJs()
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `build_appjs` target concatenates all the angular modules in an application to one file
       * with version number.
       */
      build_appjs: concatBuildAppJs(),
      /**
       * The `dist_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      dist_js: concatDistJs()
    },

    /**
     * `grunt coffee` compiles the CoffeeScript sources. To work well with the
     * rest of the build, we have a separate compilation task for sources and
     * specs so they can go to different places. For example, we need the
     * sources to live with the rest of the copied JavaScript so we can include
     * it in the final build, but we don't want to include our specs there.
     */
    coffee: coffee(),

    /**
     * `ng-min` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngmin: {
      dist: ngminDist()
    },

    /**
     * Minify the sources!
     */
    uglify: {
      dist: uglifyDist()
    },

    /**
     * `grunt-contrib-sass` handles our SASS compilation and uglification automatically.
     * Only our `main.scss` file is included in compilation; all other files
     * must be imported from this file.
     */
    sass: sass(),

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      src: [
        'src/**/*.js', '!src/**/*.spec.js', '!src//**/assets/**/*.js'
      ],
      test: [
        'src/**/*.spec.js'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        evil: true
      },
      globals: {}
    },

    /**
     * `coffeelint` does the same as `jshint`, but for CoffeeScript.
     * CoffeeScript is not the default in vista-boilerplate, so we're just using
     * the defaults here.
     */
    coffeelint: {
      src: {
        files: {
          src: [ 'src/**/*.coffee', '!src/**/*.spec.coffee' ]
        }
      },
      test: {
        files: {
          src: [ 'src/**/*.spec.coffee' ]
        }
      }
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: htmljs(),

    /**
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: '<%= build_dir %>/vista-boilerplate/karma-unit.js'
      },
      unit: {
        port: 9019,
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: indexBuild(),

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      dist: indexDist()
    },

    /**
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      karma: karmaconfig()
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          ext: 'js,html',
          watch: ['Gruntfile.js', 'server.js']
        }
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed 
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files. 
     */
    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      jssrc: {
        files: [
          'src/**/*.js', '!src/**/*.spec.js', '!src//**/assets/**/*.js'
        ],
        tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_appjs', 'concat:build_appjs', 'copy:build_serverModules' ]
      },

      /**
       * When our CoffeeScript source files change, we want to run lint them and
       * run our unit tests.
       */
      coffeesrc: {
        files: [
          'src/**/*.coffee', '!src/**/*.spec.coffee'
        ],
        tasks: [ 'coffeelint:src', 'coffee', 'karma:unit:run', 'copy:build_appjs' ]
      },

      /**
       * When assets are changed, copy them. Note that this will *not* copy new
       * files, so this is probably not very useful.
       */
      assets: watchAssets(),

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: watchHtmlAppHtml(),
        tasks: [ 'index:build' ]
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: watchTemplates(),
        tasks: [ 'html2js' ]
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      sass: {
        files: [ 'src/**/*.scss' ],
        tasks: [ 'sass' ]
      },

      /**
       * When a JavaScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      jsunit: {
        files: [
          'src/**/*.spec.js'
        ],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      },

      /**
       * When a CoffeeScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      coffeeunit: {
        files: [
          'src/**/*.spec.coffee'
        ],
        tasks: [ 'coffeelint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      }
    }
  };

  grunt.initConfig( ldash.assign( taskConfig, userConfig ) );

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask( 'watch', 'delta' );
  grunt.registerTask( 'watch', [ 'build', 'karma:unit', 'delta' ] );

  /**
   * The default task is to build and compile.
   */
  grunt.registerTask('default',['build', 'dist']);

  /**
   * The 'initialize' tasks will create ewdjs environment and should run once after fork the repository.
   */

  grunt.registerTask('initialize',[
    'copy:initialize_ewdjs', 'clean:initialize_ewdjs'
  ]);

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask('build',[
      'clean:build', 'copy:build_vendorjs', 'copy:build_vendorcss', 'copy:build_ewdMonitor', 'copy:build_serverModules',
      'html2js', 'jshint', 'coffeelint', 'coffee', 'sass:build', 'concat:build_appjs', 'copy:build_vendor_assets',
      'copy:build_tests', 'copy:build_appjs', 'copy:build_app_assets', 'index:build', 'karmaconfig:karma',
      'karma:continuous'
  ]);

  /**
   * The `dist` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask( 'dist', [
    'clean:dist', 'sass:dist', 'copy:dist_app_assets', 'copy:dist_vendor_assets', 'copy:dist_app_vendor_css',
      'copy:dist_app_js', 'ngmin', 'concat:dist_js', 'uglify:dist', 'index:dist'
  ]);

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    var pfunc = function(contents, path){
      return grunt.template.process( contents, {
        data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: app.version,
            license: app.license
        }
      });
    };
    var app = {};
    for(var i=0; i<this.data.apps.length; i++){
      app = this.data.apps[i];
      var jsFiles = [];
      for(var j=0; j<app.js.length; j++){
        jsFiles.push(app.js[j].replace(this.target + '/' + app.name + '/', '' ));
      }
      var cssFiles = [];
      for(j=0; j<app.css.length; j++){
        cssFiles.push(app.css[j].replace(this.target + '/' + app.name + '/', '' ));
      }
      grunt.file.copy('src/' + app.name + '/index.html', app.dir + '/index.html', {
        process: pfunc
      });
    }
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
    var pfunc = function(contents, path){
      return grunt.template.process( contents, {
        data: {
          scripts: jsFiles
        }
      });
    };
    for(var i=0; i<this.data.apps.length; i++){
      var app = this.data.apps[i];
      var jsFiles = app.units;
      grunt.file.copy( 'karma/karma-unit.tpl.js', app.dir + '/karma-unit.js', {
        process: pfunc
      });
    }
  });

};
