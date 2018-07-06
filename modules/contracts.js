'use strict';

var async = require('async');
var genesisblock = null;
var Router = require('../helpers/router.js');
var Contract = require('../logic/contract.js');
var transactionTypes = require('../helpers/transactionTypes.js');
var schema = require('../schema/contracts.js');
var sql = require('../sql/contracts.js');
var tsql = require('../sql/transactions.js');
var request = require('request');

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
		'get /history': 'getHistory',
		'get /causes': 'getCauses',
		'get /triggeringTx': 'deleteTriggeringTx'
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
			return cb('Contracts#getHistory error');
		});
	}
	else {
		return cb(null, history);
	}
};

__private.getContracts = function (query, params, cb) {
	library.db.query(query, params).then(function (rows) {
		if (!rows.length) {
			return cb('Contracts not found: '+params[Object.keys(params)[0]]);
		}

		var contracts = [];
		rows.forEach(function (row) {
			var result = JSON.parse(row.rawasset).contract;
			result.isActive = row.isActive;
			delete result.prevTransactionId;
			contracts.push(result);
		});

		return cb(null, contracts);
	}).catch(function (err) {
		library.logger.error('stack', err);
		return cb('Contracts#getContracts error');
	});
};

__private.saveTriggeringTx = function (triggeringTxId, recipientId, height, confirmation) {
	console.log('>>>>>>>>>>>>>>> saveTriggeringTx',triggeringTxId, recipientId, height, confirmation);
	library.db.query(sql.insertTriggeringTx, {
		transactionId: triggeringTxId,
		recipientId: recipientId,
		confirmationHeight: (height + confirmation)
	}).then(function (rows) {

	}).catch(function (err) {
		library.logger.error('stack', err);
	});
};

__private.getTriggeringTxs = function (height, cb) {
	console.log('>>>>>>>>>>>>>>>>>> getTriggeringTxs height: ', height);
	library.db.query(sql.getTriggeringTxs, {
		height: height
	}).then(function (rows) {
		cb(null, rows);
	}).catch(function (err) {
		library.logger.error('stack', err);
	});
};

//TODO
__private.sendTriggeringTxsToBit = function (triggeringTxs) {
	console.log('>>>>>> In sendTriggeringTxsToBit',triggeringTxs);
	var options = {
		method: 'POST',
		url: 'http://10.0.0.220:3000/bit/triggeringTxs',
		body: {
			payload: triggeringTxs
		},
		json: true
	};

	request(options, function (err, res) {
		console.log('RESPONSE FROM BiT >>', res.body);
	});
};


