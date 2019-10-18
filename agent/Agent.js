const { spawn } = require('child_process');
const { join } = require('path');
const { remove } = require('fs-extra');
const axios = require('axios');
const config = require('../config');

const BUILD_STATUSES = {
  SUCCESS: 'Successful',
  IN_PROGRESS: 'In progress',
  FAIL: 'Failed',
  IN_QUEUE: 'In queue',
};

class Agent {
  constructor() {
    this.isVacant = true;
  }

  register() {
    return axios.post(`http://${config.serverHost}:${config.serverPort}/notify_agent`, {
      host: config.agentHost,
      agentPort: config.agentPort,
      isVacant: this.isVacant,
    });
  }

  async cloneRepository(buildId) {
    const cwd = join(__dirname, Agent.TMP_DIRECTORY_NAME);
    const process = spawn('git', ['clone', '-q', config.repositoryUrl, buildId], { cwd });

    return new Promise(((resolve, reject) => {
      process.on('error', err => reject({
        type: 'ERROR_CLONING_REPOSITORY',
        message: err.toString(),
      }));
      process.on('close', () => resolve());
    }));
  }

  checkoutRepository(commitHash, buildId) {
    const cwd = join(__dirname, Agent.TMP_DIRECTORY_NAME, buildId);
    const process = spawn('git', ['checkout', '-q', commitHash], { cwd });

    return new Promise(((resolve, reject) => {
      process.on('error', err => reject({
        type: 'ERROR_CHECKOUT_REPOSITORY',
        message: err.toString(),
      }));
      process.on('close', () => resolve());
    }));
  }

  async prepareRepository({ buildId, commitHash }) {
    try {
      await this.cloneRepository(buildId);
      await this.checkoutRepository(commitHash, buildId);
    } catch (error) {
      throw error;
    }
  }

  notifyBuildResult(build) {
    return axios.post(`http://${config.serverHost}:${config.serverPort}/notify_build_result`, build);
  }

  async build({ buildId, commitHash, command }) {
    const createdAt = new Date().toLocaleString();
    this.isVacant = false;

    try {
      await this.prepareRepository({ buildId, commitHash });
    } catch (error) {
      throw error;
    }

    const cwd = join(__dirname, Agent.TMP_DIRECTORY_NAME, buildId);
    const process = spawn(command, { shell: true, cwd });

    let stdout = '';
    let stderr = '';

    return new Promise((resolve) => {
      process.stdout.on('data', data => stdout += data);
      process.stderr.on('data', data => stderr += data);

      process.on('error', () => {
        const finishedAt = new Date().toLocaleString();
        this.isVacant = true;
        resolve({
          buildId,
          stdout,
          stderr,
          status: BUILD_STATUSES.FAIL,
          createdAt,
          finishedAt,
          command,
          commitHash,
        });
      });
      process.on('close', () => {
        const finishedAt = new Date().toLocaleString();
        this.isVacant = true;
        resolve({
          buildId,
          stdout,
          stderr,
          status: BUILD_STATUSES.SUCCESS,
          createdAt,
          finishedAt,
          command,
          commitHash,
        })
      });
    })
  }
}

Agent.TMP_DIRECTORY_NAME = 'tmp';

module.exports = Agent;
