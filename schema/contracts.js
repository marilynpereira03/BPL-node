'use strict';

module.exports = {
	getContract: {
		id: 'contracts.getContract',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1
			}
		},
		required: ['id']
	},
	getContracts: {
		id: 'contracts.getContracts',
		type: 'object',
		properties: {
			publicKey: {
				type: 'string',
				format: 'publicKey'
			},
			address: {
				type: 'string',
				minLength: 1,
				maxLength: 34
			}
		}
	},
	getHistory: {
		id: 'contracts.getHistory',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1
			},
			limit: {
				type: 'integer',
				minimum: 1,
				maximum: 50
			},
		},
		required: ['id']
	},
	deleteTriggeringTx: {
		id: 'contracts.deleteTriggeringTx',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1
			}
		},
		required: ['id']
	}
};
