'use strict';

var AutoUpdatesSql = {

	getLatest: 'select * from autoupdates order by id desc limit 1',

	update: 'UPDATE autoupdates SET "transactionId" = ${transactionId}, "verifyingTransactionId" = ${verifyingTransactionId} WHERE "transactionId" = ${verifyingTransactionId}'

};

module.exports = AutoUpdatesSql;
