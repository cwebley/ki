var dto = module.exports = {};

dto.positive = function(x, d) {
	var i = parseInt(x || d || 0, 10);
	if (!i) return 0
	if (i < 0) return 0

	return i
}