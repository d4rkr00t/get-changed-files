# Get Changed Files

> Get a list of changed files using git.

## Install

```sh
npm intall get-changed-files --save-dev
yarn add get-changed-files --dev
```

## API

### Simple usage

Without any options `get-changed-files` assumes that `master` is the main branch to compare it against current branch and also uses [default strategy](https://github.com/d4rkr00t/get-changed-files/blob/15125b8aa6a128547ddca7edbb1eebde3f62541e/git.js#L18-L25) for determining diff point (point in history from which to start getting changes).

```js
const getChangedFiles = require("get-changed-files");
getChangedFiles().then(results => console.log(results));

/**
 * Outputs:
 * {
 *   "changed": [
 *     "some-old-changed-file.js",
 *     "package.json",
 *     "new-file.js"
 *   ],
 *   "uncommitted": [
 *     "package.json"
 *   ],
 *   "untracked": [
 *     "new-file.js"
 *   ]
 * }
 */
```

### Changing main branch

```js
const getChangedFiles = require("get-changed-files");
getChangedFiles({ mainBranch: "develop" }).then(results =>
  console.log(results)
);
```

### Custom get diff point strategy

```js
const getChangedFiles = require("get-changed-files");
const customGetDiffPoint = ({ currentBranch, mainBranch }) => {
  // do some magic...
  return { commit: commit_hash_from_which_to_start_getting_changes };
};
getChangedFiles({ customGetDiffPoint }).then(results => console.log(results));
```

## CLI

Also `get-changed-files` adds a CLI tool `get-changed`.

```sh
get-changed --help

  Get a list of changed files

  Usage
    $ get-changed

  Options
    --branch, -b     Specify main branch [default: master].
    --only, -o       Specify subset of results to be printed e.g. – changed | uncommitted | untracked.
    --names          Output file names only without any formatting. Can't be used with --json.
    --json           Output result as json. Can't be used with --names-only.

  Examples
    $ get-changed --only=changed
    $ get-changed --json --only=changed
    $ get-changed --names-only
```
