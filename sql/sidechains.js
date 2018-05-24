'use strict';

var SidechainSql = {
	updateTransactionId: 'UPDATE sidechain SET "transactionId" = ${transactionId} where "ticker" = ${ticker};',

	countByTicker: 'SELECT COUNT(*)::int FROM sidechain WHERE "ticker" = ${ticker};',

	getByTicker: 'SELECT rawasset FROM transactions WHERE "id" = (SELECT "transactionId" FROM sidechain WHERE "ticker" = ${ticker});',

	getByPublicKey: 'SELECT rawasset FROM transactions WHERE "id" IN (SELECT "transactionId" FROM sidechain WHERE "publicKey" = ${publicKey});'
};

module.exports = SidechainSql;
