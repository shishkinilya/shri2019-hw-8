const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');

const ci = require('../ci');
const db = require('../db');

router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'CI - Главная',
    heading: 'CI',
    builds: db.get('builds').value(),
  });
});

router.post('/', (req, res) => {
  const buildId = randomstring.generate();

  ci.registerBuild({
    buildId,
    command: req.body.command,
    commitHash: req.body.commit_hash,
  });
  res.redirect('/');
});

module.exports = router;
