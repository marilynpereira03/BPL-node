'use strict';

var async = require('async');
var constants = require('../constants.json');
var sql = require('../sql/contracts.js');

// Private fields
var modules, __private = {}, library;

// Constructor
function Contract () {}

// Private menthods
__private.validateCauses = function (causes) {
	var msg = null;
	causes.forEach(function(cause) {
		switch(cause.id) {
		//Zero confirmation
		case 1: if(cause.confirmation === undefined || cause.confirmation !== 0) {
			msg = 'Invalid confirmations for Cause - Zero confirmation.';
		}
			break;
		//Confirmation
		case 2: if(cause.confirmation === undefined || cause.confirmation <= 0) {
			msg = 'Invalid confirmations for Cause - Confirmation.';
		}
			break;
		//Balance breach
		case 3: if(!cause.balanceLimit) {
			msg = 'Missing balance limit for Cause - Balance breach.';
		}
			break;
		//Specific source
		case 4: if(!cause.senderId) {
			msg = 'Missing sender id for Cause - Specific source.';
		}
			break;
		//Specific amount
		case 5: if(!cause.amount) {
			msg = 'Missing amount for Cause - Specific amount.';
		}
			break;
		case 6: if(!cause.reference) {
			msg = 'Missing amount for Cause - Reference.';
		}
			break;
		default:
		 	msg = 'Invalid cause id.';
		}
	});
	return msg;
};


// Public methods
//
//__API__ `bind`

//
Contract.prototype.bind = function (scope) {
	modules = scope.modules;
	library = scope.library;
};

//
//__API__ `create`

//
Contract.prototype.create = function (data, trs) {
	trs.recipientId = null;
	trs.amount = 0;
	return trs;
};

//
//__API__ `calculateFee`

//
Contract.prototype.calculateFee = function (trs) {
	return constants.fees.contract;
};

//
//__API__ `verify`

//
Contract.prototype.verify = function (trs, sender, cb) {
	if (!trs.asset || !trs.asset.contract) {
		return cb('Invalid transaction asset.');
	}
	// ************************** Remove if not needed
	// if (!trs.asset.contract.type) {
	// 	return cb('Invalid type asset.');
	// }
	if (!trs.asset.contract.trigger && trs.asset.contract.trigger.length) {
		return cb('Invalid trigger asset.');
	}
	if (!trs.asset.contract.definition) {
		return cb('Invalid definition asset.');
	}
	if (!trs.asset.contract.definition.causes) {
		return cb('Invalid causes asset.');
	}
	if (!trs.asset.contract.definition.effects) {
		return cb('Invalid effects asset.');
	}
	var msg = __private.validateCauses(trs.asset.contract.definition.causes);
	if (msg) {
		return cb(msg);
	}
	if (trs.asset.contract.prevTransactionId === undefined) {
		return cb('Invalid prevTransactionId asset.');
	}
	if (trs.asset.contract.prevTransactionId) {
		modules.transactions.countByIdAndType({id: trs.asset.contract.prevTransactionId, type: 6}, function (err, count) {
			if (err) {
				return cb(err);
			}
			else if (!count) {
				return cb('Invalid previous transaction id.');
			}
			else {
				return cb(null, trs);
			}
		});
	}
	else {
		return cb(null, trs);
	}

	// async.parallel([
	// 	function(callback) {
	// 		if (trs.asset.contract.prevTransactionId) {
	// 			modules.transactions.countByIdAndType({id: trs.asset.contract.prevTransactionId, type: 6}, function (err, count) {
	// 				if (err) {
	// 					callback(err);
	// 				}
	// 				else if (!count) {
	// 					callback('Invalid previous transaction id.');
	// 				}
	// 				else {
	// 					callback(null);
	// 				}
	// 			});
	// 		}
	// 		else {
	// 			callback(null);
	// 		}
	// 	},
	// 	function(callback) {
	// 		//Sidechain Payment Smart Contract Type === 1
	// 		if(trs.asset.contract.type === 1 && trs.asset.contract.effect.transactionId) {
	// 			modules.transactions.countByIdAndType({id: trs.asset.contract.effect.transactionId, type: 7}, function (err, count) {
	// 				if (err) {
	// 					callback(err);
	// 				}
	// 				else if (!count) {
	// 					callback('Invalid sidechain transaction id.');
	// 				}
	// 				else {
	// 					modules.transactions.countConfirmations({id: trs.asset.contract.effect.transactionId, type: 7}, function (err, confirmations) {
	// 						if (err) {
	// 							callback(err);
	// 						}
	// 						else if (confirmations < 2) {
	// 							callback('Minimum 60 confirmations needed. Sidechain has '+confirmations+' confirmations.');
	// 						}
	// 						else {
	// 							callback(null);
	// 						}
	// 					});
	// 				}
	// 			});
	// 		}
	// 		else {
	// 			callback(null);
	// 		}
	// 	}
	// ], function(err) {
	// 	if(err) {
	// 		return cb(err);
	// 	}
	// 	else {
	// 		return cb(null, trs);
	// 	}
	// });
};

