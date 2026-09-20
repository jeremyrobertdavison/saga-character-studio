# SAGA Character Studio

Version 0.1.0 — first playtest release for Foundry VTT 13 and Simple Worldbuilding 0.8.2.

A guided SAGA character creator and Play Mode inside Foundry. Created for SAGA, a tabletop roleplaying game by Jeremy Davison. No Gemini account, API key, Google AI Studio deployment, or separate web server is required.

## Requirements

- Foundry Virtual Tabletop 13.
- A world using the Simple Worldbuilding game system (target version: 0.8.2).
- Owner permission on characters being edited.

This is an early playtest release. Automated checks have passed; live Foundry and visual testing remain outstanding. See [VALIDATION.md](VALIDATION.md) for the test coverage and known verification limits.

## Installation

1. From the Foundry Setup screen, open **Add-on Modules → Install Module**.
2. Paste this URL into **Manifest URL**:

   ```text
   https://github.com/jeremyrobertdavison/saga-character-studio/releases/latest/download/module.json
   ```

3. Click **Install**.
4. Launch a Simple Worldbuilding world.
5. Open **Game Settings → Manage Modules**, enable **SAGA Character Studio**, and save.
6. Open the **Actors** sidebar and click **SAGA Character Studio**. A wizard-hat tool is also added under Token Controls.

