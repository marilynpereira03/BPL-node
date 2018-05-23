'use strict';

var sidechainSql = {
  updateTransactionId: 'UPDATE sidechain SET "transactionId" = ${transactionId} where "ticker" = ${ticker};',
  getSidechain: 'SELECT COUNT(*)::int FROM sidechain WHERE "ticker" = ${ticker};',
};

module.exports = sidechainSql;
