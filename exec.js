/* @flow */

const promisify = require("util").promisify;
const exec = promisify(require("child_process").exec);

module.exports = (command /*: string */) =>
  exec(command).then(({ stdout }) => stdout.trim());
