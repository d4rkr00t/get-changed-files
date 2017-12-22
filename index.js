/* @flow */

const git = require("./git");

async function getChanged({ mainBranch = "master", customGetDiffPoint } = {}) {
  const provider = git;

  const getDiffPoint = customGetDiffPoint || provider.getDiffPoint;
  const currentBranch = await provider.getCurrentBranch();
  const diffPoint = await getDiffPoint({ mainBranch, currentBranch });

  return await provider.getChangedFiles({ diffPoint });
}

module.exports = getChanged;
