'use strict';

var PollsSql = {
	countByAddress: 'SELECT * from poll where "pollAddress" = ${pollAddress};',
	countByPoll: 'SELECT * from poll where "pollName" = ${pollName};',
  getPollResultByAddress: 'SELECT p."pollName" as Poll, t."senderId" as sender, t.payload as intention from poll as p, transactions as t where p."pollAddress" = ${pollAddress} and t."recipientId" = p."pollAddress" and t.type=0 AND t.timestamp<=p."pollEndDate" AND t.timestamp >= p."pollStartDate";'
};

module.exports = PollsSql;
