const express = require('express');

const config = require('../config');
const Agent = require('./Agent');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const agent = new Agent();

agent.register()
  .then(() => {
    app.post('/build', (req, res) => {
      agent.build(req.body)
        .then(build => agent.notifyBuildResult(build))
        .catch(console.log);

      res.end();
    });
    app.listen(config.agentPort);
  })
  .catch(error => console.log(error));
