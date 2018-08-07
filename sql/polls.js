"use strict";

var PollsSql = {
	countByAddress: 'SELECT COUNT(*) FROM polls WHERE "address" = ${address};',
	getPollResultByAddress: 'SELECT p.name AS poll, t."senderId" AS sender, t.payload AS intention, t.id as "transactionId" FROM polls AS p, transactions AS t WHERE p.address = ${address} AND t."recipientId" = p."address" AND t.type=0 AND t.timestamp<=p."endTimestamp" AND t.timestamp >= p."startTimestamp";',
	getAllPolls: 'SELECT name AS poll, address,"startTimestamp" AS startdate, "endTimestamp" AS enddate, intentions, "transactionId" FROM polls',
	getPoll: 'SELECT name AS poll, address,"startTimestamp" AS startdate, "endTimestamp" AS enddate, intentions, "transactionId" FROM polls WHERE name = ${name}',
	getPollByAddress: 'SELECT name AS poll, address,"startTimestamp" AS startdate, "endTimestamp" AS enddate, intentions, "transactionId" FROM polls WHERE address = ${address}'
};

module.exports = PollsSql;
