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

// Public methods

//
//__API__ `verify`

// //
// Polls.prototype.verify = function (transaction, cb) {
// 	async.waterfall([
// 		function setAccountAndGet (waterCb) {
// 			modules.accounts.setAccountAndGet({publicKey: transaction.senderPublicKey}, waterCb);
// 		},
// 		function verifyTransaction (sender, waterCb) {
// 			library.logic.transaction.verify(transaction, sender, waterCb);
// 		}
// 	], cb);
// };
//
//
//
// //
// //__API__ `apply`
//
// //
// Polls.prototype.apply = function (transaction, block, cb) {
// 	library.transactionSequence.add(function (sequenceCb){
// 		library.logger.debug('Applying confirmed transaction', transaction.id);
// 		modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
// 			if (err) {
// 				return sequenceCb(err);
// 			}
// 			library.logic.transaction.apply(transaction, block, sender, sequenceCb);
// 		});
// 	}, cb);
// };
//
// //
// //__API__ `undo`
//
// //
// Polls.prototype.undo = function (transaction, block, cb) {
// 	library.transactionSequence.add(function (sequenceCb){
// 		library.logger.debug('Undoing confirmed transaction', transaction.id);
// 		modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
// 			if (err) {
// 				return sequenceCb(err);
// 			}
// 			library.logic.transaction.undo(transaction, block, sender, sequenceCb);
// 		});
// 	}, cb);
// };
//
// //
// //__API__ `applyUnconfirmed`
//
// //
// Polls.prototype.applyUnconfirmed = function (transaction, cb) {
// 	modules.accounts.setAccountAndGet({publicKey: transaction.senderPublicKey}, function (err, sender) {
// 		if (!sender && transaction.blockId !== genesisblock.block.id) {
// 			return cb('Invalid block id');
// 		} else {
// 			library.transactionSequence.add(function (sequenceCb){
// 				library.logger.debug('Applying unconfirmed transaction', transaction.id);
// 				if (transaction.requesterPublicKey) {
// 					modules.accounts.getAccount({publicKey: transaction.requesterPublicKey}, function (err, requester) {
// 						if (err) {
// 							return sequenceCb(err);
// 						}
//
// 						if (!requester) {
// 							return sequenceCb('Requester not found');
// 						}
//
// 						library.logic.transaction.applyUnconfirmed(transaction, sender, requester, sequenceCb);
// 					});
// 				} else {
// 					library.logic.transaction.applyUnconfirmed(transaction, sender, sequenceCb);
// 				}
// 			}, cb);
// 		}
// 	});
// };
//
// //
// //__API__ `undoUnconfirmed`
//
// //
// Polls.prototype.undoUnconfirmed = function (transaction, cb) {
// 	library.transactionSequence.add(function (sequenceCb){
// 		library.logger.debug('Undoing unconfirmed transaction', transaction.id);
// 		modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
// 			if (err) {
// 				return sequenceCb(err);
// 			}
// 			library.logic.transaction.undoUnconfirmed(transaction, sender, sequenceCb);
// 		});
// 	}, cb);
// };

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

Polls.prototype.isDuplicateAddress = function (pollAddress,cb) {
	library.db.query(sql.countByAddress, {pollAddress: pollAddress}).then(function (rows) {
		if (!rows.length) {
			return cb(null);
		}
		return cb(true);
	}).catch(function (err) {
		library.logger.error('stack', err);
		return cb('Polls#getContract error');
	});

};


Polls.prototype.isDuplicatePoll = function (pollName,cb) {
	library.db.query(sql.countByPoll, {pollName: pollName}).then(function (rows) {
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

		library.db.query(sql.getPollResultByAddress, {pollAddress: req.body.address}).then(function (rows) {
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
