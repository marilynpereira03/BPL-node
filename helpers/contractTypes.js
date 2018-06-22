'use strict';

module.exports = {
	causes: {
		1: {
			type: 'Zero confirmation',
			property: 'confirmations'
		},
		2: {
			type: 'Confirmed',
			property: 'confirmations'
		},
		3: {
			type: 'Balanced breached',
			property: 'balanceLimit'
		},
		4: {
			type: 'Specific source',
			property: 'senderId'
		},
		5: {
			type: 'Specific amount',
			property: 'amount'
		},
		10: {
			type: 'Sidechain payment',
			property: 'sidechainId'
		},
		100: {
			type: 'Specific reference',
			property: 'reference'
		}
	},
	effects: {}
};
