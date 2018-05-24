'use strict';

var async = require('async');
var JSONC = require('jsoncomp');
var genesisblock = null;
var Router = require('../helpers/router.js');
var Sidechain = require('../logic/sidechain.js');
var transactionTypes = require('../helpers/transactionTypes.js');
var schema = require('../schema/sidechains.js');
var sql = require('../sql/sidechains.js');

// Private fields
var modules, library, self,
	__private = {},
	shared = {};

__private.assetTypes = {};

// Constructor
function Sidechains (cb, scope) {
	library = scope;
	genesisblock = library.genesisblock;
	self = this;
	__private.assetTypes[transactionTypes.SIDECHAIN] = library.logic.transaction.attachAssetType(transactionTypes.SIDECHAIN, new Sidechain());
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
		'get /': 'getSidechains',
		'get /get': 'getSidechain'
	});

	router.use(function (req, res, next) {
		res.status(500).send({success: false, error: 'API endpoint not found'});
	});

	library.network.app.use('/api/sidechains', router);
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
Sidechains.prototype.verify = function (transaction, cb) {
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
Sidechains.prototype.apply = function (transaction, block, cb) {
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
Sidechains.prototype.undo = function (transaction, block, cb) {
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
Sidechains.prototype.applyUnconfirmed = function (transaction, cb) {
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
Sidechains.prototype.undoUnconfirmed = function (transaction, cb) {
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
Sidechains.prototype.onBind = function (scope) {
	modules = scope;
	__private.assetTypes[transactionTypes.SIDECHAIN].bind({
		modules, library
	});
};


//
//__EVENT__ `onAttachPublicApi`

//
Sidechains.prototype.onAttachPublicApi = function () {
	__private.attachApi();
};


// Shared
shared.getSidechains = function (req, cb) {
	library.schema.validate(req.body, schema.getSidechains, function (err) {
		if (err) {
			return cb(err[0].message);
		}
		library.db.query(sql.getByPublicKey, {publicKey: req.body.publicKey}).then(function (rows) {
			if (!rows.length) {
				return cb('Sidechains not found: ' +req.body.publicKey);
			}

			var sidechains = [];
			rows.forEach(function (row) {
				var rawasset = JSON.parse(row.rawasset);

				var sidechain = {
					'config': rawasset.config,
					'constants': rawasset.constants,
					'genesis': JSONC.decompress(rawasset.genesis),
					'networks': rawasset.networks
				};
				sidechains.push(sidechain);
			});
			return cb(null,  {'sidechains': sidechains});
		}).catch(function (err) {
			library.logger.error('stack', err);
			return cb('Sidechains#getByPublicKey error');
		});
	});
};

shared.getSidechain = function (req, cb) {
	library.schema.validate(req.body, schema.getSidechain, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		library.db.query(sql.getByTicker, {ticker: req.body.ticker}).then(function (rows) {
			if (!rows.length) {
				return cb('Sidechain not found: ' +req.body.ticker);
			}
			var rawasset = JSON.parse(rows[0].rawasset);

			return cb(null,  {
				'sidechain': {
					'config': rawasset.config,
					'constants': rawasset.constants,
					'genesis': JSONC.decompress(rawasset.genesis),
					'networks': rawasset.networks
				}
			});
		}).catch(function (err) {
			library.logger.error('stack', err);
			return cb('Sidechains#getByTicker error');
		});
	});
};

// Export
module.exports = Sidechains;
