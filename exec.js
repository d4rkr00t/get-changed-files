const promisify = require("util").promisify;
const exec = promisify(require("child_process").exec);

module.exports = (...args) => exec(...args).then(({ stdout }) => stdout.trim());
