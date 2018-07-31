'use strict';

var AutoUpdatesSql = {
	getByTransactionId: 'SELECT * FROM autoupdates WHERE "transactionId" = ${transactionId}',

	getLatest: 'SELECT * FROM autoupdates WHERE "verifyingTransactionId" IS NOT NULL ORDER BY id DESC LIMIT 1',

	update: 'UPDATE autoupdates SET "transactionId" = ${transactionId}, "verifyingTransactionId" = ${verifyingTransactionId} WHERE "transactionId" = ${verifyingTransactionId}'
};

module.exports = AutoUpdatesSql;
