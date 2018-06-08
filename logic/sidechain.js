'use strict';

var async = require('async');
var constants = require('../constants.json');
var sql = require('../sql/sidechains.js');

// Private fields
var modules, library;

// Constructor
function Sidechain () {}

// Public methods
//
//__API__ `bind`

//
Sidechain.prototype.bind = function (scope) {
	modules = scope.modules;
	library = scope.library;
};

//
//__API__ `create`

//
Sidechain.prototype.create = function (data, trs) {
	trs.recipientId = null;
	trs.amount = 0;
	return trs;
};

//
//__API__ `calculateFee`

//
Sidechain.prototype.calculateFee = function (trs) {
	return constants.fees.sidechain;
};

//
//__API__ `verify`

//
Sidechain.prototype.verify = function (trs, sender, cb) {
	if(!trs.asset || !trs.asset.sidechain) {
		return cb('Invalid transaction asset.');
	}
	if(!trs.asset.sidechain.config) {
		return cb('Invalid asset config.');
	}
	if(!trs.asset.sidechain.constants) {
		return cb('Invalid constants asset.');
	}
	if (!trs.asset.sidechain.genesis) {
		return cb('Invalid genesis object.');
	}
	if (!trs.asset.sidechain.network) {
		return cb('Invalid network.');
	}
	if (!trs.asset.sidechain.status) {
		return cb('Invalid transaction status.');
	}
	if (!trs.asset.sidechain.config.peersList) {
		return cb('Invalid peers asset.');
	}
	if (!trs.asset.sidechain.config.nethash) {
		return cb('Invalid nethash.');
	}
	if (!trs.asset.sidechain.constants.activeDelegates) {
		return cb('Active delegates must not be empty.');
	}
	if (!trs.asset.sidechain.constants.blockTime) {
		return cb('Block Time must not be empty');
	}
	if(!trs.asset.sidechain.constants.rewards) {
		return cb('Invalid rewards asset.');
	}
	if (!trs.asset.sidechain.constants.rewards.milestones || !trs.asset.sidechain.constants.rewards.milestones.length) {
		return cb('Invalid milestones asset.');
	}
	if (!(trs.asset.sidechain.constants.rewards.type != 'proportional' || trs.asset.sidechain.constants.rewards.type != 'static')) {
		return cb('Reward type must be static or proportional.');
	}
	if (!trs.asset.sidechain.constants.rewards.offset) {
		return cb('Invalid reward offset.');
	}
	if (!trs.asset.sidechain.constants.rewards.distance) {
		return cb('Invalid reward distance.');
	}
	if (!trs.asset.sidechain.constants.totalAmount) {
		return cb('Invalid total amount.');
	}
	if (!trs.asset.sidechain.network.token) {
		return cb('Invalid token name.');
	}
	if (!trs.asset.sidechain.network.tokenShortName || !trs.asset.sidechain.network.tokenShortName.length) {
		return cb('Invalid token short name.');
	}
	if (!trs.asset.sidechain.network.pubKeyHash) {
		return cb('Invalid pubKeyHash.');
	}
	if (!trs.asset.sidechain.network.symbol) {
		return cb('Invalid symbol name.');
	}
	if (!trs.asset.sidechain.network.explorer) {
		return cb('Invalid explorer link.');
	}
	if(!trs.asset.sidechain.hasOwnProperty('prevTransactionId')) {
		return cb('Missing property - prevTransactionId.');
	}

	async.parallel([
		function(callback) {
			if (trs.asset.sidechain.prevTransactionId) {
				modules.transactions.countByIdAndType({id: trs.asset.sidechain.prevTransactionId, type: 7}, function (err, count) {
					if (err) {
						callback(err);
					}
					else if (!count) {
						callback('Invalid previous transaction id.');
					}
					else {
						callback(null);
					}
				});
			}
			else {
				callback(null);
			}
		},
		function(callback) {
			if(!trs.asset.sidechain.prevTransactionId)
			{
				modules.sidechains.countByTicker(trs, function (err, count) {
					if (err) {
						callback(err);
					}
					else if (count) {
						callback('Sidechain ticker name already exists.');
					}
					else {
						callback(null);
					}
				});
			}
			else {
				callback(null);
			}
		}
	], function(err) {
		if(err) {
			return cb(err);
		}
		else {
			return cb(null, trs);
		}
	});
};

