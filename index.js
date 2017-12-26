/* @flow */

/*::
import type { GetDiffPoint, GetDiffPointParams, DiffPoint } from "./git";

export type CreateGetDiffPointParams = {
  customGetDiffPoint?: GetDiffPoint,
  getDiffPoint: GetDiffPoint
}
 */

const git = require("./git");

function createGetDiffPoint(
  { customGetDiffPoint, getDiffPoint } /*: CreateGetDiffPointParams */
) {
  return customGetDiffPoint
    ? function(params /*: GetDiffPointParams */) /*: DiffPoint */ {
        // $FlowFixMe
        return customGetDiffPoint(Object.assign(params, { getDiffPoint }));
      }
    : getDiffPoint;
}

async function getChanged({
  mainBranch = "master",
  customGetDiffPoint
} /*: { mainBranch: string, customGetDiffPoint?: GetDiffPoint } */ = {}) {
  const provider = git;

  const getDiffPoint = createGetDiffPoint({
    customGetDiffPoint,
    getDiffPoint: provider.getDiffPoint
  });
  const currentBranch = await provider.getCurrentBranch();
  const diffPoint = await getDiffPoint({ mainBranch, currentBranch });
  return await provider.getChangedFiles({ diffPoint });
}

module.exports = getChanged;
