/**
 * The major version segment of the public API's URL space.
 *
 * This is a routing decision, not a semver output: it corresponds to the route
 * directory `src/app/api/v0` and only changes when a new major API is
 * deliberately built alongside the existing one. It is intentionally decoupled
 * from the project version in `src/lib/version.ts`.
 */
export const API_MAJOR = 'v0';
