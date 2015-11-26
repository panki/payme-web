(function() {
    'use strict';

    angular.module('app.services', [])
    .factory('cardTypeDetector', function() {
        return function (cardNumber) {
            if (cardNumber.match(/^4/)) {
                return 'visa';
            } else if (cardNumber.match(/^5[1-5]/)) {
                return 'mastercard';
            } else if (cardNumber.match(/^3[47]/)) {
                return 'american-express';
            } else if (cardNumber.match(/^6(?:011|5)/)) {
                return 'discover';
            } else if (cardNumber.match(/^(?:2131|1800|35)/)) {
                return 'jcb';
            } else if (cardNumber.match(/^3(?:0[0-5]|[68])/)) {
                return 'diners-club';
            } else if (cardNumber.match(/^5018|5020|5038|5893|6304|67(59|61|62|63)|0604/)) {
                return 'maestro';
            } else {
                return '';
            }
        };
    })
    .factory('gaTracker', [ '$rootScope', '$window', '$location', function ($rootScope, $window, $location) {

        var tracker = {};

        tracker.trackPageView = function(path) {
            if ($window.ga) {
                $window.ga('set', 'page', path || $location.path());
                $window.ga('send', 'pageview');
            }
        };

        tracker.trackInvoiceState = function(invoice) {
            this.trackPageView('/invoice/' + invoice.state)
        };

        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
            tracker.trackPageView(newRoute);
        });

        return tracker;
    }])
    .factory('fbTracker', [ '$rootScope', '$window', function ($rootScope, $window) {

        var tracker = {};

        tracker.trackPageView = function(event) {
            if ($window.fbq) {
                $window.fbq('track', event || 'ViewContent');
            }
        };

        tracker.trackInvoiceState = function(invoice) {
            switch (invoice.state) {
                case 'draft':
                    this.trackPageView('CompleteRegistration');
                    break;

                case 'sent':
                    this.trackPageView('AddPaymentInfo');
                    break;

                case 'paid':
                    this.trackPageView('Purchase', {value: invoice.amount, currency: 'RUR'});
                    break;
            }
        };

        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
            tracker.trackPageView();
        });

        return tracker;
    }]);
}());