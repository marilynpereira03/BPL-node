'use strict';

var MemAccountsSql = {
      getBalance: 'select "balance", "address" from mem_accounts where "address" = ${address};'
};

module.exports = MemAccountsSql;
