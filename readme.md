# module-starter-typescript

[![Build Status][travis]](https://travis-ci.org/ceddybi/mts)
[![coverage][codecov]](https://codecov.io/gh/ceddybi/mts)
[![Node.js version][node-version]][node-version]
[![Jest][jest]][jest]
[![GNU Make][make]][make]

> Starter project for building Node.js modules with TypeScript

### Getting started

1. Clone the repository:

```bash
git clone https://github.com/ceddybi/mts.git <name>
```

2. Edit fields on [package.json](./package.json):

```js
{
  "name": "module-name",
  "repository": "module-repo",
  "author": "your-info"
  // ...
}
```

3. Install dependencies:

```bash
yarn install
```

4. Add your library code on `src/` and tests on `/test`.

### Scripts

All scripts are defined on the `Makefile`.

Compile TypeScript files:

```bash
make build
```

Lint files:

```bash
make lint
```

Run tests:

```bash
make test
```

Show coverage report:

```bash
make coverage
```

Remove auto-generated folders:

```bash
make clean
```

## License

MIT © [Ceddy Muhoza](https://github.com/ceddybi)

<!-- Badges -->

[node-version]: https://img.shields.io/badge/Node.js->=6-brightgreen.svg
[jest]: https://img.shields.io/badge/tested_with-jest-99424f.svg
[make]: https://img.shields.io/badge/Built%20with-GNU%20Make-brightgreen.svg
[travis]: https://travis-ci.org/ceddybi/mts.svg?branch=master
[codecov]: https://codecov.io/gh/ceddybi/mts/branch/master/graph/badge.svg
