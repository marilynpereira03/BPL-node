'use strict';

var async = require('async');
var genesisblock = null;
var Router = require('../helpers/router.js');
var Contract = require('../logic/contract.js');
var transactionTypes = require('../helpers/transactionTypes.js');
var schema = require('../schema/contracts.js');
var sql = require('../sql/contracts.js');
var tsql = require('../sql/transactions.js');
var contractTypes = require('../helpers/contractTypes.js');

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
		'get /history': 'getHistory'
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
				// ************************** Remove if not needed
				// type: rawasset.contract.type,
				// label: rawasset.contract.label,
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
			return cb('Contracts#get error');
		});
	}
	else {
		return cb(null, history);
	}
};

// ************************** check where this function should be written
// ************** check if triggering tx already exists in table
__private.saveTriggeringTx = function(triggeringTxId, address, height, confirmation) {
	console.log('>>>>>>>>>>>>>>> saveTriggeringTx',triggeringTxId, address, height, confirmation);
	library.db.query(sql.insertTriggeringTx, {
		// transactionId: contractTxId,
		transactionId: triggeringTxId,
		address: address,
		confirmationHeight: (height + confirmation)
	}).then(function (rows) {

	}).catch(function (err) {
		library.logger.error('stack', err);
	});
};

__private.getTriggeringTxs = function(height, cb) {
	console.log('>>>>>>>>>>>>>>>>>> getTriggeringTxs height: ', height);
	library.db.query(sql.getTriggeringTxs, {
		height: height
	}).then(function (rows) {
			console.log('>>>>>>>>>>>>>>>>>> getTriggeringTxs found: ', rows);
			cb(null, rows);
	}).catch(function (err) {
		library.logger.error('stack', err);
	});
};

__private.validateCauses = function(triggeringTx, causes, height) {
	var isValid = true;
	for(var i = 0; i < causes.length; i++) {
	//causes.forEach(function (cause) {
		switch(causes[i].id) {
		case 1: if(triggeringTx.confirmation !== 0) {
			isValid = false;
		}
			console.log('case 1 ',isValid);
			break;
		case 2: if(triggeringTx.confirmation !== causes[i].confirmation)
			__private.saveTriggeringTx(triggeringTx.id, triggeringTx.recipientId, height, causes[i].confirmation);
			isValid = false;
			console.log('case 2 ',isValid);
			break;
		case 3: if (triggeringTx.balance > causes[i].balanceLimit) {
			isValid = false;
		}
			console.log('case 3 ',isValid, triggeringTx.balance, causes[i].balanceLimit);
			break;
		case 4: if (triggeringTx.senderId !== causes[i].senderId) {
			isValid = false;
		}
			console.log('case 4 ',isValid);
			break;
		case 5: if (triggeringTx.amount !== causes[i].amount) {
			isValid = false;
		}
			console.log('case 5', isValid, triggeringTx.amount, causes[i].amount);
			break;
		}
		if(!isValid) {
			break;
		}
	}
	return isValid;
	//changeto forecah **************
	// async.eachSeries(causes, function(cause, cb) {
	// 	console.log('>>>>>>>>>>>>>> ',cause);
	// 	switch(cause.id) {
	// 	case 1: if (cause.confirmation !== 0) {
	// 	cb('CAUSE_1 failed');
	// }
	// 		break;
	// 	case 2: __private.savePendingContract(id, contract, triggeringTx);
	// 		cb('CAUSE_2');
	// 		break;
	// 	case 3: if(cause.balanceLimit && tx.balance > cause.balanceLimit) { //if(tx.balance > cause.balanceLimit)
	// 		cb('CAUSE_3');
	// 	}
	// 		break;
	// 	case 4: if(cause.senderId && tx.senderId !== cause.senderId) {
	// 		cb('CAUSE_4');
	// 	}
	// 		break;
	// 	case 5: if(cause.amount && tx.amount !== cause.amount) {
	// 		cb('CAUSE_5');
	// 	}
	// 		break;
	// 	}
	// },
	// function(err) {
	// 	if(err) {
	// 		console.log('?>>>>>>>>>>>>>>>>>>>>> Contract cuases notmatch');
	//
	// 	}
	// 	else {
	// 		console.log('Send JSON to webhook');
	// 	}
	// });
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
					library.db.query(sql.getByTriggerAddress, {triggerAddress: transaction.recipientId}).then(function (contracts) {
						console.log('>>>>>>>>>>>>>>>>>> contracts '+contracts.length+ ' found for '+transaction.id+ ' '+ transaction.recipientId);
						//contracts.forEach(function(data) {
							for(var i = 0; i < contracts.length; i++) {
							var rawasset = JSON.parse(contracts[i].rawasset);
							console.log('>>>>>>>>>>>>>>>>>> contracts asset ',JSON.stringify(rawasset.contract.definition.causes));
							var result = __private.validateCauses(transaction, rawasset.contract.definition.causes, height);
							console.log('>>>>>>>>>>>>>>>>>> contracts validation result',result);
							if(result) {
								verifiedTriggeringTxs.push({transactionId: transaction.id, address: transaction.recipientId});
								break;
							}
						};
						cb();
					}).catch(function (err) {
						//need to handle if error occurs then the trigerring transacvtion should not be lost
						library.logger.error('stack', err);
						cb(err);
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
			// console.log('>>>>>>>>>>>> Webhook',res);
		}
	});
