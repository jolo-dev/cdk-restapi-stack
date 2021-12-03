// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharedConfig = require('../jest.config.json');
delete sharedConfig.projects;
module.exports = {
  ...sharedConfig,
};