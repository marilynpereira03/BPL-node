'use strict'; /*jslint mocha:true, expr:true */

var node = require('./../node.js');

//
// /api/sidechains test cases
//

describe('GET /api/sidechains', function () {

	it('using no params should fail', function (done) {
		node.get('/api/sidechains', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: publicKey');
			done();
		});
	});

	it('using no publicKey should fail', function (done) {
		node.get('/api/sidechains?publicKey=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Sidechains not found: ');
			done();
		});
	});

	it('using incorrect publicKey should fail', function (done) {
		var publicKey = '1305fc33b96bab644e075849d4e5013e6b3a068ca6cfb734705fe8837c966dc4bf';
		node.get('/api/sidechains?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Sidechains not found: '+publicKey);
			done();
		});
	});

	it('using incorrect integer publicKey should fail', function (done) {
		var publicKey = 30333;
		node.get('/api/sidechains?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Expected type string but found type integer');
			done();
		});
	});

	it('using incorrect integer publicKey should fail', function (done) {
		var publicKey = 'x303330356663333362393662616236343465303735383439643465353031336536623361303638636136636662373334373035666538383337633936366463346266';
		node.get('/api/sidechains?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Object didn\'t pass validation for format publicKey: '+publicKey);
			done();
		});
	});

	it('using correct publicKey should ok', function (done) {
		var publicKey = '0305fc33b96bab644e075849d4e5013e6b3a068ca6cfb734705fe8837c966dc4bf';//node.gAccount.password
		node.get('/api/sidechains?publicKey='+ publicKey , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('sidechains').that.is.an('array');
			res.body.sidechains.forEach(function (sidechains) {
				node.expect(sidechains).to.have.property('constants').that.is.a('object');
				node.expect(sidechains).to.have.property('config').that.is.a('object');
				node.expect(sidechains).to.have.property('genesis').that.is.a('object');
				node.expect(sidechains).to.have.property('network').that.is.a('object');
				node.expect(sidechains).to.have.property('status').that.is.a('string');
				node.expect(sidechains.constants).to.have.property('blockTime').that.is.a('number');
				node.expect(sidechains.constants).to.have.property('activeDelegates').that.is.a('number');
				node.expect(sidechains.constants).to.have.property('rewards').that.is.a('object');
				node.expect(sidechains.constants.rewards).to.have.property('type').that.is.a('string');
				node.expect(sidechains.constants.rewards).to.have.property('fixedLastReward').that.is.a('boolean');
				node.expect(sidechains.constants.rewards).to.have.property('offset').that.is.a('number');
				node.expect(sidechains.constants.rewards).to.have.property('distance').that.is.a('number');
				node.expect(sidechains.constants.rewards).to.have.property('milestones').that.is.a('array');
				node.expect(sidechains.constants).to.have.property('totalAmount').that.is.a('number');
				node.expect(sidechains.config).to.have.property('peersList').that.is.a('array');
				node.expect(sidechains.config.peersList[0]).to.have.property('ip').that.is.a('string');
				node.expect(sidechains.config.peersList[0]).to.have.property('port').that.is.a('number');
				node.expect(sidechains.config).to.have.property('nethash').that.is.a('string');
				node.expect(sidechains.network).to.have.property('pubKeyHash').that.is.a('number');
				node.expect(sidechains.network).to.have.property('token').that.is.a('string');
				node.expect(sidechains.network).to.have.property('symbol').that.is.a('string');
				node.expect(sidechains.network).to.have.property('explorer').that.is.a('string');
				node.expect(sidechains.network).to.have.property('tokenShortName').that.is.a('string');
			});
			done();
		});
	});
});

//
// /api/sidechains/get test cases
//

