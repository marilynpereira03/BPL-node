'use strict';

var async = require('async');
var genesisblock = null;
var Router = require('../helpers/router.js');
var transactionTypes = require('../helpers/transactionTypes.js');
var AutoUpdate = require('../logic/autoUpdate.js');

// Private fields
var modules, library, self, __private = {}, shared = {};

__private.assetTypes = {};

// Constructor
function AutoUpdates (cb, scope) {
	library = scope;
	genesisblock = library.genesisblock;
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


// Public methods

//
//__API__ `verify`

//
AutoUpdates.prototype.verify = function (transaction, cb) {
	async.waterfall([
		function setAccountAndGet (waterCb) {
			modules.accounts.setAccountAndGet({publicKey: transaction.senderPublicKey}, waterCb);
		},
		function verifyTransaction (sender, waterCb) {
			library.logic.transaction.verify(transaction, sender, waterCb);
		}
	], cb);
};


//
//__API__ `apply`

//
AutoUpdates.prototype.apply = function (transaction, block, cb) {
	library.transactionSequence.add(function (sequenceCb) {
		library.logger.debug('Applying confirmed transaction', transaction.id);
		modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
			if (err) {
				return sequenceCb(err);
			}
			library.logic.transaction.apply(transaction, block, sender, sequenceCb);
		});
	}, cb);
};

//
//__API__ `undo`

//
AutoUpdates.prototype.undo = function (transaction, block, cb) {
	library.transactionSequence.add(function (sequenceCb) {
		library.logger.debug('Undoing confirmed transaction', transaction.id);
		modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
			if (err) {
				return sequenceCb(err);
			}
			library.logic.transaction.undo(transaction, block, sender, sequenceCb);
		});
	}, cb);
};

//
//__API__ `applyUnconfirmed`

//
AutoUpdates.prototype.applyUnconfirmed = function (transaction, cb) {
	modules.accounts.setAccountAndGet({publicKey: transaction.senderPublicKey}, function (err, sender) {
		if (!sender && transaction.blockId !== genesisblock.block.id) {
			return cb('Invalid block id');
		} else {
			library.transactionSequence.add(function (sequenceCb) {
				library.logger.debug('Applying unconfirmed transaction', transaction.id);
				if (transaction.requesterPublicKey) {
					modules.accounts.getAccount({publicKey: transaction.requesterPublicKey}, function (err, requester) {
						if (err) {
							return sequenceCb(err);
						}

						if (!requester) {
							return sequenceCb('Requester not found');
						}

						library.logic.transaction.applyUnconfirmed(transaction, sender, requester, sequenceCb);
					});
				} else {
					library.logic.transaction.applyUnconfirmed(transaction, sender, sequenceCb);
				}
			}, cb);
		}
	});
};

//
//__API__ `undoUnconfirmed`

//
AutoUpdates.prototype.undoUnconfirmed = function (transaction, cb) {
	library.transactionSequence.add(function (sequenceCb) {
		library.logger.debug('Undoing unconfirmed transaction', transaction.id);
		modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
			if (err) {
				return sequenceCb(err);
			}
			library.logic.transaction.undoUnconfirmed(transaction, sender, sequenceCb);
		});
	}, cb);
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
