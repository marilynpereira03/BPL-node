'use strict';

var constants = require('../constants.json');

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
	trs.asset.hash = data.hash;
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
	if (!trs.asset || !trs.asset.hash) {
		return cb('Hash is undefined.');
	}
	if (!trs.asset.hash.length) {
		return cb('Invalid Smart Sidechain hash. Must not be empty');
	}
  if (!trs.asset.config.activeDelegates) {
		return cb('Invalid Delegate. Must not be empty');
	}
  if (!trs.asset.config.blockTime) {
		return cb('Invalid blocktime. Must not be empty');
	}
  if (!trs.asset.config.rewards.milestones.length) {
    return cb('Invalid reawrds. Must not be empty');
  }
  if (!trs.asset.config.rewards.type.length) {
    return cb('Invalid reawrd type. Must not be empty');
  }
  if (!trs.asset.config.tokenShortName.length) {
    return cb('Invalid token short name type. Must not be empty');
  }
	if (!trs.asset.config.rewards.offset) {
    return cb('Invalid offset. Must not be empty');
  }
	if (!trs.asset.config.rewards.distance) {
    return cb('Invalid distance. Must not be empty');
  }
	if (!trs.asset.config.totalAmount) {
    return cb('Invalid total amount. Must not be empty');
  }

	return cb(null, trs);
};

//
//__API__ `process`

//
Sidechain.prototype.process = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `getBytes`

//ToDo
Sidechain.prototype.getBytes = function (trs) {
	var buf;

	try {
		buf = trs.asset.hash ? new Buffer(trs.asset.hash, 'utf8') : null;
	} catch (e) {
		throw e;
	}

	return buf;
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

//
//__API__ `objectNormalize`

//
Sidechain.prototype.objectNormalize = function (trs) {
	delete trs.blockId;
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
Sidechain.prototype.dbSave = function (trs) {
	return null;
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
