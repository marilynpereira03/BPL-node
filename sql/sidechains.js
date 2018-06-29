'use strict';

var SidechainsSql = {
	updateTransactionId: 'UPDATE sidechains SET "transactionId" = ${newTransactionId} WHERE "transactionId" = ${oldTransactionId} AND "publicKey"=${publicKey};',

	countByTicker: 'SELECT COUNT(*)::int FROM sidechains WHERE "ticker" = ${ticker};',

	getByTicker: 'SELECT "rawasset" FROM transactions t INNER JOIN sidechains s ON t."id" = s."transactionId" WHERE s."ticker" = ${ticker};',

	getByPublicKey: 'SELECT "rawasset" FROM transactions t INNER JOIN sidechains s ON t."id" = s."transactionId" WHERE s."publicKey" = ${publicKey};',

	getTransactionId: 'SELECT "transactionId" FROM sidechains WHERE ticker = ${ticker};'
};

module.exports = SidechainsSql;
