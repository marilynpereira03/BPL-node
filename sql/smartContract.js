'use strict';

var smartContractSql = {
  updateTransactionId: 'UPDATE smart_contract SET "transactionId" = ${transactionId} where "accountId" = ${accountId} and "transactionId" = ${prevTransactionId};'
};

module.exports = smartContractSql;
