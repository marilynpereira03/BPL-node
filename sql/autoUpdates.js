'use strict';

var AutoUpdatesSql = {

	getByTransactionId: 'SELECT * FROM autoupdates WHERE "transactionId" = ${transactionId}',

	getAllById: 'SELECT "transactionId" FROM autoupdates'

};

module.exports = AutoUpdatesSql;
