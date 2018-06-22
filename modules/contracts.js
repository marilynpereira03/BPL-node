'use strict';

var async = require('async');
var genesisblock = null;
var Router = require('../helpers/router.js');
var Contract = require('../logic/contract.js');
var transactionTypes = require('../helpers/transactionTypes.js');
var schema = require('../schema/contracts.js');
var sql = require('../sql/contracts.js');
var tsql = require('../sql/transactions.js');

// Private fields
var modules, library, self, __private = {}, shared = {};

__private.assetTypes = {};

// Constructor
function Contracts (cb, scope) {
	library = scope;
	genesisblock = library.genesisblock;
	self = this;
	__private.assetTypes[transactionTypes.CONTRACT] = library.logic.transaction.attachAssetType(transactionTypes.CONTRACT, new Contract());
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
		'get /': 'getContracts',
		'get /get': 'getContract',
		'get /history': 'getHistory'
	});

	router.use(function (req, res, next) {
		res.status(500).send({success: false, error: 'API endpoint not found'});
	});

	library.network.app.use('/api/contracts', router);
	library.network.app.use(function (err, req, res, next) {
		if (!err) { return next(); }
		library.logger.error(`API error ${  req.url}`, err);
		res.status(500).send({success: false, error: 'API error', message: err.message});
	});
};


__private.getHistory = function (transactionId, limit, history, cb) {
	if(history.length < limit) {
		library.db.query(tsql.getRawAssetById, {id: transactionId}).then(function (rows) {
			if (!rows.length) {
				return cb('Contract history not found.');
			}

			var rawasset = JSON.parse(rows[0].rawasset);
			var contract = {
				// ************************** Remove if not needed
				// type: rawasset.contract.type,
				// label: rawasset.contract.label,
				trigger: rawasset.contract.trigger,
				definition: rawasset.contract.definition,
			};
			history.push(contract);

			if(rawasset.contract.prevTransactionId) {
				__private.getHistory(rawasset.contract.prevTransactionId, limit, history, cb);
			}
			else {
				return cb(null, { 'history': history });
			}
		}).catch(function (err) {
			library.logger.error('stack', err);
			return cb('Contracts#get error');
		});
	}
	else {
		return cb(null, history);
	}
};


// Public methods

//
//__API__ `verify`

//
Contracts.prototype.verify = function (transaction, cb) {
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
Contracts.prototype.apply = function (transaction, block, cb) {
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
Contracts.prototype.undo = function (transaction, block, cb) {
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
Contracts.prototype.applyUnconfirmed = function (transaction, cb) {
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
Contracts.prototype.undoUnconfirmed = function (transaction, cb) {
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
Contracts.prototype.onBind = function (scope) {
	modules = scope;
	__private.assetTypes[transactionTypes.CONTRACT].bind({
		modules, library
	});
};


//__EVENT__ `onAttachPublicApi`

Contracts.prototype.onAttachPublicApi = function () {
	__private.attachApi();
};

// Shared
shared.getContracts = function (req, cb) {
	library.schema.validate(req.body, schema.getContracts, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		var query = '', params = {}, errMsg = '';
		if(req.body.publicKey) {
			query = sql.getByPublicKey;
			params = {publicKey: req.body.publicKey};
			errMsg = 'Contracts not found: ' +req.body.publicKey;
		}
		else if(req.body.address) {
			query = sql.getByAddress;
			params = {address: req.body.address};
			errMsg = 'Contracts not found: ' +req.body.address;
		}
		else {
			return cb(null, {success: false, error: 'Missing required property: address or publicKey'});
		}

		library.db.query(query, params).then(function (rows) {
			if (!rows.length) {
				return cb(errMsg);
			}

			var contracts = [];
			rows.forEach(function (row) {
				var contract = JSON.parse(row.rawasset).contract;
				delete contract.prevTransactionId;
				contracts.push(contract);
			});

			return cb(null,  {'contracts': contracts});
		}).catch(function (err) {
			library.logger.error('stack', err);
			return cb('Contracts#getByPublicKey error');
		});
	});
};


shared.getContract = function (req, cb) {
	library.schema.validate(req.body, schema.getContract, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		library.db.query(tsql.getRawAssetById, {id: req.body.id}).then(function (rows) {
			if (!rows.length) {
				return cb('Contract not found: ' +req.body.id);
			}

			var rawasset = JSON.parse(rows[0].rawasset);
			delete rawasset.contract.prevTransactionId;
			return cb(null, rawasset);
		}).catch(function (err) {
			library.logger.error('stack', err);
			return cb('Contracts#get error');
		});
	});
};


shared.getHistory = function(req, cb) {
	var history = [];

	library.schema.validate(req.body, schema.getHistory, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		var limit = 10;
		if(req.body.limit) {
			limit = req.body.limit;
		}
		__private.getHistory(req.body.id, limit, history, cb);
	});
};

// Export
module.exports = Contracts;
