var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'RefineMe' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'RefineMe', session_token: req.query.session_token });
});
router.get('/room', function(req, res, next) {
  res.render('room', { title: 'RefineMe' });
});

module.exports = router;
