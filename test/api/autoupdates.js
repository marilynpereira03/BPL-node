'use strict'; /*jslint mocha:true, expr:true */
var node = require('../node.js');
var assert = require('chai').assert;


var txId = '';
var autoUpdate = '/api/autoupdates/get?id=' + txId;
var getLatest = '/api/autoupdates/getLatest';

describe('Test autoupdates API', function () {

    describe('Test getAutoUpdate API', function () {

        it('Should pass the when there are no autoupdate tx', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body).to.have.property('success').to.equal(false);
                node.expect(res.body).to.have.property('error').to.equal('Couldn\'t find auto update: '+txId);
                done();
            });
        });


        it('should return get autoupdate transaction success to true', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body).to.have.property('success').to.equal(true);
                done();
            });
        });

        it('Verify whether update has property transaction', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body.update).to.have.property('transactionId').to.be.a('string');
                done();
            });
        });

        it('Verify whether update has property version label', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body.update).to.have.property('versionLabel').to.be.a('string');
                done();
            });
        });

        it('Verify whether update tx has property triggerHeight', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body.update).to.have.property('triggerHeight').to.be.a('number');
                done();
            });
        });

        it('Verify whether update tx has property ipfsHash', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body.update).to.have.property('ipfsHash').to.be.a('string');
                done();
            });
        });


        it('Verify whether update tx has property verifyingTransactionId', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body.update).to.have.property('verifyingTransactionId').to.be.a('string');
                done();
            });
        });

        it('Verify whether update tx has property cancellation status', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body.update).to.have.property('cancellationStatus').to.be.a('boolean');
                done();
            });
        });

        it('Verify whether tx  triggerHeight is > 0', function (done) {
            node.get(autoUpdate, function (err, res) {
                assert.notEqual(res.body.update.triggerHeight, 0, 'Trigger Height should not be 0');
                done();
            });
        });

        it('should return get autoupdate transaction Id', function (done) {
            node.get(autoUpdate, function (err, res) {
                node.expect(res.body.update.transactionId).to.equal(txId);
                done();
            });
        });

        it('Verify whether txId has value', function (done) {
            node.get(autoUpdate, function (err, res) {
                assert.notEqual(res.body.update.transactionId, '', 'Transaction id should not be empty');
                done();
            });
        });

        it('Verify txId length', function (done) {
            node.get(autoUpdate, function (err, res) {
                assert.equal((res.body.update.transactionId).length, 64, 'Transaction id is not valid');
                done();
            });
        });


        it('Should return true if transaction does not exists', function (done) {
            node.get(autoUpdate + '1234', function (err, res) {
                node.expect(res.body).to.have.property('success').to.equal(false);
                done();
            });
        });

    });


    describe('Test getLatest API', function () {


        it('Should pass the when there are no autoupdate tx', function (done) {
            node.get(getLatest, function (err, res) {
                node.expect(res.body).to.have.property('success').to.equal(false);
                node.expect(res.body).to.have.property('error').to.equal('Couldn\'t find latest auto update.');
                done();
            });
        });


        it('Should return getLatest transaction success to true', function (done) {
            node.get(getLatest, function (err, res) {
                node.expect(res.body).to.have.property('success').to.equal(true);
                done();
            });
        });

        it('Verify whether getLatest has property transaction', function (done) {
            node.get(getLatest, function (err, res) {
                node.expect(res.body.update).to.have.property('transactionId').to.be.a('string');
                done();
            });
        });

        it('Verify whether getLatest has property version label', function (done) {
            node.get(getLatest, function (err, res) {
                node.expect(res.body.update).to.have.property('versionLabel').to.be.a('string');
                done();
            });
        });

        it('Verify whether getLatest tx has property triggerHeight', function (done) {
            node.get(getLatest, function (err, res) {
                node.expect(res.body.update).to.have.property('triggerHeight').to.be.a('number');
                done();
            });
        });

        it('Verify whether getLatest tx has property ipfsHash', function (done) {
            node.get(getLatest, function (err, res) {
                node.expect(res.body.update).to.have.property('ipfsHash').to.be.a('string');
                done();
            });
        });

        it('Verify whether getLatest tx has property cancellation status', function (done) {
            node.get(getLatest, function (err, res) {
                node.expect(res.body.update).to.have.property('cancellationStatus').to.be.a('boolean');
                done();
            });
        });


    });

});