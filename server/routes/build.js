const express = require('express');
const router = express.Router({ mergeParams: true });

const db = require('../db');

router.get('/', function(req, res, next) {
  const build = db
    .get('builds')
    .find({ buildId: req.params.id })
    .value();

  res.render('build', { title: 'CI - Информация о сборке', heading: 'Информация о сборке', build });
});

module.exports = router;
