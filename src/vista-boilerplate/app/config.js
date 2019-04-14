// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'vista-boilerplate';
	var applicationModuleVendorDependencies = ['templates-vista-boilerplate-app', 'templates-vista-boilerplate-common', 'ui.router', 'ngMaterial', 'plusOne', 'ewdjsClient'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();