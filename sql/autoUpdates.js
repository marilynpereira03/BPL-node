'use strict';

var AutoUpdatesSql = {

	getByTransactionId: 'SELECT * FROM autoupdates WHERE "transactionId" = ${transactionId}',

	getAllById: 'SELECT "transactionId" FROM autoupdates',

	getByTriggerHeight: 'SELECT * FROM autoupdates where "triggerHeight" = ${height}'

};

module.exports = AutoUpdatesSql;