//
//__API__ `process`

//
Sidechain.prototype.process = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `getBytes`

//
Sidechain.prototype.getBytes = function (trs) {
	var buf;

	if(trs.asset.sidechain.network.tokenShortName)
	{
		try {
			buf = new Buffer(trs.asset.sidechain.network.tokenShortName, 'utf8');
			return buf;
		} catch (e) {
			throw e;
		}
	}
	else {
		return null;
	}
};

//
//__API__ `apply`

//
Sidechain.prototype.apply = function (trs, block, sender, cb) {
	var data = {
		address: sender.address
	};
	modules.accounts.setAccountAndGet(data, cb);
};

//
//__API__ `undo`

//
Sidechain.prototype.undo = function (trs, block, sender, cb) {
	modules.accounts.setAccountAndGet({address: trs.recipientId}, function (err, recipient) {
		if (err) {
			return cb(err);
		}

		modules.accounts.mergeAccountAndGet({
			address: trs.recipientId,
			balance: -trs.amount,
			u_balance: -trs.amount,
			blockId: block.id,
			round: modules.rounds.getRoundFromHeight(block.height)
		}, cb);
	});
};

//
//__API__ `applyUnconfirmed`

//
Sidechain.prototype.applyUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `undoUnconfirmed`

//
Sidechain.prototype.undoUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

Sidechain.prototype.schema = {
	id: 'Sidechain',
	type: 'object',
	properties: {
		publicKey: {
			type: 'string',
			format: 'publicKey'
		},
		ticker: {
			type: 'string',
			minimum: 3,
			maximum: 6
		}
	},
	required: ['publicKey', 'ticker']
};

//
//__API__ `objectNormalize`

//
Sidechain.prototype.objectNormalize = function (trs) {
	var asset = {
		publicKey: trs.senderPublicKey,
		ticker: trs.asset.sidechain.network.tokenShortName
	}

	var report = library.schema.validate(asset, Sidechain.prototype.schema);
	if (!report) {
		throw 'Failed to validate Sidechain schema: ' + this.scope.schema.getLastErrors().map(function (err) {
			return err.message;
		}).join(', ');
	}

	return trs;
};

//
//__API__ `dbRead`

//
Sidechain.prototype.dbRead = function (raw) {
	return null;
};

//
//__API__ `dbSave`

//
Sidechain.prototype.dbTable = 'sidechains';

Sidechain.prototype.dbFields = [
	'ticker',
	'transactionId',
	'publicKey'
];

Sidechain.prototype.dbSave = function (trs) {
	if(!trs.asset.sidechain.prevTransactionId)
	{
		return {
			table: this.dbTable,
			fields: this.dbFields,
			values: {
				ticker: trs.asset.sidechain.network.tokenShortName,
				transactionId: trs.id,
				publicKey: trs.senderPublicKey
			}
		};
	}
	else
	{
		library.db.none(sql.updateTransactionId, {oldTransactionId: trs.asset.sidechain.prevTransactionId, publicKey: trs.senderPublicKey, newTransactionId: trs.id})
		.then(function () {
		}).catch(function (err) {
			library.logger.error("stack", err.stack);
		});
		return null;
	}
};

//
//__API__ `ready`

//
Sidechain.prototype.ready = function (trs, sender) {
	if (Array.isArray(sender.multisignatures) && sender.multisignatures.length) {
		if (!Array.isArray(trs.signatures)) {
			return false;
		}
		return trs.signatures.length >= sender.multimin;
	} else {
		return true;
	}
};

// Export
module.exports = Sidechain;
