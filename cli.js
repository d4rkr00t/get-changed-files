#!/usr/bin/env node
/* @flow */

const getChanged = require("./index");
const argv = process.argv.slice(2) || [];

function handleError(e) {
  console.error(e.stack || e.messgae);
  process.exit(1);
}

function prettyPrintResults(results) {
  return `changed:
  ${results.changed.join("\n  ") || "[]"}

uncommitted:
  ${results.uncommitted.join("\n  ") || "[]"}

untracked:
  ${results.untracked.join("\n  ") || "[]"}
`;
}

function prettyPrintResultsSubset(name, subset) {
  return `${name}:
  ${subset.join("\n  ") || "[]"}`;
}

function printTime(time) {
  const NS_PER_SEC = 1e9;
  const ms = (time[0] * NS_PER_SEC + time[1]) / 1e6;
  return `
⏱  Done in ${ms}ms`;
}

const startTime = process.hrtime();
const isJson = argv.indexOf("--json") > -1;
const only = (argv.find(arg => arg.startsWith("--only")) || "").split("=")[1];
const mainBranch = (argv.find(arg => arg.startsWith("--branch")) || "").split(
  "="
)[1];

getChanged({ mainBranch })
  .then(results => {
    if (!isJson && !only) {
      console.log(prettyPrintResults(results));
    } else if (isJson && !only) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      const subset = results[only];

      if (!subset) {
        throw new Error(`Subset "${only}" doesn't exist!"`);
      }

      if (isJson) {
        console.log(JSON.stringify(subset, null, 2));
      } else {
        console.log(prettyPrintResultsSubset(only, subset));
      }
    }

    if (!isJson) {
      console.log(printTime(process.hrtime(startTime)));
    }
  })
  .catch(handleError);
