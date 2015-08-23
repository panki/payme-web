(function() {
    'use strict';
    var app = angular.module('app', [
        'ui.bootstrap',
        'ui.mask',
        'credit-cards',
        'app.index',
        'app.client',
        'app.filters',
        'app.services',
        'app.directives',
        'app.invoice'
    ]);

    app.config(['$httpProvider', 'datepickerPopupConfig',
        function($httpProvider, datepickerPopupConfig) {
            $httpProvider.defaults.withCredentials = true;
            datepickerPopupConfig.showButtonBar = false;
            datepickerPopupConfig.appendToBody = true;
        }]);
    
    app.run(['$rootScope', '$location', '$anchorScroll', function($rootScope, $location, $anchorScroll) {
        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
            console.log($location.hash());
            if($location.hash()) $anchorScroll();  
        });
    }]);
})();
