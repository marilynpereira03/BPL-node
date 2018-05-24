'use strict';

module.exports = {
	getSidechain: {
		id: 'sidechains.getSidechain',
		type: 'object',
		properties: {
			ticker: {
				type: 'string',
				minLength: 3,
				maxLength: 6
			}
		},
		required: ['ticker']
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
	}
};
