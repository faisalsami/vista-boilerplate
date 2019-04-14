
// Configuring the Articles module
angular.module('vista-boilerplate.home').config(function config( $stateProvider ) {
	$stateProvider.state( 'home', {
		url: '/home',
		views: {
			"main": {
				controller: 'HomeCtrl',
				templateUrl: 'home/views/home.tpl.html'
			}
		},
		data:{ pageTitle: 'Home' }
	});
});