describe('GET /api/sidechains/get', function () {

	it('using no params should fail', function (done) {
		node.get('/api/sidechains/get', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: id or ticker');
			done();
		});
	});

	it('using no ticker should fail', function (done) {
		node.get('/api/sidechains/get?ticker=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 3');
			done();
		});
	});

	it('using ticker length greater than 6 should fail', function (done) {
		var ticker = 'AAAAAAAA';
		node.get('/api/sidechains/get?ticker='+ticker, function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too long (8 chars), maximum 6');
			done();
		});
	});

	it('using incorrect ticker should fail', function (done) {
		var ticker = '$$$';
		node.get('/api/sidechains/get?ticker='+ ticker , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Sidechain not found: '+ticker);
			done();
		});
	});

	it('using incorrect integer ticker should fail', function (done) {
		var ticker = 111;
		node.get('/api/sidechains/get?ticker='+ ticker   , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Expected type string but found type integer');
			done();
		});
	});

	it('using correct ticker should ok', function (done) {
		var ticker = node.gAccount.password
		node.get('/api/sidechains/get?ticker='+ ticker , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('sidechain').that.is.an('object');
			var sidechains = res.body.sidechain;
			node.expect(sidechains).to.have.property('constants').that.is.a('object');
			node.expect(sidechains).to.have.property('config').that.is.a('object');
			node.expect(sidechains).to.have.property('genesis').that.is.a('object');
			node.expect(sidechains).to.have.property('network').that.is.a('object');
			node.expect(sidechains).to.have.property('status').that.is.a('string');
			node.expect(sidechains.constants).to.have.property('blockTime').that.is.a('number');
			node.expect(sidechains.constants).to.have.property('activeDelegates').that.is.a('number');
			node.expect(sidechains.constants).to.have.property('rewards').that.is.a('object');
			node.expect(sidechains.constants.rewards).to.have.property('type').that.is.a('string');
			node.expect(sidechains.constants.rewards).to.have.property('fixedLastReward').that.is.a('boolean');
			node.expect(sidechains.constants.rewards).to.have.property('offset').that.is.a('number');
			node.expect(sidechains.constants.rewards).to.have.property('distance').that.is.a('number');
			node.expect(sidechains.constants.rewards).to.have.property('milestones').that.is.a('array');
			node.expect(sidechains.constants).to.have.property('totalAmount').that.is.a('number');
			node.expect(sidechains.config).to.have.property('peersList').that.is.a('array');
			node.expect(sidechains.config.peersList[0]).to.have.property('ip').that.is.a('string');
			node.expect(sidechains.config.peersList[0]).to.have.property('port').that.is.a('number');
			node.expect(sidechains.config).to.have.property('nethash').that.is.a('string');
			node.expect(sidechains.network).to.have.property('pubKeyHash').that.is.a('number');
			node.expect(sidechains.network).to.have.property('token').that.is.a('string');
			node.expect(sidechains.network).to.have.property('symbol').that.is.a('string');
			node.expect(sidechains.network).to.have.property('explorer').that.is.a('string');
			node.expect(sidechains.network).to.have.property('tokenShortName').that.is.a('string');
			done();
		});
	});

	it('using no id should fail', function (done) {
		node.get('/api/sidechains/get?id=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 1');
			done();
		});
	});

	it('using incorrect id should fail', function (done) {
		var id = '080b9a547cb784474436afaa08b0cbd357ef1cf8c5cc4749b297fc517d270494';
		node.get('/api/sidechains/get?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Sidechain not found: '+id);
			done();
		});
	});

	it('using correct ticker should ok', function (done) {
		var id = '02bc6c603633a7aaf6b31435164744ed875af0c49e619e553a1d77cf12fb93ac';//node.gAccount.password
		node.get('/api/sidechains/get?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('sidechain').that.is.an('object');
			var sidechains = res.body.sidechain;
			node.expect(sidechains).to.have.property('constants').that.is.a('object');
			node.expect(sidechains).to.have.property('config').that.is.a('object');
			node.expect(sidechains).to.have.property('genesis').that.is.a('object');
			node.expect(sidechains).to.have.property('network').that.is.a('object');
			node.expect(sidechains).to.have.property('status').that.is.a('string');
			node.expect(sidechains.constants).to.have.property('blockTime').that.is.a('number');
			node.expect(sidechains.constants).to.have.property('activeDelegates').that.is.a('number');
			node.expect(sidechains.constants).to.have.property('rewards').that.is.a('object');
			node.expect(sidechains.constants.rewards).to.have.property('type').that.is.a('string');
			node.expect(sidechains.constants.rewards).to.have.property('fixedLastReward').that.is.a('boolean');
			node.expect(sidechains.constants.rewards).to.have.property('offset').that.is.a('number');
			node.expect(sidechains.constants.rewards).to.have.property('distance').that.is.a('number');
			node.expect(sidechains.constants.rewards).to.have.property('milestones').that.is.a('array');
			node.expect(sidechains.constants).to.have.property('totalAmount').that.is.a('number');
			node.expect(sidechains.config).to.have.property('peersList').that.is.a('array');
			node.expect(sidechains.config.peersList[0]).to.have.property('ip').that.is.a('string');
			node.expect(sidechains.config.peersList[0]).to.have.property('port').that.is.a('number');
			node.expect(sidechains.config).to.have.property('nethash').that.is.a('string');
			node.expect(sidechains.network).to.have.property('pubKeyHash').that.is.a('number');
			node.expect(sidechains.network).to.have.property('token').that.is.a('string');
			node.expect(sidechains.network).to.have.property('symbol').that.is.a('string');
			node.expect(sidechains.network).to.have.property('explorer').that.is.a('string');
			node.expect(sidechains.network).to.have.property('tokenShortName').that.is.a('string');
			done();
		});
	});

});

//
// /api/sidechains/history test cases
//

