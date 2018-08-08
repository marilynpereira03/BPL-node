'use strict';

var AutoUpdatesSql = {

	getByTransactionId: 'SELECT * FROM autoupdates WHERE "transactionId" = ${transactionId}',

	getAllById: 'SELECT "transactionId" FROM autoupdates',

	getByTriggerHeight: 'SELECT * FROM autoupdates where "triggerHeight" = ${height}',

	getDuplicateWithNullVerifyingTxId: 'SELECT "transactionId" FROM autoupdates WHERE "versionLabel" = ${versionLabel} AND '+
	'"triggerHeight" = ${triggerHeight} AND "ipfsHash" = ${ipfsHash} AND "ipfsPath" = ${ipfsPath} AND "verifyingTransactionId" IS NULL',

	getDuplicateWithNotNullVerifyingTxId: 'SELECT "transactionId" FROM autoupdates WHERE "versionLabel" = ${versionLabel} AND '+
	'"triggerHeight" = ${triggerHeight} AND "ipfsHash" = ${ipfsHash} AND "ipfsPath" = ${ipfsPath} AND "verifyingTransactionId" = ${verifyingTransactionId}'
};

module.exports = AutoUpdatesSql;
