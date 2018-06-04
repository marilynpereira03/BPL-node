'use strict';

module.exports = {
	getSidechain: {
		id: 'sidechains.getSidechain',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1
			},
			ticker: {
				type: 'string',
				minLength: 3,
				maxLength: 6
			}
		}
	},
	getSidechains: {
		id: 'sidechains.getSidechains',
		type: 'object',
		properties: {
			publicKey: {
				type: 'string',
				format: 'publicKey'
			}
		},
		required: ['publicKey']
	},
	getHistory: {
		id: 'sidechains.getHistory',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1
			},
			ticker: {
				type: 'string',
				minLength: 3,
				maxLength: 6
			},
			limit: {
				type: 'integer',
				minimum: 1,
				maximum: 50
			}
		}
	}
};