For manual installation, download the module ZIP from [Releases](https://github.com/jeremyrobertdavison/saga-character-studio/releases), extract its contents into `Data/modules/saga-character-studio/`, and restart Foundry. Ensure `module.json` is directly inside that directory.

A Script macro can also open the interface:

```js
game.modules.get("saga-character-studio").api.open();
```

## Features

- Guided character details, attributes, skills, powers and weaknesses.
- Direct creation and editing of Foundry Actors.
- `.sagaChar` import/export, text sheets and PNG sheets.
- Play Mode with Foundry chat rolls, Heroism and conditions.
- Versioned character build data and reviewed migration of legacy formula-only Actors.
- Bundled interface assets with selectable themes and browser read-aloud.

## Create and edit

Choose **Create New Hero**, then follow Details → Attributes → Skills → Powers → Weaknesses → Summary. **Save to Foundry** creates a world Actor. Further saves update that same Actor. **Open Actor** loads an owned character for editing. Players need Owner permission to edit; creating a new Actor additionally requires Foundry's Create Actors permission. The GM can instead create a blank character, assign ownership, and let a player open it here.

Point allocations must match the creator's budgets: attributes 5 × level, skills 6 × level, powers 5 × level. Incomplete drafts can be downloaded with **Export .sagaChar**; they are not committed as finished Actors. Unsaved drafts are not automatically restored after closing or reloading.

**Load Hero** imports a `.sagaChar` file into the current editing target. To create a separate Actor from a file, first choose **Create New Hero**, then **Load Hero**. To migrate an existing Actor, first open that Actor, then import its file.

Saving updates the name, biography, portrait when supplied, and the three SAGA formula groups. Existing health/power resources, unrelated groups, ownership, effects, token settings and token artwork are preserved. Custom additions inside the three SAGA groups are replaced by the reviewed build. Existing prototype token names are not automatically renamed.

## Existing converted characters

Old converter exports contain formulas but not original point allocations or attribute links. Open such an Actor to view its existing formulas. Import its original `.sagaChar` file, or use **Enter missing build choices** and supply its original level, allocations, links, descriptions and weaknesses. Defaults in that form are placeholders, not inferred values.

The first conversion save requires confirmation and stores the original Actor system, name and portrait under `flags.saga-character-studio.legacyBackup`. This backup is an aid to recovery, not a replacement for a world backup; there is no one-click restore interface in this release. Use a duplicate of an existing Actor for the first migration test.

## Play Mode

Entering Play Mode saves the current build first. Attribute checks roll only the attribute die. Skills and powers roll their own die plus the linked attribute's point value. Unlinked entries add zero. Results use Foundry's roll engine, chat speaker and selected roll visibility.

Heroism, conditions and the latest 100 rolls are stored on the world Actor. The GM and owners can reopen them from another browser. Play state is loaded when entering Play Mode; if another window changes it, reopen Play Mode to refresh. Conflict checks detect prior edits but are not a server-side transaction lock; avoid simultaneous saves to the same Actor.

Injured and Empowered modify non-free rolls. Selecting a new severity replaces the previous severity in the same family. Power Dampened disables power rolls. Guilty prevents Heroism gain; Guilt-Ridden disables the Spend button. Other conditions are visible reminders, not complete combat automation. Spending Heroism tracks the resource; it does not automatically reroll, add +5 or apply narrative benefits. Critical checks award Heroism on the base die's minimum or maximum, following the creator’s existing behavior; free dice do not. Reset Session clears this module's state but leaves Foundry chat intact.

New player Actors use linked tokens. Existing unlinked tokens are untouched: this editor always operates on the world Actor, not an unlinked scene token's independent data. Use linked player tokens if their state should follow the world character.

## Artwork and exports

New PNG/JPEG/WebP/GIF portraits up to 10 MB upload to `worlds/<world-id>/`. The uploader needs File Upload permission. Existing token artwork remains separate. New Actors initially use the portrait for the token; adjust the token through Foundry afterward.

Exports include `.sagaChar`, text sheets and PNG sheets. Existing Foundry artwork paths remain server references in character saves; keep/copy that artwork when moving a character to another server. Imported embedded portraits are uploaded on Actor save. Themes use bundled CSS and local fallback fonts; browser read-aloud depends on available browser voices. Optional resources links open third-party websites.

## Architecture and future standalone SAGA system

Full character builds are stored under `flags.saga-character-studio.build` with schema version 1. Simple Worldbuilding formulas are a generated projection; the internal legacy group spelling `Attibutes` is retained for compatibility. Editing generated fields through the default sheet is not a two-way build editor: use Studio for permanent build changes. Prior direct edits are detected if a Studio editor was already open.

Rules/projection: `scripts/rules.mjs`. Foundry integration: `scripts/module.js`. Creator UI: `development/source`. The interface runs in a same-origin iframe inside an ApplicationV2 window, isolating its styling while using Foundry's document and roll APIs. There is no remote hosted application dependency.

The full build data and UI can be reused in a future SAGA system, with an explicit Actor migration. No promise of compatibility with other game systems is made.

## Development and validation

The `development` folder includes source, dependency lockfile, tests and build configuration. Run `npm ci`, `npm run check`, `npm test`, then `npm run build` from that folder. The resulting `development/module/app` folder replaces the installed package's `app` folder. Integration source is duplicated under `development/module/scripts` for testing; copy edited scripts to the package's `scripts` directory when releasing.

Validated through TypeScript checking, production bundling, rules tests and a mocked Foundry document adapter. Browser test results are recorded in VALIDATION.md. This release has not been exercised in a live Foundry installation; begin in a test world or with a duplicate character.

## First in-world check

1. Create and save a level 1 character; reopen it and confirm all allocations and descriptions.
2. Reload Foundry and reopen the Actor.
3. Enter Play Mode, roll an attribute and a skill, and check Foundry chat.
4. Change Heroism/conditions, leave Play Mode and reopen it.
5. Test using a player account with Owner permission.
6. On a duplicate legacy Actor, import its `.sagaChar` file; confirm existing token artwork and resource values remain intact.

Disabling the module leaves the generated Simple Worldbuilding fields and saved flags in the world. Keep a world backup before first testing migrations.

## Support

Report bugs through [GitHub Issues](https://github.com/jeremyrobertdavison/saga-character-studio/issues). Include the module, Foundry and Simple Worldbuilding versions, whether the problem occurs as a GM or player, reproduction steps, and relevant browser console errors. Remove private character or campaign information from public reports.

## Publishing and contributing

See [PUBLISHING.md](PUBLISHING.md) for release packaging and update instructions. Source and build instructions are in the Development section above.

## License

MIT. See [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
