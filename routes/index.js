var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // res.render('landing');
  res.render('home')
});

module.exports = router;
