'use strict';

var SidechainsSql = {
	updateTransactionId: 'UPDATE sidechains SET "transactionId" = ${transactionId} where "ticker" = ${ticker};',

	countByTicker: 'SELECT COUNT(*)::int FROM sidechains WHERE "ticker" = ${ticker};',

	getByTicker: 'SELECT rawasset FROM transactions WHERE "id" = (SELECT "transactionId" FROM sidechains WHERE "ticker" = ${ticker});',

	getByPublicKey: 'SELECT rawasset FROM transactions WHERE "id" IN (SELECT "transactionId" FROM sidechains WHERE "publicKey" = ${publicKey});'
};

module.exports = SidechainsSql;
