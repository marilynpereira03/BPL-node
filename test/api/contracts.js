'use strict'; /*jslint mocha:true, expr:true */

var node = require('./../node.js');

//
// /api/contracts test cases
//

describe('GET /api/contracts', function () {

	it('using no params should fail', function (done) {
		node.get('/api/contracts', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: address or publicKey');
			done();
		});
	});

	it('using no publicKey should fail', function (done) {
		node.get('/api/contracts?publicKey=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: address or publicKey');
			done();
		});
	});

	it('using incorrect publicKey should fail', function (done) {
		var publicKey = '1305fc33b96bab644e075849d4e5013e6b3a068ca6cfb734705fe8837c966dc4bf';
		node.get('/api/contracts?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Contracts not found: '+publicKey);
			done();
		});
	});

	it('using incorrect integer publicKey should fail', function (done) {
		var publicKey = 30333;
		node.get('/api/contracts?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Expected type string but found type integer');
			done();
		});
	});

	it('using incorrect integer publicKey should fail', function (done) {
		var publicKey = 'x303330356663333362393662616236343465303735383439643465353031336536623361303638636136636662373334373035666538383337633936366463346266';
		node.get('/api/contracts?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Object didn\'t pass validation for format publicKey: '+publicKey);
			done();
		});
	});

	//DO CHANGE
	it('using correct publicKey should ok', function (done) {
		var publicKey = '0305fc33b96bab644e075849d4e5013e6b3a068ca6cfb734705fe8837c966dc4bf';//node.gAccount.password
		node.get('/api/contracts?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('contracts').that.is.an('array');
			res.body.contracts.forEach(function (contracts) {
				node.expect(contracts).to.have.property('type').that.is.a('number');
				node.expect(contracts).to.have.property('cause').that.is.a('object');
				node.expect(contracts).to.have.property('effect').that.is.a('object');
				node.expect(contracts.cause).to.have.property('address').that.is.a('string');
				node.expect(contracts.cause).to.have.property('balance').that.is.a('number');
				node.expect(contracts.cause).to.have.property('minConfirmations').that.is.a('number');
				node.expect(contracts.effect).to.have.property('transactionId').that.is.a('string');
			});
			done();
		});
	});
});

//
// /api/contracts?address= test cases
//

describe('GET /api/contracts', function () {

	it('using no address should fail', function (done) {
		node.get('/api/contracts?address=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 1');
			done();
		});
	});

	it('using address length greater than 34 should fail', function (done) {
		var address = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
		node.get('/api/contracts?address='+address, function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too long (68 chars), maximum 34');
			done();
		});
	});

	it('using incorrect address should fail', function (done) {
		var address = 'AAAAAAAAAAAAAAAAAAAAAA';
		node.get('/api/contracts?address='+ address , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Contracts not found: '+address);
			done();
		});
	});

	it('using incorrect integer address should fail', function (done) {
		var address = 30333;
		node.get('/api/contracts?address='+ address , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Contracts not found: '+address);
			done();
		});
	});

	//DO CHANGE
	it('using correct publicKey should ok', function (done) {
		var address = 'AAAAAAAAAAAAAAAAAAAAA';//node.gAccount.password
		node.get('/api/contracts?address='+ address , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('contracts').that.is.an('array');
			res.body.contracts.forEach(function (contracts) {
				node.expect(contracts).to.have.property('type').that.is.a('number');
				node.expect(contracts).to.have.property('cause').that.is.a('object');
				node.expect(contracts).to.have.property('effect').that.is.a('object');
				node.expect(contracts.cause).to.have.property('address').that.is.a('string');
				node.expect(contracts.cause).to.have.property('balance').that.is.a('number');
				node.expect(contracts.cause).to.have.property('minConfirmations').that.is.a('number');
				node.expect(contracts.effect).to.have.property('transactionId').that.is.a('string');
			});
			done();
		});
	});
});

//
// /api/contracts/get test cases
//

describe('GET /api/contracts/get', function () {

	it('using no params should fail', function (done) {
		node.get('/api/contracts/get', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: id');
			done();
		});
	});

	it('using no id should fail', function (done) {
		node.get('/api/contracts/get?id=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 1');
			done();
		});
	});

	it('using incorrect id should fail', function (done) {
		var id = '080b9a547cb784474436afaa08b0cbd357ef1cf8c5cc4749b297fc517d270494';
		node.get('/api/contracts/get?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Contract not found: '+id);
			done();
		});
	});

	it('using correct id should ok', function (done) {
		var id = '46417aae7484762981cebabb57cf0c6ad1d2c9701a70be9088fcbbac1e1f4f05';//node.gAccount.password
		node.get('/api/contracts/get?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('contract').that.is.an('object');
			var contracts = res.body.contract;
			node.expect(contracts).to.have.property('type').that.is.a('number');
			node.expect(contracts).to.have.property('cause').that.is.a('object');
			node.expect(contracts).to.have.property('effect').that.is.a('object');
			node.expect(contracts.cause).to.have.property('address').that.is.a('string');
			node.expect(contracts.cause).to.have.property('balance').that.is.a('number');
			node.expect(contracts.cause).to.have.property('minConfirmations').that.is.a('number');
			node.expect(contracts.effect).to.have.property('transactionId').that.is.a('string');
			done();
		});
	});

});

//
// /api/contracts/history test cases
//

describe('GET /api/contracts/history', function () {

	it('using no params should fail', function (done) {
		node.get('/api/contracts/history', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: id');
			done();
		});
	});

	it('using no id should fail', function (done) {
		node.get('/api/contracts/history?id=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 1');
			done();
		});
	});

	it('using incorrect id should fail', function (done) {
		var id = '080b9a547cb784474436afaa08b0cbd357ef1cf8c5cc4749b297fc517d270494';
		node.get('/api/contracts/history?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Contract history not found.');
			done();
		});
	});

	it('using correct id should ok', function (done) {
		var id = '46417aae7484762981cebabb57cf0c6ad1d2c9701a70be9088fcbbac1e1f4f05';//node.gAccount.password
		node.get('/api/contracts/history?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('history').that.is.an('array');
			res.body.history.forEach(function (contracts) {
				node.expect(contracts).to.have.property('type').that.is.a('number');
				node.expect(contracts).to.have.property('cause').that.is.a('object');
				node.expect(contracts).to.have.property('effect').that.is.a('object');
				node.expect(contracts.cause).to.have.property('address').that.is.a('string');
				node.expect(contracts.cause).to.have.property('balance').that.is.a('number');
				node.expect(contracts.cause).to.have.property('minConfirmations').that.is.a('number');
				node.expect(contracts.effect).to.have.property('transactionId').that.is.a('string');
			});
			done();
		});
	});
});