__private.validateCauses = function(triggeringTx, causes, height) {
	var isValid = true;
	var savedTx = false;

	for(var i = 0; i < causes.length; i++) {
		switch(causes[i].id) {
		//Zero confirmation
		case 1: if(triggeringTx.confirmation !== 0) {
			isValid = false;
		}
			console.log('case 1 ',isValid);
			break;
		//Confirmation
		case 2: if(triggeringTx.confirmation !== causes[i].confirmation) {
			__private.saveTriggeringTx(triggeringTx.id, triggeringTx.recipientId, height, 3);
			console.log('case 2 ',isValid);
			savedTx = true;
		}
			break;
		//Balance breach
		case 3: if (triggeringTx.balance > causes[i].balanceLimit) {
			isValid = false;
		}
			console.log('case 3 ',isValid, triggeringTx.balance, causes[i].balanceLimit);
			break;
		//Specific source
		case 4: if (triggeringTx.senderId !== causes[i].senderId) {
			isValid = false;
		}
			console.log('case 4 ',isValid);
			break;
		//Specific amount
		case 5: if (triggeringTx.amount !== causes[i].amount) {
			isValid = false;
		}
			console.log('case 5', isValid, triggeringTx.amount, causes[i].amount);
			break;
		//Reference
		case 6: if (triggeringTx.reference !== causes[i].reference) {
			isValid = false;
		}
			console.log('case 6',isValid);
			break;
		}

		if(!isValid) {
			break;
		}
	}

	return (isValid && !savedTx);
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

//
//__API__ `checkContracts`

//
Contracts.prototype.checkContractsToExecute = function (height, transactions) {
	console.log('>>>>>>>>>>>>>>>>>> In checkContractsToExecute height: ',height);

	async.parallel([
		function(callback) {
			var verifiedTriggeringTxs = [];
			async.each(transactions, function(transaction, cb) {
				console.log('>>>>>>>>>>>>>>>>>> ',transaction.label, transaction.id, transaction.recipientId);
				if(transaction.type === 0) {
					//get contracts for specific address
					__private.getContracts(sql.getActive, {triggerAddress: transaction.recipientId, id: transaction.id}, function (err, contracts) {
					//library.db.query(sql.getByTriggerAddress, {triggerAddress: transaction.recipientId}).then(function (contracts) {
						if(err) {
							cb(err);
						}
						console.log('>>>>>>>>>>>>>>>>>> contracts found tx, recp, contracts '+transaction.id, transaction.recipientId,contracts.length);
						//contracts.forEach(function(data) {
						for(var i = 0; i < contracts.length; i++) {
							console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> contracts [i]', JSON.stringify(contracts[i]));
							// if(contracts[i].isActive) {
							var result = __private.validateCauses(transaction, contracts[i].definition.causes, height);
							if(result) {
								verifiedTriggeringTxs.push({transactionId: transaction.id, address: transaction.recipientId});
								break;
							}
							// }
						}
						cb();
					});
				}
				else {
					cb();
				}
			},
			function(err) {
				if(!err) {
					console.log('>>>>>>>>>>>>>>>>>> BLOCK: verified triggering tx ', verifiedTriggeringTxs);
					callback(null, verifiedTriggeringTxs);
					verifiedTriggeringTxs = [];
				}
				else {
					callback(err);
				}
			});
		},
		function(callback) {
			var verifiedTriggeringTxs = [];
			__private.getTriggeringTxs(height, function (err, res) {
				if(!err) {
					console.log('>>>>>>>>>>>>>>>>>> PENDING: verified triggering tx ', verifiedTriggeringTxs);
					callback(null, res);
				}
				else {
					callback(err);
				}
			});
		},
	], function(err, res) {
		console.log('FINAL: ', err,res);
		if(!err) {
			var triggeringTxs = res[0].merge(res[1]);
			__private.sendTriggeringTxsToBit(triggeringTxs);
		}
	});
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


// Events
//
//__EVENT__ `onAttachPublicApi`

//
Contracts.prototype.onAttachPublicApi = function () {
	__private.attachApi();
};

// Shared
shared.getContracts = function (req, cb) {
	library.schema.validate(req.body, schema.getContracts, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		var query = '', params = {};
		if(req.body.publicKey) {
			query = sql.getByPublicKey;
			params = {publicKey: req.body.publicKey};
		}
		else if(req.body.address) {
			query = sql.getByTriggerAddress;
			params = {triggerAddress: req.body.address};
		}
		else {
			return cb(null, {success: false, error: 'Missing required property: address or publicKey'});
		}

		__private.getContracts(query, params, function (err, res) {
			if(err) {
				return cb(err);
			}
			return cb(null, {contracts: res});
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
			return cb('Contracts#getContract error');
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


shared.getCauses = function (req, cb) {
	library.db.query(sql.getCauses).then(function (rows) {
		if (!rows.length) {
			return cb('Causes not found.');
		}

		return cb(null, {causes: rows});
	}).catch(function (err) {
		library.logger.error('stack', err);
		return cb('Contracts#getCauses error');
	});
};


shared.deleteTriggeringTx = function (req, cb) {
	library.schema.validate(req.body, schema.deleteTriggeringTx, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		//TODO
		library.db.query(sql.deleteTriggeringTx, {transactionId: req.body.transactionId}).then(function (rows) {
			return cb({message: 'Success'});
		}).catch(function (err) {
			library.logger.error('stack', err.stack);
			return cb('Contracts#deleteTriggeringTx error');
		});
	});
};

// Export
module.exports = Contracts;
