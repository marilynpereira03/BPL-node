'use strict';

var constants = require('../constants.json');

// Private fields
var modules, library;

// Constructor
function Poll () {}

// Public methods
//
//__API__ `bind`

//
Poll.prototype.bind = function (scope) {
	modules = scope.modules;
	library = scope.library;
};

//
//__API__ `create`

//
Poll.prototype.create = function (data, trs) {
	trs.recipientId = data.recipientId;
	trs.amount = data.amount;

	return trs;
};

//
//__API__ `calculateFee`

//
Poll.prototype.calculateFee = function (trs) {
	return constants.fees.send;
};

//
//__API__ `verify`

//
Poll.prototype.verify = function (trs, sender, cb) {
	var isAddress = /^[1-9A-Za-z_]{1,45}$/g;
  if (!trs.asset || !trs.asset.poll) {
  return cb('Invalid transaction asset');
}

if (!trs.asset.poll.pollName) {
  return cb('Poll name is undefined');
}

if (!trs.asset.poll.pollStartDate) {
  return cb('Poll Start date is undefined');
}

if (!trs.asset.poll.pollEndDate) {
  return cb('Poll End date is undefined');
}

if (!trs.asset.poll.pollAddress) {
  return cb('Poll address undefined');
}

if(trs.asset.poll.pollEndDate<=trs.asset.poll.pollStartDate) {
  return cb('Poll start date must be smaller than Poll end date');
}

if (!trs.asset.poll.pollAddress || !isAddress.test(trs.asset.poll.pollAddress)) {
  return cb('Invalid Address');
}

if(trs.asset.poll.pollAddress){
  modules.polls.isDuplicateAddress(trs.asset.poll.pollAddress,function(err){
    if(err)
    return cb('Poll Address is already used. Must have unique address');
  });
}

if(trs.asset.poll.pollName){
  modules.polls.isDuplicatePoll(trs.asset.poll.pollName,function(err){
    if(err)
    return cb('Poll Name is already exists. Must have unique name');
  });
}
	return cb(null, trs);
};

//
//__API__ `process`

//
Poll.prototype.process = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `getBytes`

//
Poll.prototype.getBytes = function (trs) {
  if (!trs.asset.poll.pollName) {
  		return null;
  	}

  	var buf;

  	try {
  		buf = new Buffer(trs.asset.poll.pollName, 'utf8');
  	} catch (e) {
  		throw e;
  	}

  	return buf;
  };

//
//__API__ `apply`

//
Poll.prototype.apply = function (trs, block, sender, cb) {
	modules.accounts.setAccountAndGet({address: trs.recipientId}, function (err, recipient) {
		if (err) {
			return cb(err);
		}

		modules.accounts.mergeAccountAndGet({
			address: trs.recipientId,
			balance: trs.amount,
			u_balance: trs.amount,
			blockId: block.id,
			round: modules.rounds.getRoundFromHeight(block.height)
		}, cb);
	});
};

//
//__API__ `undo`

//
Poll.prototype.undo = function (trs, block, sender, cb) {
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
Poll.prototype.applyUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `undoUnconfirmed`

//
Poll.prototype.undoUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `objectNormalize`

//
Poll.prototype.objectNormalize = function (trs) {
	delete trs.blockId;
	return trs;
};

//
//__API__ `dbRead`

//
Poll.prototype.dbRead = function (raw) {
	return null;
};

Poll.prototype.dbTable = 'poll';

Poll.prototype.dbFields = [
	'pollName',
  'pollStartDate',
  'pollEndDate',
  'pollAddress',
  'intentions',
	'transactionId'
];
//
//__API__ `dbSave`

//
Poll.prototype.dbSave = function (trs) {
  return {
		table: this.dbTable,
		fields: this.dbFields,
		values: {
			pollName: trs.asset.poll.pollName,
      pollStartDate: trs.asset.poll.pollStartDate,
      pollEndDate: trs.asset.poll.pollEndDate,
      pollAddress: trs.asset.poll.pollAddress,
      intentions: trs.asset.poll.intentions.toString(),
			transactionId: trs.id
		}
	};
};

//
//__API__ `ready`

//
Poll.prototype.ready = function (trs, sender) {
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
module.exports = Poll;
