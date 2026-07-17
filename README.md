# JWT Studio

A desktop app for generating and managing JWTs across multiple projects with different signing algorithms.

## Features

- Organize tokens by project
- Supports HMAC, RSA, ECDSA, RSA-PSS
- Edit token payloads with live validation
- Light and dark mode

## Demo

![JWT Studio](screenshots/app.png)

## Development notes

This project uses **TypeScript 7** (the Go-native `tsgo` compiler) for type-checking and builds (`npm run build`, `npm run electron:build`). Since TS 7.0 ships without a stable programmatic compiler API, `typescript-eslint` cannot use it directly and will crash if it tries ([typescript-eslint#12518](https://github.com/typescript-eslint/typescript-eslint/issues/12518), tracked upstream in [#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)).

To keep both working side by side, this repo follows [Microsoft's official workaround](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0):

- `"typescript"` in `package.json` is aliased to `@typescript/typescript6` — this is what `typescript-eslint` (and its `require('typescript')` calls) actually resolves to, so `npm run lint` keeps working.
- The real `typescript@7` package is installed under the name `"typescript-7"`. Because npm can't expose two different `tsc` binaries from the same `node_modules/.bin` folder, the build scripts invoke it directly: `node ./node_modules/typescript-7/bin/tsc -b`.

This should be reverted to a plain `"typescript": "^7.x"` dependency (with `typescript-eslint` reinstated normally) once TypeScript 7.1 ships a stable API and `typescript-eslint` adds support for it.
