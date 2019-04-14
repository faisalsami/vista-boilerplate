/**
 * This file contains all the configurations required in the build process
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `dist_dir` folder is where our projects resides ready for deployment once they are
   * completely built.
   */
  build_dir: 'build',
  dist_dir: 'dist',

  getBanner: function(app){
      var banner = '/**\n' +
          ' * '+ app.name +  ' - v' + app.version + ' - ' + grunt.template.today("yyyy-mm-dd") + '\n' +
          ' * ' + app.homepage + '\n' +
          ' *\n' +
          ' * Copyright (c) ' + grunt.template.today("yyyy") + ' ' + app.author + '\n' +
          ' * Licensed ' + app.license.type + ' ' + app.license.url + '\n' +
          ' */\n';
      return banner;
  },
  //The app array contains all the apps in vista-boilerplate environment
  vista_apps : [
      {
          name: 'vista-boilerplate',
          version: '0.0.1',
          homepage: 'https://github.com/ohstech/vista-boilerplate',
          author: 'Qazi Faisal Sami',
          license: {
              type: 'Apache',
              url: 'https://github.com/ohstech/vista-boilerplate/blob/master/LICENSE'
          },
          vendor_files: {
              js: [
                  'vendor/angular/angular.js',
                  'vendor/angular-animate/angular-animate.js',
                  'vendor/angular-aria/angular-aria.js',
                  'vendor/angular-material/angular-material.js',
                  'vendor/angular-ui-router/release/angular-ui-router.js',
                  'vendor/angular-ui-utils/ui-utils.js',
                  'vendor/angular-mocks/angular-mocks.js'
              ],
              css: [
                  'vendor/angular-material/angular-material.css'
              ],
              assets: [
              ],
              min: {
                  js: [
                      'vendor/angular/angular.min.js',
                      'vendor/angular-animate/angular-animate.min.js',
                      'vendor/angular-aria/angular-aria.min.js',
                      'vendor/angular-material/angular-material.min.js',
                      'vendor/angular-ui-router/release/angular-ui-router.min.js',
                      'vendor/angular-ui-utils/ui-utils.min.js',
                      'vendor/angular-mocks/angular-mocks.js'
                  ],
                  css: [
                      'vendor/angular-material/angular-material.min.css'
                  ]
              }
          },
          modules: [
              'home',
              'about'
          ]
      }
  ],

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  }


};