//
//__API__ `process`

//
Contract.prototype.process = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `getBytes`

//ToDo
Contract.prototype.getBytes = function (trs) {
	// var buf;
	// if(trs.asset.contract.type)
	// {
	// 	buf = new Buffer(trs.asset.contract.type, 'utf8');
	// }
	// else {
	// 	return null;
	// }
	// return buf;
	return null;
};

//
//__API__ `apply`

//
Contract.prototype.apply = function (trs, block, sender, cb) {
	var data = {
		address: sender.address
	};
	modules.accounts.setAccountAndGet(data, cb);
};

//
//__API__ `undo`

//
Contract.prototype.undo = function (trs, block, sender, cb) {
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
Contract.prototype.applyUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `undoUnconfirmed`

//
Contract.prototype.undoUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

Contract.prototype.schema = {
	id: 'Contract',
	type: 'object',
	properties: {
		publicKey: {
			type: 'string',
			format: 'publicKey'
		},
		address: {
			type: 'string'
		},
	},
	required: ['publicKey', 'address']
};

//
//__API__ `objectNormalize`

//
Contract.prototype.objectNormalize = function (trs) {
	var asset = {
		publicKey: trs.senderPublicKey,
		address: trs.asset.contract.trigger[0]
	};

	var report = library.schema.validate(asset, Contract.prototype.schema);

	if (!report) {
		throw 'Failed to validate Contract schema: ' + this.scope.schema.getLastErrors().map(function (err) {
			return err.message;
		}).join(', ');
	}

	return trs;
};

//
//__API__ `dbRead`

//
Contract.prototype.dbRead = function (raw) {
	return null;
};

//
//__API__ `dbSave`

//
Contract.prototype.dbTable = 'contracts';

Contract.prototype.dbFields = [
	'triggerAddress',
	'publicKey',
	'transactionId',
	'isActive'
];

Contract.prototype.dbSave = function (trs) {
	if(!trs.asset.contract.prevTransactionId)
	{
		return {
			table: this.dbTable,
			fields: this.dbFields,
			values: {
				triggerAddress: trs.asset.contract.trigger[0],
				publicKey: trs.senderPublicKey,
				transactionId: trs.id,
				isActive: true
			}
		};
	}
	else
	{
		library.db.none(sql.updateTransactionId, {oldTransactionId: trs.asset.contract.prevTransactionId, publicKey: trs.senderPublicKey, newTransactionId: trs.id})
			.then(function () {
			}).catch(function (err) {
				library.logger.error('stack', err.stack);
			});
		return null;
	}
};

//
//__API__ `ready`

//
Contract.prototype.ready = function (trs, sender) {
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
module.exports = Contract;
