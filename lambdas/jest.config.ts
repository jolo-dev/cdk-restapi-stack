// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharedConfig = require('../jest.config.json');
delete sharedConfig.projects;
process.env.TZ = 'CET';
module.exports = {
  ...sharedConfig,
};