'use strict';

var ContractsSql = {
	updateTransactionId: 'UPDATE contracts SET "transactionId" = ${newTransactionId} WHERE "transactionId" = ${oldTransactionId} AND "publicKey"=${publicKey};',

	getByPublicKey: 'SELECT "rawasset" FROM transactions t INNER JOIN contracts c ON t."id" = c."transactionId" WHERE c."publicKey" = ${publicKey};',

	getByTriggerAddress: 'SELECT "rawasset" FROM transactions t INNER JOIN contracts c ON t."id" = c."transactionId"  WHERE c."triggerAddress" = ${triggerAddress};',

	insertTriggeringTx: 'INSERT INTO triggering_transactions("transactionId", "address", "confirmationHeight") VALUES (${transactionId}, ${address}, ${confirmationHeight});',

	getTriggeringTxs: 'SELECT "transactionId", "address" from triggering_transactions where "confirmationHeight" < ${height};'
};

module.exports = ContractsSql;
