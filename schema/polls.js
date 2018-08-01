"use strict";

module.exports = {
	getByAddress: {
		id: "polls.getByAddress",
		type: "object",
		properties: {
			address: {
				type: "string",
				minLength: 1,
				format: "address"
			}
		},
		required: ["address"]
	},
	getPoll: {
		id: "polls.getPoll",
		type: "object",
		properties: {
			name: {
				type: "string",
				minLength: 1,
			}
		},
		required: ["name"]
	},
	getPolls: {
		id: "polls.getPolls",
		type: "object",
		properties: {
			name: {
				type: "string",
				minLength: 1,
			},
			address: {
				type: "string",
				minLength: 1,
				format: "address"
			}
		}
	}
};
