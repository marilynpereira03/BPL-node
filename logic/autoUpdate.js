'use strict';

var constants = require('../constants.json');
var sql = require('../sql/autoUpdates.js');

// Private fields
var modules, library, __private = {};

// Constructor
function AutoUpdate () {}

__private.validateTransactionAsset = function (data, cb) {
	library.db.query(sql.getByTransactionId, { transactionId: data.verifyingTransactionId}).then(function (rows) {
		if (rows.length) {
			var valid = true, msg = '';

			if (rows[0].verifyingTransactionId === null) {
				var properties = {
					versionLabel: data.versionLabel,
					triggerHeight: data.triggerHeight,
					ipfsHash: data.ipfsHash,
					ipfsPath: data.ipfsPath
				};

				for (var prop in properties) {
					if(data[prop] !== rows[0][prop]) {
						msg = 'Invalid transaction '+prop+' asset.';
						valid = false;
						break;
					}
				}

				if (!valid) {
					return cb(msg);
				}
				return cb(null);
			}
			return cb ('Auto update has already been verified.');
		}
		return cb ('Invalid verifying transaction id.');
	}).catch(function (err) {
		library.logger.error('stack', err.stack);
		return cb('Failed to get verifying transaction.');
	});
};

__private.getUpdate = function (data) {
	var exec = require('child_process').exec;

	exec('sh scripts/getUpdate.sh', function (error) {
		if (error) {
			console.log('There was an error downloading updates for: ',data.versionLabel);
		}
		console.log('Sucessfully downloaded updates for: ',data.versionLabel);
	});
};

// Public methods
//
//__API__ `bind`

//
AutoUpdate.prototype.bind = function (scope) {
	modules = scope.modules;
	library = scope.library;
};

//
//__API__ `create`

//
AutoUpdate.prototype.create = function (data, trs) {
	trs.recipientId = null;
	trs.amount = 0;

	return trs;
};

//
//__API__ `calculateFee`

//
AutoUpdate.prototype.calculateFee = function (trs) {
	return constants.fees.autoupdate;
};

//
//__API__ `verify`

//
AutoUpdate.prototype.verify = function (trs, sender, cb) {
	if (!trs.asset || !trs.asset.autoUpdate) {
		return cb('Invalid transaction asset.');
	}
	if (!trs.asset.autoUpdate.versionLabel && !trs.asset.autoUpdate.versionLabel.length) {
		return cb('Invalid version label asset.');
	}
	//TODO validate ipfsHash length and db datatype
	//and unique hash
	if (!trs.asset.autoUpdate.ipfsHash && !trs.asset.autoUpdate.ipfsHash.length) {
		return cb('Invalid IPFS hash asset.');
	}
	if (!trs.asset.autoUpdate.triggerHeight) {
		return cb('Invalid trigger height asset.');
	}
	else {
		var block = modules.blockchain.getLastBlock();
		if (trs.asset.autoUpdate.triggerHeight <= block.height) {
			return cb('Invalid trigger height asset.');
		}
	}
	if (!trs.asset.autoUpdate.ipfsPath && !trs.asset.autoUpdate.ipfsPath.length) {
		return cb('Invalid IPFS path asset.');
	}
	if (trs.asset.autoUpdate.verifyingTransactionId === undefined) {
		return cb('Invalid verifying transaction id asset.');
	}
	else if (trs.asset.autoUpdate.verifyingTransactionId) {
		__private.validateTransactionAsset(trs.asset.autoUpdate, function (err) {
			if (err) {
				return cb(err);
			}
			return cb(null, trs);
		});
	}
	else {
		return cb(null, trs);
	}
};

//
//__API__ `process`

//
AutoUpdate.prototype.process = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `getBytes`

//
AutoUpdate.prototype.getBytes = function (trs) {
	if (!trs.asset.autoUpdate.ipfsHash) {
		return null;
	}

	var buf;

	try {
		buf = new Buffer(trs.asset.autoUpdate.ipfsHash, 'utf8');
	} catch (e) {
		throw e;
	}

	return buf;
};

//
//__API__ `apply`

//
AutoUpdate.prototype.apply = function (trs, block, sender, cb) {
	modules.accounts.setAccountAndGet({address: sender.address}, cb);
};

//
//__API__ `undo`

//
AutoUpdate.prototype.undo = function (trs, block, sender, cb) {
	modules.accounts.setAccountAndGet({address: sender.address}, cb);
};

//
//__API__ `applyUnconfirmed`

//
AutoUpdate.prototype.applyUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

//
//__API__ `undoUnconfirmed`

//
AutoUpdate.prototype.undoUnconfirmed = function (trs, sender, cb) {
	return cb(null, trs);
};

AutoUpdate.prototype.schema = {
	id: 'Update',
	type: 'object',
	properties: {
		triggerHeight: {
			type: 'integer',
		},
		//  verifyingTransactionId: null
		versionLabel: {
			type: 'string',
		},
		ipfsHash: {
			type: 'string'
		},
		ipfsPath: {
			type: 'string'
		}
	},
	required: ['versionLabel', 'ipfsHash', 'ipfsPath']
};

//
//__API__ `objectNormalize`

//
AutoUpdate.prototype.objectNormalize = function (trs) {
	var report = library.schema.validate(trs.asset.autoUpdate, AutoUpdate.prototype.schema);

	if (!report) {
		throw 'Failed to validate autoupdate schema: ' + this.scope.schema.getLastErrors().map(function (err) {
			return err.message;
		}).join(', ');
	}

	return trs;
};

//
//__API__ `dbRead`

//
AutoUpdate.prototype.dbRead = function (raw) {
	return null;
};

//
//__API__ `dbSave`

//
AutoUpdate.prototype.dbTable = 'autoupdates';

AutoUpdate.prototype.dbFields = [
	'transactionId',
	'versionLabel',
	'triggerHeight',
	'ipfsHash',
	'ipfsPath',
	'verifyingTransactionId'
];

AutoUpdate.prototype.dbSave = function (trs) {
	if (trs.asset.autoUpdate.verifyingTransactionId) {
		library.db.none(sql.update, {transactionId: trs.id, verifyingTransactionId: trs.asset.autoUpdate.verifyingTransactionId})
			.then(function () {
				__private.getUpdate(trs.asset.autoUpdate);
			}).catch(function (err) {
				library.logger.error('stack', err.stack);
			});
	}
	else {
		return {
			table: this.dbTable,
			fields: this.dbFields,
			values: {
				transactionId: trs.id,
				versionLabel: trs.asset.autoUpdate.versionLabel,
				triggerHeight: trs.asset.autoUpdate.triggerHeight,
				ipfsHash: trs.asset.autoUpdate.ipfsHash,
				ipfsPath: trs.asset.autoUpdate.ipfsPath,
				verifyingTransactionId: trs.asset.autoUpdate.verifyingTransactionId
			}
		};
	}
	return null;
};

//
//__API__ `ready`

//
AutoUpdate.prototype.ready = function (trs, sender) {
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
module.exports = AutoUpdate;
