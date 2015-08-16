(function() {
    'use strict';
    var app = angular.module('app', ['ui.bootstrap', 'credit-cards',
        'app.index',
        'app.client',
        'app.filters',
        'app.services',
        'app.directives',
        'app.invoice',
        'autosizeInput', 'ui.mask']);

    app.config(['$httpProvider', 'datepickerPopupConfig',
        function($httpProvider, datepickerPopupConfig) {
            $httpProvider.defaults.withCredentials = true;
            datepickerPopupConfig.showButtonBar = false;
            datepickerPopupConfig.appendToBody = true;
        }]);
})();
