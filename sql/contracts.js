'use strict';

var ContractsSql = {
	updateTransactionId: 'UPDATE contracts SET "transactionId" = ${newTransactionId} WHERE "transactionId" = ${oldTransactionId} AND "publicKey"=${publicKey};',

	getByPublicKey: 'SELECT t."rawasset", c."isActive" FROM transactions t INNER JOIN contracts c ON t."id" = c."transactionId" WHERE c."publicKey" = ${publicKey};',

	getByTriggerAddress: 'SELECT t."rawasset", c."isActive" FROM transactions t INNER JOIN contracts c ON t."id" = c."transactionId"  WHERE c."triggerAddress" = ${triggerAddress};',

	getActive: 'SELECT "rawasset" FROM transactions t INNER JOIN contracts c ON t."id" = c."transactionId"  WHERE c."triggerAddress" = ${triggerAddress} AND c."isActive" IS TRUE;',

	insertTriggeringTx: 'INSERT INTO triggering_transactions("transactionId", "recipientId", "confirmationHeight") VALUES (${transactionId}, ${recipientId}, ${confirmationHeight});',

	getTriggeringTxs: 'SELECT "transactionId", "recipientId" from triggering_transactions where "confirmationHeight" < ${height};',

	deleteTriggeringTx: 'DELETE FROM triggering_transactions WHERE "transactionId" = ${transactionId};',

	getCauses: 'SELECT * FROM causes;'
};

module.exports = ContractsSql;
