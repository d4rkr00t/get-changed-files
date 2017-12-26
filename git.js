/* @flow */

const exec = require("./exec");

/*::

export type GetDiffPointParams = {
  mainBranch: string,
  currentBranch: string,
  getDiffPoint?: GetDiffPoint
};

export type DiffPoint = { merge?: string, commit?: string };

export type GetDiffPoint = (params: GetDiffPointParams) => DiffPoint;
 */

async function getDiffPoint(
  { mainBranch, currentBranch } /*: GetDiffPointParams*/
) /*: DiffPoint */ {
  if (mainBranch !== currentBranch) return { commit: mainBranch };
  const lastMerge = await exec('git log --pretty=format:"%H" --merges -n 1');
  // For main branch a diff point is either lastMerge commit or main branch itself
  return lastMerge ? { merge: lastMerge } : { commit: mainBranch };
}

async function getCurrentBranch() {
  return exec("git rev-parse --abbrev-ref HEAD");
}

async function getChangedFromMerge({ merge } /*: { merge: string } */) {
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

async function getChangedFiles({ diffPoint } /*: { diffPoint: DiffPoint }*/) {
  const { merge, commit } = diffPoint;
  let changed = [];

  if (merge) {
    // If diff point type is a merge commit – get all changed files in that merge commit
    changed = changed.concat(await getChangedFromMerge({ merge }));
    changed = changed.concat(await getCachedChangedSince({ commit: merge }));
  } else if (commit) {
    // Default strategy is to just diff against some point in the past
    changed = changed.concat(await getCachedChangedSince({ commit }));
  }

  const uncommitted = (await getUncommitedChanged()).concat(
    await getUncommitedCachedChanged()
  );
  const untracked = await getUntrackedChanged();

  changed = changed.concat(uncommitted).concat(untracked);

  return { changed, uncommitted, untracked };
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
