(function() {
    'use strict';

    var module = angular.module('app.invoice', [
        'ngRoute',
        'app.invoice.done',
        'app.invoice.draft',
        'app.invoice.sent-owner',
        'app.invoice.sent-payer']);

    module.controller('InvoiceCtrl', ['$scope', '$compile', '$templateRequest', 'Client',
        function($scope, $compile, $templateRequest, client) {
            $scope.client = client;
            $scope.state = 'loading';
            $scope.error = null;
            $scope.child = null;

            // ng-init
            $scope.session = null;
            $scope.invoiceId = null;
            $scope.accountId = null;

            // Should be called from ng-init;
            $scope.init = function(session, invoiceId) {
                $scope.session = session;
                $scope.accountId = session.account_id;
                $scope.invoiceId = invoiceId;
                client.sessionId = session.id;

                $scope.loadInvoice();
            };

            $scope.onError = function(error) {
                $scope.state = 'failed';
                $scope.error = error;
            };

            $scope.loadInvoice = function() {
                $scope.state = 'loading';

                client.invoices.get($scope.invoiceId)
                    .then($scope.onInvoiceLoaded)
                    .catch($scope.onError);
            };

            $scope.onInvoiceLoaded = function(invoice) {
                $scope.state = 'loaded';
                $scope.invoice = invoice;
                $scope.reloadChild();
            };
            
            $scope.sendInvoice = function(form) {
                return client.invoices.send($scope.invoiceId, form).then(function(invoice) {
                    $scope.invoice = angular.copy(invoice);
                    return invoice;
                });
            };
            
            $scope.cancelInvoice = function() {
                return client.invoices.cancel($scope.invoiceId).then(function(invoice) {
                    $scope.invoice = angular.copy(invoice);
                    return invoice;
                });
            };
            
            $scope.refuseInvoice = function(reason) {
                return client.invoices.refuse($scope.invoiceId, reason).then(function(invoice) {
                    $scope.invoice = angular.copy(invoice);
                    return invoice;
                });
            };
            
            $scope.payInvoice = function(form) {
                return client.invoices.pay($scope.invoiceId, form).then(function(invoice) {
                    $scope.invoice = angular.copy(invoice);
                    return invoice;
                });
            };

            $scope.reloadChild = function() {
                var invoice = $scope.invoice;
                var accountId = $scope.accountId;
                var isOwner = invoice.owner_id === accountId;
                
                switch ($scope.invoice.state) {
                    case 'draft':
                        if (isOwner) {
                            $scope.showChild('/public/build/app/invoice/draft.html');
                            break;
                        }

                        $scope.onError(new Error('Счет не найден'));
                        break;

                    case 'sent':
                        if (isOwner) {
                            $scope.showChild('/public/build/app/invoice/sent-owner.html');
                        } else {
                            $scope.showChild('/public/build/app/invoice/sent-payer.html');
                        }
                        break;

                    case 'paid':
                    case 'failed':
                    case 'expired':
                    case 'refused':
                    case 'cancelled':
                        if (isOwner) {
                            $scope.showChild('/public/build/app/invoice/done-owner.html');
                        } else {
                            $scope.showChild('/public/build/app/invoice/done-payer.html');
                        }
                        break;
                }
            };
            
            $scope.showChild = function(templateUrl) {
                $templateRequest(templateUrl).then(function(template) {
                    var childScope = $scope.$new();
                    var child = $compile(template)(childScope);
                    $('#invoice-child-view').html(child);
                }).catch(function(error) {
                    $scope.onError(error);
                });
            };
        }]);
})();
