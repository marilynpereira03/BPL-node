"use strict";

var PollsSql = {
	countByAddress: "SELECT COUNT(*) from polls where \"address\" = ${address};",
	getPollResultByAddress: "SELECT p.name as poll, t.\"senderId\" as sender, t.payload as intention from polls as p, transactions as t where p.address = ${address} and t.\"recipientId\" = p.\"address\" and t.type=0 AND t.timestamp<=p.\"endTimestamp\" AND t.timestamp >= p.\"startTimestamp\";",
	getAllPolls: "SELECT name as poll, address,\"startTimestamp\" as startdate, \"endTimestamp\" as enddate, intentions from polls",
	getPoll: "SELECT name as poll, address,\"startTimestamp\" as startdate, \"endTimestamp\" as enddate, intentions from polls where name = ${name}"
};

module.exports = PollsSql;
