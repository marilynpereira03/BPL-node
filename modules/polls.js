'use strict';

var async = require('async');
var constants = require('../constants.json');
var genesisblock = null;
var OrderBy = require('../helpers/orderBy.js');
var Router = require('../helpers/router.js');
var schema = require('../schema/polls.js');
var sql = require('../sql/polls.js');
var Poll = require('../logic/poll.js');
var transactionTypes = require('../helpers/transactionTypes.js');

// Private fields
var modules, library, self, __private = {}, shared = {};

__private.assetTypes = {};

// Constructor
function Polls (cb, scope) {
	library = scope;
	genesisblock = library.genesisblock;
	self = this;

	__private.assetTypes[transactionTypes.POLL] = library.logic.transaction.attachAssetType(
		transactionTypes.POLL, new Poll()
	);

	return cb(null, self);
}

// Private methods
__private.attachApi = function () {
	var router = new Router();

	router.use(function (req, res, next) {
		if (modules) { return next(); }
		res.status(500).send({success: false, error: 'Blockchain is loading'});
	});

	router.map(shared, {
		'get /getByAddress': 'getByAddress'
	});

	router.use(function (req, res, next) {
		res.status(500).send({success: false, error: 'API endpoint not found'});
	});

	library.network.app.use('/api/poll', router);
	library.network.app.use(function (err, req, res, next) {
		if (!err) { return next(); }
		library.logger.error('API error ' + req.url, err);
		res.status(500).send({success: false, error: 'API error', message: err.message});
	});
};


// Events
//
//__EVENT__ `onBind`

//
Polls.prototype.onBind = function (scope) {
	modules = scope;

	__private.assetTypes[transactionTypes.POLL].bind({
		modules: modules, library: library
	});
};


//
//__EVENT__ `onAttachPublicApi`

//
Polls.prototype.onAttachPublicApi = function () {
	__private.attachApi();
};

//
//__EVENT__ `onPeersReady`

//
Polls.prototype.onPeersReady = function () {
};

Polls.prototype.isDuplicateAddress = function (address,cb) {
	library.db.query(sql.countByAddress, {address: address}).then(function (rows) {
		if (!rows.length) {
			return cb(null);
		}
		return cb(true);
	}).catch(function (err) {
		library.logger.error('stack', err);
		return cb('Polls#getContract error');
	});

};

// Shared
shared.getByAddress = function (req, cb) {
	library.schema.validate(req.body.address, schema.getByAddress, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		library.db.query(sql.getPollResultByAddress, {address: req.body.address}).then(function (rows) {
			console.log("rows",rows);
			if (!rows.length) {
				return cb('Poll not found: ' +req.body.address);
			}
			var rawasset = JSON.stringify(rows[0]);
			return cb(null, { polls: rows });
		}).catch(function (err) {
			library.logger.error('stack', err);
			return cb('Polls#getContract error');
		});
	});
};

// Export
module.exports = Polls;
