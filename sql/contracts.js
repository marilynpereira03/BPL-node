'use strict';

var ContractsSql = {
	updateTransactionId: 'UPDATE contracts SET "transactionId" = ${newTransactionId} WHERE "transactionId" = ${oldTransactionId} AND "publicKey"=${publicKey};',

	getByPublicKey: 'SELECT "rawasset" FROM transactions WHERE "id" IN (SELECT "transactionId" FROM contracts WHERE "publicKey" = ${publicKey});',

	getByAddress: 'SELECT "rawasset" FROM transactions WHERE "id" IN (SELECT "transactionId" FROM contracts WHERE "triggerAddress" = ${address});'
};

module.exports = ContractsSql;
