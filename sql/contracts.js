'use strict';

var ContractsSql = {
	updateTransactionId: 'UPDATE contracts SET "transactionId" = ${transactionId} where "accountId" = ${accountId} and "transactionId" = ${prevTransactionId};',

	getByPublicKey: 'SELECT rawasset FROM transactions WHERE "id" IN (SELECT "transactionId" FROM contracts WHERE "publicKey" = ${publicKey});',

	getByAddress: 'SELECT rawasset FROM transactions WHERE "id" IN (SELECT "transactionId" FROM contracts WHERE "accountId" = ${address});',
};

module.exports = ContractsSql;
