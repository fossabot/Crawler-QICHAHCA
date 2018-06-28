const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get('/getKey/:_key', async function(req, res, next) {
//   let keywords = new Array(req.params._key);
//   await getKey(keywords);
//   res.status(200).json();
// });

module.exports = router;
