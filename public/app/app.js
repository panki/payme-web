(function() {
    'use strict';
    var app = angular.module('app', [
        'ui.bootstrap',
        'ui.mask',
        'credit-cards',
        'smoothScroll',
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
    
    app.run(['$rootScope', '$location', '$anchorScroll', 'smoothScroll', '$timeout', function($rootScope, $location, $anchorScroll, smoothScroll, $timeout) {
        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
            var id = $location.search().to;
            var max_tries = 20;
            
            function tryScrollTo() {
                var e = document.getElementById(id);
                if (e) {
                    smoothScroll(e);
                } else {
                    max_tries--;
                    if (max_tries > 0) { $timeout(tryScrollTo, 100); }
                }
            }
            
            if (id) {
                tryScrollTo();
            }
        });
    }]);
})();
