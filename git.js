/* @flow */

const exec = require("./exec");

async function getDiffPoint(
  {
    mainBranch,
    currentBranch
  } /*: { mainBranch: string, currentBranch: string } */
) {
  if (mainBranch !== currentBranch) return { commit: mainBranch };
  const lastMerge = await exec('git log --pretty=format:"%H" --merges -n 1');
  // For main branch a diff point is either lastMerge commit or main branch itself
  return lastMerge ? { merge: lastMerge } : { commit: mainBranch };
}

async function getCurrentBranch() {
  return exec("git rev-parse --abbrev-ref HEAD");
}

async function getChangedFromMerge({ merge } /*: { merge: string }*/) {
  return (await exec(`git log ${merge}^..${merge} --name-only --format=""`))
    .split("\n")
    .filter(file => !!file);
}

async function getCachedChangedSince({ commit } /*: { commit: string } */) {
  return (await exec(`git diff --cached --name-only ${commit}`))
    .split("\n")
    .filter(file => !!file);
}

async function getUncommitedChanged() {
  return (await exec("git diff --name-only"))
    .split("\n")
    .filter(file => !!file);
}

async function getUncommitedCachedChanged() {
  return (await exec("git diff --name-only --cached"))
    .split("\n")
    .filter(file => !!file);
}

async function getUntrackedChanged() {
  return (await exec("git ls-files --others --exclude-standard"))
    .split("\n")
    .filter(file => !!file);
}

async function getChangedFiles(
  { diffPoint } /*: { diffPoint : { merge?: string, commit?: string } }*/
) {
  const { merge, commit } = diffPoint;
  let changed = [];

  if (merge) {
    // If diff point type is a merge commit – get all changed files in that merge commit
    changed = changed.concat(await getChangedFromMerge({ merge }));
  } else if (commit) {
    // Default strategy is to just diff against some point in the past
    changed = changed.concat(await getCachedChangedSince({ commit }));
  }

  const uncommited = (await getUncommitedChanged()).concat(
    await getUncommitedCachedChanged()
  );
  const untracked = await getUntrackedChanged();

  changed = changed.concat(uncommited).concat(untracked);

  return { changed, uncommited, untracked };
}

module.exports = {
  getDiffPoint,
  getCurrentBranch,
  getChangedFiles,
  getChangedFromMerge,
  getCachedChangedSince,
  getUncommitedChanged,
  getUntrackedChanged
};
