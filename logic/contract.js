'use strict';

var constants = require('../constants.json');

// Private fields
var modules, library;

// Constructor
function Contract () {}

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
	trs.asset.hash = data.hash;
	return trs;
};

//
//__API__ `calculateFee`

//
Contract.prototype.calculateFee = function (trs) {
	return constants.fees.smartContract;
};

//
//__API__ `verify`

//
Contract.prototype.verify = function (trs, sender, cb) {
	if (!trs.asset || !trs.asset.hash) {
		return cb('Hash is undefined.');
	}

	if (!trs.asset.hash.length) {
		return cb('Invalid Smart Contract hash. Must not be empty');
	}


	if (!trs.asset.label.length) {
		return cb('Invalid Smart Contract label. Must not be empty');
	}
	return cb(null, trs);
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
Contract.prototype.dbSave = function (trs) {
	return null;
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
