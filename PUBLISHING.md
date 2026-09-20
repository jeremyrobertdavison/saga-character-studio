# Publishing releases

The manifest is configured for `jeremyrobertdavison/saga-character-studio`.

## Initial repository

1. Create a public GitHub repository named `saga-character-studio` under that account.
2. Do not generate a README or license; this package already includes them.
3. Upload the extracted package contents to the repository root, preserving folders. `module.json` and `README.md` must be at the root.
4. Commit the files to the default branch.

## Version 0.1.1 release

1. Open Releases and create a new release.
2. Create tag `v0.1.1` targeting the committed default branch.
3. Title it `SAGA Character Studio v0.1.1 — Initial Playtest`.
4. Describe the features and state that live Foundry testing remains outstanding.
5. Attach both `saga-character-studio-v0.1.1.zip` and `module.json` as release assets. The manifest must match the copy inside the ZIP.
6. To use the configured `/releases/latest/download/module.json` URL, publish a normal release and set it as latest. Do not mark it as a GitHub pre-release; retain the playtest label in its title and description.
7. Publish only after both assets finish uploading.

GitHub’s automatically generated source archives do not replace the named module ZIP asset referenced by the manifest. GitHub Pages is not required.

## Verify

Open these asset URLs while signed out or in a private browser window:

- https://github.com/jeremyrobertdavison/saga-character-studio/releases/latest/download/module.json
- https://github.com/jeremyrobertdavison/saga-character-studio/releases/download/v0.1.1/saga-character-studio-v0.1.1.zip

Both should download successfully. Install using the manifest URL through Foundry Setup → Add-on Modules → Install Module, then enable the module in a Simple Worldbuilding world.

## Future releases

1. Update source, run checks and tests, and rebuild the bundled app.
2. Update `version` in `module.json`, e.g. `0.1.2`.
3. Change its `download` URL to the new tag and exact ZIP name, e.g. `/releases/download/v0.1.1/saga-character-studio-v0.1.1.zip`.
4. Keep the `manifest` URL ending `/releases/latest/download/module.json` unchanged.
5. Update the changelog and commit the files.
6. Package the module with `module.json` at the ZIP root. Exclude `node_modules` and local test-server files.
7. Create the matching tag/release, attach the matching ZIP and manifest, and publish as latest.
8. Users can use Foundry’s module update controls from Setup. Changes to repository files alone do not update release assets.

If publishing elsewhere, update `url`, `manifest`, and `download` together before packaging.
