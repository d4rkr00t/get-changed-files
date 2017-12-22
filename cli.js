#!/usr/bin/env node
/* @flow */

const meow = require("meow");
const chalk = require("chalk");
const getChanged = require("./index");
const argv = process.argv.slice(2) || [];

function handleError(e) {
  console.error(chalk.red(e.stack || e.message));
  process.exit(1);
}

function prettyPrintResults(results, names) {
  if (names) {
    return results.changed.join("\n");
  }

  return `
  ${chalk.yellow("changed:")}
    ${results.changed.join("\n    ") || "[]"}

  ${chalk.yellow("uncommitted:")}
    ${results.uncommitted.join("\n    ") || "[]"}

  ${chalk.yellow("untracked:")}
    ${results.untracked.join("\n    ") || "[]"}
`;
}

function prettyPrintResultsSubset(name, subset, names) {
  if (names) {
    return subset.join("\n");
  }

  return `
  ${chalk.yellow(name)}:
    ${subset.join("\n    ") || "[]"}
`;
}

function printTime(time) {
  const NS_PER_SEC = 1e9;
  const ms = (time[0] * NS_PER_SEC + time[1]) / 1e6;
  return chalk.green(`  ⏱  Done in ${ms}ms`);
}

const startTime = process.hrtime();

const cli = meow(
  `
    ${chalk.green("Usage")}
      $ get-changed

    ${chalk.green("Options")}
      ${chalk.yellow("--branch, -b")}     Specify main branch [default: master].
      ${chalk.yellow(
        "--only, -o"
      )}       Specify subset of results to be printed e.g. – changed | uncommitted | untracked.
      ${chalk.yellow(
        "--names"
      )}          Output file names only without any formatting. Can't be used with --json.
      ${chalk.yellow(
        "--json"
      )}           Output result as json. Can't be used with --names-only.

    ${chalk.green("Examples")}
      $ get-changed --only=changed
      $ get-changed --json --only=changed
      $ get-changed --names-only
`,
  {
    autoHelp: true,
    flags: {
      branch: {
        type: "string",
        alias: "b"
      },
      only: {
        type: "string",
        alias: "o"
      },
      names: {
        type: "boolean"
      },
      json: {
        type: "boolean"
      }
    }
  }
);

const { branch, only, names, json } = cli.flags;

if (json && names) {
  console.error(chalk.red("Flags --json and --names can't be used together!"));
  process.exit(1);
}

getChanged({ mainBranch: branch })
  .then(results => {
    if (!json && !only) {
      console.log(prettyPrintResults(results, names));
    } else if (json && !only) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      const subset = results[only];

      if (!subset) {
        throw new Error(`Subset "${only}" doesn't exist!"`);
      }

      if (json) {
        console.log(JSON.stringify(subset, null, 2));
      } else {
        console.log(prettyPrintResultsSubset(only, subset, names));
      }
    }

    if (!json && !names) {
      console.log(printTime(process.hrtime(startTime)));
    }
  })
  .catch(handleError);
