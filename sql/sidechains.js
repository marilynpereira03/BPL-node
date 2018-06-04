'use strict';

var SidechainsSql = {
	updateTransactionId: 'UPDATE sidechains SET "transactionId" = ${transactionId} WHERE "ticker" = ${ticker};',

	countByTicker: 'SELECT COUNT(*)::int FROM sidechains WHERE "ticker" = ${ticker};',

	getByTicker: 'SELECT "rawasset" FROM transactions WHERE "id" = (SELECT "transactionId" FROM sidechains WHERE "ticker" = ${ticker});',

	getByPublicKey: 'SELECT "rawasset" FROM transactions WHERE "id" IN (SELECT "transactionId" FROM sidechains WHERE "publicKey" = ${publicKey});',

	getTransactionId: 'SELECT "transactionId" FROM sidechains WHERE ticker = ${ticker};'
};

module.exports = SidechainsSql;
