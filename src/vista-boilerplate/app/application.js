
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
	$urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $mdBottomSheet, $state, $log ) {
    $scope.tabs = [
        {
            name: 'Home',
            id: 'homeTab',
            contentId: 'homeTab-content',
            sref: 'home',
            InitialView: 'main'
        },
        {
            name: 'About',
            id: 'aboutTab',
            contentId: 'aboutTab-content',
            sref: 'about',
            InitialView: 'main'
        },
        {
            name: 'Docs',
            id: 'docsTab',
            contentId: 'docsTab-content',
            sref: 'docs',
            InitialView: 'main'
        }
    ];
    $scope.selectedIndex = 0;
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $log.log(toState);
		if ( angular.isDefined( toState.data.pageTitle ) ) {
            angular.forEach($scope.tabs, function(value, key){
                if(value.sref == toState.name){
                    $scope.selectedIndex = key;
                }
            });
			$scope.pageTitle = toState.data.pageTitle + ' | vista-boilerplate' ;
		}
	});
	$scope.next = function() {
		$scope.selectedIndex = Math.min($scope.selectedIndex + 1, 2) ;
        $state.go($scope.tabs[$scope.selectedIndex].sref);
	};
	$scope.previous = function() {
		$scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
        $state.go($scope.tabs[$scope.selectedIndex].sref);
	};
	$scope.listItemClick = function() {
		$mdBottomSheet.hide();
	};
	$scope.showGridBottomSheet = function($event) {
		$scope.alert = '';
		$mdBottomSheet.show({
			templateUrl: 'home/views/bottom-sheet-grid-template.tpl.html',
			controller: 'AppCtrl',
			targetEvent: $event
		}).then(function(clickedItem) {

		});
	};
});