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
			}
		}
	}
};
