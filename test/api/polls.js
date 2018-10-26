'use strict'; /*jslint mocha:true, expr:true */

var node = require('./../node.js');

//
// /api/contracts test cases
//
var accountAddress  = node.randomAccount();
console.log(node.gAccount.secret);
function pollTransaction (params, done) {
	node.put('/peer/transactions/', params, function (err, res) {
		done(err, res);
	});
}

describe('GET /api/polls', function () {
    //perform poll transaction
    // before(function (done) {
    //     var polldata= {
    //         "polls": [
    //         {
    //         "name": "5BPL",
    //         "startTimestamp": new Date(),
    //         "endTimestamp": new Date(Date.now() + (1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)),
    //         "address": accountAddress,
    //         "intentions": [ "yes","no" ],
    //         "description": "Delegate will gate 5 BPL-reward for span of 1 month"
    //         }
    //     ] 
    // };
    //     var data = node.bpl.poll.createPoll(node.gAccount.passphrase, polldata, null);
    //     console.log("data",data)
    //     pollTransaction(data
	// 	, function (err, res) {
	// 		node.expect(res.body).to.have.property('success').to.be.ok;
	// 		node.expect(res.body).to.have.property('transactionId');
	// 		node.expect(res.body.transactionId).to.be.not.empty;
	// 		node.onNewBlock(function (err) {
	// 			done();
	// 		});
	// 	});
    // });
    //
    describe('GET /api/polls/get?name=?', function() {
        it('using no params should fail', function (done) {
            node.get('/api/polls/get', function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error').to.equal('Missing required property name or address');
                done();
            });
        });
    //
        it('using no poll name should fail', function (done) {
            node.get('/api/polls/get?name=', function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 1');
                done();
            });
        });
    //
        it('using incorrect poll name should fail', function (done) {
            var name = 'ABC';
            node.get('/api/polls/get?name='+ name , function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error').to.equal('Poll not found: ABC');
                done();
            });
        });
    //
        it('using correct poll name should ok', function (done) {
            var name = '5BPL';//node.gAccount.password
            node.get('/api/polls/get?name='+ name , function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('polls').that.is.an('array');
			res.body.polls.forEach(function (poll) {
				node.expect(poll).to.have.property('name').that.is.a('string');
				node.expect(poll).to.have.property('address').that.is.a('string');
                node.expect(poll).to.have.property('startTimestamp').that.is.a('string');
                node.expect(poll).to.have.property('endTimestamp').that.is.a('string');
                node.expect(poll).to.have.property('intentions').to.be.an('array');
                node.expect(poll).to.have.property('description').that.is.a('string');
                node.expect(poll).to.have.property('transactionId').that.is.a('string');
            });
            done();
            });
        });

    });
	
	 //
	 describe('GET /api/polls/get?address=?', function() {
        it('using no params should fail', function (done) {
            node.get('/api/polls/get', function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error').to.equal('Missing required property name or address');
                done();
            });
        });
    //
        it('using no poll address should fail', function (done) {
            node.get('/api/polls/get?address=', function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error').to.equal('Missing required property name or address');
                done();
            });
        });
    //
        it('using incorrect poll address should fail', function (done) {
            var address = 'B6SchLg2vNJWRLBDk37ZrRfYbrRF6MfEqP';
            node.get('/api/polls/get?address='+ address , function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error').to.equal('Poll not found: '+address);
                done();
            });
        });
    //
        it('using correct poll address should ok', function (done) {
            var address = 'B6SchLg2vNJWRLBDk37ZrRfYbrRF6MfEwP';//node.gAccount.password
            node.get('/api/polls/get?address='+ address , function (err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('poll').that.is.an('object');
                node.expect(res.body.poll).to.have.property('name').that.is.a('string');
				node.expect(res.body.poll).to.have.property('address').that.is.a('string');
                node.expect(res.body.poll).to.have.property('startTimestamp').that.is.a('string');
                node.expect(res.body.poll).to.have.property('endTimestamp').that.is.a('string');
                node.expect(res.body.poll).to.have.property('intentions').to.be.an('array');
                node.expect(res.body.poll).to.have.property('description').that.is.a('string');
                node.expect(res.body.poll).to.have.property('transactionId').that.is.a('string');
                done();
            });
        });

    });
});

// get all polls
describe('GET /api/polls', function () {
	it('/api/polls should ok', function (done) {
		node.get('/api/polls' , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('polls').that.is.an('array');
			res.body.polls.forEach(function (poll) {
				node.expect(poll).to.have.property('name').that.is.a('string');
				node.expect(poll).to.have.property('address').that.is.a('string');
                node.expect(poll).to.have.property('startTimestamp').that.is.a('string');
                node.expect(poll).to.have.property('endTimestamp').that.is.a('string');
                node.expect(poll).to.have.property('intentions').to.be.an('array');
                node.expect(poll).to.have.property('description').that.is.a('string');
                node.expect(poll).to.have.property('transactionId').that.is.a('string');
			});
			done();
		});
	});
});


//get poll result

describe('GET /api/polls/getPollResults', function () {
	it('using no params should fail', function (done) {
		node.get('/api/polls/getPollResults', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('Missing required property: address');
			done();
		});
	});
//
	it('using no poll address should fail', function (done) {
		node.get('/api/polls/getPollResults?address=', function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal('String is too short (0 chars), minimum 1');
			done();
		});
	});
//
	it('using incorrect poll address should fail', function (done) {
		var address = 'B6SchLg2vNJWRLBDk37ZrRfYbrRF6MfEqP';
		node.get('/api/polls/getPollResults?address='+ address , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.not.ok;
			node.expect(res.body).to.have.property('error').to.equal("Object didn't pass validation for format address: B6SchLg2vNJWRLBDk37ZrRfYbrRF6MfEqP");
			done();
		});
	});
//
	it('using correct poll address should ok', function (done) {
		var address = 'B6SchLg2vNJWRLBDk37ZrRfYbrRF6MfEwP';//node.gAccount.password
		node.get('/api/polls/getPollResults?address='+ address , function (err, res) {
			node.expect(res.body).to.have.property('success').to.be.ok;
			node.expect(res.body).to.have.property('results').that.is.an('array');
			res.body.results.forEach(function (result) {
				node.expect(result).to.have.property('name').that.is.a('string');
				node.expect(result).to.have.property('senderId').that.is.a('string');
				node.expect(result).to.have.property('intention').that.is.a('string');
				node.expect(result).to.have.property('transactionId').that.is.a('string');
				});
			done();
		});
	});
});