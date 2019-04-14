
// Configuring the Articles module
angular.module('vista-boilerplate.about').config(function config( $stateProvider ) {
	$stateProvider.state( 'about', {
		url: '/about',
		views: {
			"main": {
				controller: 'AboutCtrl',
				templateUrl: 'about/views/about.tpl.html'
			}
		},
		data:{ pageTitle: 'What is It?' }
	});
});