(function() {
    'use strict';

    var module = angular.module('app.invoice', [
        'ngRoute',
        'app.invoice.cancel',
        'app.invoice.done',
        'app.invoice.draft',
        'app.invoice.refuse',
        'app.invoice.sent-owner',
        'app.invoice.sent-payer']);

    module.controller('InvoiceCtrl', ['$scope', '$compile', '$templateRequest', '$window', '$location', 'Client',
        'gaTracker', 'fbTracker',
        function($scope, $compile, $templateRequest, $window, $location, client, gaTracker, fbTracker) {
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
                client.auth.startSessionPing();
                $scope.loadInvoice();
            };

            $scope.onError = function(error) {
                if (error.status === 404) {
                    $scope.state = 'failed';
                    $scope.error = error;
                    return;
                }
                $scope.error = error;
            };
            
            $scope.clearError = function() {
                $scope.error = null;
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
            
            $scope.saveReceipt = function() {
                $window.location.href = $scope.invoiceId + '/receipt.pdf?download';
            };
            
            $scope.sendSuccess = function () {
                $scope.showChild('/public/build/templates/invoice/send-success.html');    
            };
            
            $scope.showCancel = function() {
                $scope.showChild('/public/build/templates/invoice/cancel.html');
            };

            $scope.showRefuse = function() {
                $scope.showChild('/public/build/templates/invoice/refuse.html');
            };

            $scope.reloadChild = function() {
                var invoice = $scope.invoice;
                var accountId = $scope.accountId;
                var isOwner = invoice.owner_id === accountId;

                gaTracker.trackInvoiceState($scope.invoice);
                fbTracker.trackInvoiceState($scope.invoice);
                
                switch ($scope.invoice.state) {
                    case 'draft':
                        if (isOwner) {
                            $scope.showChild('/public/build/templates/invoice/draft.html');
                            break;
                        }

                        $scope.onError(new Error('Счет не найден'));
                        break;

                    case 'sent':
                        if (isOwner) {
                            $scope.showChild('/public/build/templates/invoice/sent-owner.html');
                        } else {
                            $scope.showChild('/public/build/templates/invoice/sent-payer.html');
                        }
                        break;

                    case 'paid':
                    case 'failed':
                    case 'expired':
                    case 'refused':
                    case 'cancelled':
                        if (isOwner) {
                            $scope.showChild('/public/build/templates/invoice/done-owner.html');
                        } else {
                            $scope.showChild('/public/build/templates/invoice/done-payer.html');
                        }
                        break;
                }

                window.scrollTo(0, 0);
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
