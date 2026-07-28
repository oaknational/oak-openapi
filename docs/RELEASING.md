# Releasing

This project is versioned with [semantic versioning](https://semver.org) and
released automatically by
[release-please](https://github.com/googleapis/release-please) from conventional
commit messages.

The version describes **the repository**, not only the API contract. A fix to
the bulk export pipeline or a change to the playground moves the number, the
same as a change to an endpoint.

## How a release happens

1. You merge a pull request to `main`. Vercel deploys it, as always.
2. The [release workflow](../.github/workflows/release.yml) runs and asks
   release-please to look at the commits since the last release.
3. If any of them are releasable, release-please opens a pull request titled
   `chore(main): release x.y.z`. If one is already open, it updates it.
4. That pull request contains the bumped `package.json`, the bumped
   [`src/lib/version.ts`](../src/lib/version.ts), and a new `CHANGELOG.md`
   section. Review the changelog, edit the prose if it needs it, and merge.
5. Merging creates the `vx.y.z` tag and publishes the GitHub Release.

Releases are **batched**: several merges accumulate into one open release pull
request until somebody merges it. Nothing is released until you click merge.

Note that the release pull request will not have CI checks against it. Pull
requests opened by GitHub Actions do not trigger other workflows, by design. It
only ever touches three generated files, and the work it describes was already
tested on the pull requests that produced it.

## Which commits cause a release

Enforced by `commitlint` (`@commitlint/config-conventional`) on every commit.

| Prefix                            | Version impact         | In the changelog? |
| --------------------------------- | ---------------------- | ----------------- |
| `fix:`                            | patch (`0.7.0→0.7.1`)  | yes               |
| `feat:`                           | minor (`0.7.0→0.8.0`)  | yes               |
| `perf:`                           | patch                  | yes               |
| `feat!:` / `BREAKING CHANGE:`     | major (`0.7.0→1.0.0`)  | yes, highlighted  |
| `chore:`, `docs:`, `refactor:`, `style:`, `test:`, `ci:`, `build:` | none | no |

So write `fix:` when you fix something a user could notice, and `chore:` when
you tidy up. If a change is worth telling an API consumer about, its commit
subject is what they will read — write it for them.

## Breaking changes and `1.0.0`

The project is on `0.x`. Per the semver specification, on `0.x` "anything MAY
change at any time", so a breaking change may ship as a minor release —
`0.6.0` did exactly that.

There is no guard preventing the move to `1.0.0`. The first commit written as
`feat!:` or carrying a `BREAKING CHANGE:` footer will take the version there,
and release-please will do the rest. Write one deliberately when the API is
ready to be declared stable, not by accident.

## The URL major is not the semver major

The public API is served under `/api/v0`. That segment comes from
[`src/lib/apiVersion.ts`](../src/lib/apiVersion.ts) and is a **routing
decision**, deliberately decoupled from the project version.

This matters because `baseUrl` is interpolated into live response payloads —
asset URLs and pagination links — so a semver major bump must never silently
move the URL space out from under existing consumers.

Moving to `/api/v1` is a manual piece of work, not a side effect of a version
bump:

1. Create the `src/app/api/v1/` route directory alongside `v0`.
2. Update `API_MAJOR` in `src/lib/apiVersion.ts` to `'v1'`.
3. Decide what `/api/v0` does — it stays in place, taking security patches only,
   and should tell callers that `v1` exists.
4. Update [ENDPOINTS.md](ENDPOINTS.md) and the docs.

The two majors then coexist. The project version continues to describe the
repository as a whole; it does not fork per API major.

## Where the version is exposed

The only runtime surface is the OpenAPI document's `info.version`, visible in
`/playground` and `swagger.json`, read from `src/lib/version.ts`.

The `/changelog` and `/changelog/latest` endpoints were removed in `0.8.0`;
GitHub Releases and [CHANGELOG.md](../CHANGELOG.md) replace them.

## Configuration

| File                            | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `release-please-config.json`    | Release type, changelog path, `extra-files`      |
| `.release-please-manifest.json` | The current version — release-please owns this   |
| `.github/workflows/release.yml` | Runs release-please on push to `main`            |

`package.json` keeps `private: true`; nothing is published to npm.

The repository setting **Allow GitHub Actions to create and approve pull
requests** must remain enabled, or release-please cannot open its pull request.
