'use strict';

var Router = require('../helpers/router.js');
var transactionTypes = require('../helpers/transactionTypes.js');
var AutoUpdate = require('../logic/autoUpdate.js');
var sql = require('../sql/autoUpdates.js');

// Private fields
var modules, library, self, __private = {}, shared = {};

__private.assetTypes = {};

// Constructor
function AutoUpdates (cb, scope) {
	library = scope;
	self = this;
	__private.assetTypes[transactionTypes.AUTOUPDATE] = library.logic.transaction.attachAssetType(transactionTypes.AUTOUPDATE, new AutoUpdate());
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
		'get /getLatest': 'getLatest'
	});

	router.use(function (req, res, next) {
		res.status(500).send({success: false, error: 'API endpoint not found'});
	});

	library.network.app.use('/api/autoUpdates', router);
	library.network.app.use(function (err, req, res, next) {
		if (!err) { return next(); }
		library.logger.error(`API error ${  req.url}`, err);
		res.status(500).send({success: false, error: 'API error', message: err.message});
	});
};

// Shared
shared.getLatest = function (req, cb) {
	library.db.query(sql.getLatest).then(function (row) {
		if(row.length) {
			return cb(null, { update: row });
		}
		else {
			return cb('Couldn\'t find latest auto update.');
		}

	}).catch(function (err) {
		library.logger.error('stack', err.stack);
		return cb('Failed to get latest update.');
	});
};

// Events
//
//__EVENT__ `onBind`

//
AutoUpdates.prototype.onBind = function (scope) {
	modules = scope;
	__private.assetTypes[transactionTypes.AUTOUPDATE].bind({
		modules, library
	});
};


// Events
//
//__EVENT__ `onAttachPublicApi`

//
AutoUpdates.prototype.onAttachPublicApi = function () {
	__private.attachApi();
};

// Export
module.exports = AutoUpdates;
