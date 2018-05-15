'use strict';

var sidechainSql = {
  updateTransactionId: 'UPDATE sidechain SET "transactionId" = ${transactionId} where "ticker" = ${ticker};'
};

module.exports = sidechainSql;
