'use strict';

var constants = require('../constants.json');
var sql = require('../sql/sidechain.js');

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
	if(!trs.asset) {
		return cb('Invalid transaction asset.');
	}
	if(!trs.asset.config) {
		return cb('Invalid config asset.');
	}
	if(!trs.asset.constants) {
		return cb('Invalid conatants asset.');
	}
  if (!trs.asset.constants.activeDelegates) {
		return cb('Active delegates must not be empty.');
	}
  if (!trs.asset.constants.blockTime) {
		return cb('Block Time must not be empty');
	}
	if(!trs.asset.constants.rewards) {
		return cb('Invalid rewards asset.');
	}
  if (!trs.asset.constants.rewards.milestones || !trs.asset.constants.rewards.milestones.length) {
    return cb('Invalid milestones asset.');
  }
  if (!(trs.asset.constants.rewards.type != "proportional" || trs.asset.constants.rewards.type != "static")) {
    return cb('Reward type must be static or proportional.');
  }
	if (!trs.asset.constants.rewards.offset) {
		return cb('Invalid reward offset.');
	}
	if (!trs.asset.constants.rewards.distance) {
		return cb('Invalid reward distance.');
	}
  if (!trs.asset.config.tokenShortName || !trs.asset.config.tokenShortName.length) {
    return cb('Invalid token short name.');
  }
	if (!trs.asset.constants.totalAmount) {
    return cb('Invalid total amount.');
  }
	if (!trs.asset.genesis) {
    return cb('Invalid genesis object.');
  }
	if (!trs.asset.status) {
    return cb('Invalid transaction status.');
  }
	if (!trs.asset.networks) {
		return cb('Invalid networks.');
	}
	if (!trs.asset.config.peersList) {
    return cb('Invalid peers asset.');
  }
	if (!trs.asset.config.nethash) {
    return cb('Invalid nethash.');
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
	return null;
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
Sidechain.prototype.dbTable = 'sidechain';

Sidechain.prototype.dbFields = [
	'ticker',
	'transactionId'
];
Sidechain.prototype.dbSave = function (trs) {
	if(!trs.asset.previousTransactionId)
	{
		return {
			table: this.dbTable,
			fields: this.dbFields,
			values: {
				ticker: trs.asset.networks.client.token,
				transactionId: trs.id
			}
		};
	}
  else
	{
	library.db.query(sql.updateTransactionId,{ticker:trs.asset.networks.client.token,transactionId:trs.id});
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
