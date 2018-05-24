'use strict';

var contractSql = {
  updateTransactionId: 'UPDATE smart_contract SET "transactionId" = ${transactionId} where "accountId" = ${accountId} and "transactionId" = ${prevTransactionId};'
};

module.exports = contractSql;
