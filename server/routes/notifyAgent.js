const express = require('express');
const router = express.Router();

const ci = require('../ci');

router.post('/', (req, res) => {
  // ci.registerAgent(req.body);
  res.json({
    status: 'ok'
  });
});

module.exports = router;
