'use strict';

var PollsSql = {
	countByAddress: 'SELECT * from poll where "pollAddress" = ${pollAddress};',
	countByPoll: 'SELECT * from poll where "pollName" = ${pollName};',
  getPollResultByAddress: 'SELECT * from poll as p where p."pollAddress" = ${pollAddress} INNER JOIN transactions as t ON t."recipientId" = p."pollAddress" where t.type=1 AND t.timestamp<=p."pollEndDate" AND t.timestamp >= p."pollStartDate";'
};

module.exports = PollsSql;
