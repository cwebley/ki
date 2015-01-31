

module.exports.requiresUser = function(req, res, next) {
	if(!req.session || !req.session.user || !req.session.user.username || !req.session.user.userId)
		return res.status(401).send();
	next()
}