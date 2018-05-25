'use strict';

var ContractsSql = {
	updateTransactionId: 'UPDATE contracts SET "transactionId" = ${transactionId} where "accountId" = ${accountId} and "transactionId" = ${prevTransactionId};'
};

module.exports = ContractsSql;