describe('GET /api/sidechains/history', function () {

	it('using no params should fail', function (done) {
		node.get('/api/sidechains/history', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: id or ticker');
			done();
		});
	});

	it('using no ticker should fail', function (done) {
		node.get('/api/sidechains/history?ticker=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 3');
			done();
		});
	});

	it('using ticker length greater than 6 should fail', function (done) {
		var ticker = 'AAAAAAAA';
		node.get('/api/sidechains/history?ticker='+ticker, function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too long (8 chars), maximum 6');
			done();
		});
	});

	it('using incorrect ticker should fail', function (done) {
		var ticker = '$$$';
		node.get('/api/sidechains/history?ticker='+ ticker , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Sidechain history not found.');
			done();
		});
	});

	it('using incorrect integer ticker should fail', function (done) {
		var ticker = 111;
		node.get('/api/sidechains/history?ticker='+ ticker   , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Expected type string but found type integer');
			done();
		});
	});

	it('using correct ticker should ok', function (done) {
		var ticker = node.gAccount.password
		node.get('/api/sidechains/history?ticker='+ ticker , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('history').that.is.an('array');
			res.body.history.forEach(function (history) {
				node.expect(history).to.have.property('constants').that.is.a('object');
				node.expect(history).to.have.property('config').that.is.a('object');
				node.expect(history).to.have.property('genesis').that.is.a('object');
				node.expect(history).to.have.property('network').that.is.a('object');
				node.expect(history).to.have.property('status').that.is.a('string');
				node.expect(history.constants).to.have.property('blockTime').that.is.a('number');
				node.expect(history.constants).to.have.property('activeDelegates').that.is.a('number');
				node.expect(history.constants).to.have.property('rewards').that.is.a('object');
				node.expect(history.constants.rewards).to.have.property('type').that.is.a('string');
				node.expect(history.constants.rewards).to.have.property('fixedLastReward').that.is.a('boolean');
				node.expect(history.constants.rewards).to.have.property('offset').that.is.a('number');
				node.expect(history.constants.rewards).to.have.property('distance').that.is.a('number');
				node.expect(history.constants.rewards).to.have.property('milestones').that.is.a('array');
				node.expect(history.constants).to.have.property('totalAmount').that.is.a('number');
				node.expect(history.config).to.have.property('peersList').that.is.a('array');
				node.expect(history.config.peersList[0]).to.have.property('ip').that.is.a('string');
				node.expect(history.config.peersList[0]).to.have.property('port').that.is.a('number');
				node.expect(history.config).to.have.property('nethash').that.is.a('string');
				node.expect(history.network).to.have.property('pubKeyHash').that.is.a('number');
				node.expect(history.network).to.have.property('token').that.is.a('string');
				node.expect(history.network).to.have.property('symbol').that.is.a('string');
				node.expect(history.network).to.have.property('explorer').that.is.a('string');
				node.expect(history.network).to.have.property('tokenShortName').that.is.a('string');
			});
			done();
		});
	});

	it('using no id should fail', function (done) {
		node.get('/api/sidechains/history?id=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 1');
			done();
		});
	});

	it('using incorrect id should fail', function (done) {
		var id = '080b9a547cb784474436afaa08b0cbd357ef1cf8c5cc4749b297fc517d270494';
		node.get('/api/sidechains/history?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Sidechain history not found.');
			done();
		});
	});

	it('using correct ticker should ok', function (done) {
		var id = '02bc6c603633a7aaf6b31435164744ed875af0c49e619e553a1d77cf12fb93ac';//node.gAccount.password
		node.get('/api/sidechains/history?id='+ id , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('history').that.is.an('array');
			res.body.history.forEach(function (history) {
				node.expect(history).to.have.property('constants').that.is.a('object');
				node.expect(history).to.have.property('config').that.is.a('object');
				node.expect(history).to.have.property('genesis').that.is.a('object');
				node.expect(history).to.have.property('network').that.is.a('object');
				node.expect(history).to.have.property('status').that.is.a('string');
				node.expect(history.constants).to.have.property('blockTime').that.is.a('number');
				node.expect(history.constants).to.have.property('activeDelegates').that.is.a('number');
				node.expect(history.constants).to.have.property('rewards').that.is.a('object');
				node.expect(history.constants.rewards).to.have.property('type').that.is.a('string');
				node.expect(history.constants.rewards).to.have.property('fixedLastReward').that.is.a('boolean');
				node.expect(history.constants.rewards).to.have.property('offset').that.is.a('number');
				node.expect(history.constants.rewards).to.have.property('distance').that.is.a('number');
				node.expect(history.constants.rewards).to.have.property('milestones').that.is.a('array');
				node.expect(history.constants).to.have.property('totalAmount').that.is.a('number');
				node.expect(history.config).to.have.property('peersList').that.is.a('array');
				node.expect(history.config.peersList[0]).to.have.property('ip').that.is.a('string');
				node.expect(history.config.peersList[0]).to.have.property('port').that.is.a('number');
				node.expect(history.config).to.have.property('nethash').that.is.a('string');
				node.expect(history.network).to.have.property('pubKeyHash').that.is.a('number');
				node.expect(history.network).to.have.property('token').that.is.a('string');
				node.expect(history.network).to.have.property('symbol').that.is.a('string');
				node.expect(history.network).to.have.property('explorer').that.is.a('string');
				node.expect(history.network).to.have.property('tokenShortName').that.is.a('string');
			});
			done();
		});
	});
});
