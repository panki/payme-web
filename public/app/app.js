(function() {
    'use strict';
    var app = angular.module('app', ['ui.bootstrap', 'credit-cards',
        'app.index',
        'app.client',
        'app.filters',
        'app.services',
        'app.directives',
        'app.invoice',
        'app.invoice_new',
        'autosizeInput', 'ui.mask']);

    app.config(['$routeProvider', '$locationProvider', '$httpProvider', 'datepickerPopupConfig',
        function($routeProvider, $locationProvider, $httpProvider, datepickerPopupConfig) {
            $locationProvider.html5Mode(true);
            $httpProvider.defaults.withCredentials = true;
            datepickerPopupConfig.showButtonBar = false;
            datepickerPopupConfig.appendToBody = true;
        }]);
})();
