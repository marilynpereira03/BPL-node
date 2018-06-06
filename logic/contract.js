'use strict';

var async = require('async');
var bpljs = require('bpljs');
var constants = require('../constants.json');
var contractTypes = require('../helpers/contractTypes.js');
var sql = require('../sql/contracts.js');

// Private fields
var modules, __private = {}, library;

// Constructor
function Contract () {}

// Private menthods
__private.validateFields = function (type, cause, effect) {
	type = ''+type;

	if(contractTypes[type]) {
		var causeProps = contractTypes[type].cause;
		var effectProps = contractTypes[type].effect;

		for(var i=0; i<causeProps.length; i++) {
			if(!cause[causeProps[i]])
				return 'Invalid '+causeProps[i]+' asset.';
		}

		for(var j=0; j<effectProps.length; j++) {
			if(!effect[effectProps[j]])
				return 'Invalid '+effectProps[j]+' asset.';
		}

		return null;
	}
	return 'Invalid type asset.';
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
	if (!trs.asset.contract.type) {
		return cb('Invalid type asset.');
	}
	if (!trs.asset.contract.cause) {
		return cb('Invalid cause asset.');
	}
	if (!trs.asset.contract.effect) {
		return cb('Invalid effect asset.');
	}
	var msg = __private.validateFields(trs.asset.contract.type, trs.asset.contract.cause, trs.asset.contract.effect);
	if(msg) {
		return cb(msg);
	}
	if (!trs.asset.contract.hasOwnProperty('prevTransactionId')) {
		return cb('Missing property - prevTransactionId.');
	}

	async.series([
		function(callback) {
			if (trs.asset.contract.prevTransactionId) {
				library.logic.transaction.countByIdAndType({id: trs.asset.contract.prevTransactionId, type: 6}, function (err, count) {
					if (err) {
						callback(err);
					}
					else if (!count) {
						callback('Invalid previous transaction id.');
					}
					else {
						callback(null, 'success');
					}
				});
			}
			else {
				callback(null, 'success');
			}
		},
		function(callback) {
			//Sidechain Payment Smart Contract type === 1
			if(trs.asset.contract.type === 1 && trs.asset.contract.effect.transactionId) {
				library.logic.transaction.countByIdAndType({id: trs.asset.contract.effect.transactionId, type: 7}, function (err, count) {
					if (err) {
						callback(err);
					}
					else if (!count) {
						callback('Invalid sidechain transaction id.');
					}
					else {
						callback(null, 'success');
					}
				});
			}
			else {
				callback(null, 'success');
			}
		},
		function(callback) {
			//Sidechain Payment Smart Contract type === 1
			if(trs.asset.contract.type === 1) {
				library.logic.transaction.countConfirmations({id: trs.asset.contract.effect.transactionId, type: 7}, function (err, confirmations) {
					if (err) {
						callback(err);
					}
					else if (confirmations < 60) {
						callback('Minimum 60 confirmations needed. Sidechain has '+confirmations+' confimations.');
					}
					else {
						callback(null, 'success');
					}
				});
			}
			else {
				callback(null, 'success');
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

//
//__API__ `objectNormalize`

//
Contract.prototype.objectNormalize = function (trs) {
	delete trs.blockId;
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
	'accountId',
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
				accountId: trs.asset.contract.cause.address,
				publicKey: trs.senderPublicKey,
				transactionId: trs.id,
				isActive: true
			}
		};
	}
	else
	{
		library.db.query(sql.updateTransactionId, {prevTransactionId: trs.asset.contract.prevTransactionId, transactionId: trs.id});
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
