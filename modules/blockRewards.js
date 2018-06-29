// Constructor
function BlockRewards (cb, scope) {
	library = scope;
	self = this;
	return cb(null, self);
}


BlockRewards.prototype.onBind = function (scope) {
	modules = scope;
};
// Export
module.exports = BlockRewards;