// async.each(transactions, function(transaction, cb) {
// 	console.log('>>>>>>>>>>>>>>>>>> ',transaction.label);
// 	if(transaction.type === 0) {
// 		//get contracts for specific address
// 		library.db.query(sql.getByTriggerAddress, {triggerAddress: transaction.recipientId}).then(function (contracts) {
// 			console.log('>>>>>>>>>>>>>>>>>> contracts found ',contracts.length);
// 			contracts.forEach(function(data) {
// 				var rawasset = JSON.parse(data.rawasset);
// 				console.log('>>>>>>>>>>>>>>>>>> contracts asset ',JSON.stringify(rawasset.contract.definition.causes, null, 2));
// 				var result = __private.validateCauses(transaction, rawasset.contract.definition.causes, height);
// 				console.log('>>>>>>>>>>>>>>>>>> validateCauses result',result, typeof(result));
// 				if(result) {
// 					fulfilledContracts.push({id: transaction.id, triggerAddress: transaction.recipientId});
// 				}
// 			});
// 			cb();
// 		}).catch(function (err) {
// 			//need to handle if error occurs then the trigerring transacvtion should not be lost
// 			library.logger.error('stack', err);
// 			cb(err);
// 		});
// 	}
// 	else {
// 		cb();
// 	}
// },
// function(err) {
// 	if(!err) {
// 		if(fulfilledContracts.length) {
// 		console.log('>>>>>>>>>>>>>>>> Suuccess send to webhook', fulfilledContracts);
// 		fulfilledContracts = [];
// 		}
//
// 		// getConfirmedTriggeringTxs(height, function(err, res) {
// 		// 	if(!err) {
// 		// 		//merge arr1 & arr2 and send to webhook
// 		// 	}
// 		// });
// 	}
// });
};

__private.getConfirmedTriggeringTxs = function (height, cb) {
	library.db.query(sql.getConfirmedTriggeringTxs, {triggerAddress: transaction.recipientId}).then(function (rows) {
		cb(null, rows);
	}).catch(function (err) {
		library.logger.error('stack', err);
		cb(err);
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


//__EVENT__ `onAttachPublicApi`

Contracts.prototype.onAttachPublicApi = function () {
	__private.attachApi();
};

// Shared
shared.getContracts = function (req, cb) {
	library.schema.validate(req.body, schema.getContracts, function (err) {
		if (err) {
			return cb(err[0].message);
		}

		var query = '', params = {}, errMsg = '';
		if(req.body.publicKey) {
			query = sql.getByPublicKey;
			params = {publicKey: req.body.publicKey};
			errMsg = 'Contracts not found: ' +req.body.publicKey;
		}
		else if(req.body.address) {
			query = sql.getByTriggerAddress;
			params = {triggerAddress: req.body.address};
			errMsg = 'Contracts not found: ' +req.body.address;
		}
		else {
			return cb(null, {success: false, error: 'Missing required property: address or publicKey'});
		}

		library.db.query(query, params).then(function (rows) {
			if (!rows.length) {
				return cb(errMsg);
			}

			var contracts = [];
			rows.forEach(function (row) {
				var contract = JSON.parse(row.rawasset).contract;
				delete contract.prevTransactionId;
				contracts.push(contract);
			});

			return cb(null,  {'contracts': contracts});
		}).catch(function (err) {
			library.logger.error('stack', err);
			return cb('Contracts#getByPublicKey error');
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
			return cb('Contracts#get error');
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

// Export
module.exports = Contracts;
