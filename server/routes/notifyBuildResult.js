const express = require('express');
const router = express.Router();

const db = require('../db');

router.post('/', (req, res) => {
  db.get('builds').push(req.body).write();
});

module.exports = router;
