const axios = require('axios');

const config = require('../config');

class Ci {
  constructor() {
    this.builds = [];
  }

  async registerBuild(buildInfo) {
    try {
      const build = await axios.post(`http://${config.agentHost}:${config.agentPort}/build`, buildInfo);
      this.builds.push(build);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new Ci();
