# Validation — 0.1.0

Target: Foundry VTT 13.351 / Simple Worldbuilding 0.8.2.

Passed:
- TypeScript `tsc --noEmit`.
- Production Tailwind/Vite build; runtime dependencies bundled locally.
- Eight Node tests covering dice thresholds, attribute-vs-skill/power modifiers, allocation validation, duplicate display names, condition formulas, Actor creation/editing, legacy backups/preservation, ownership, creation permissions, and stale editor/session checks.
- React DOM interaction checks using jsdom and a mocked host bridge: mount, open Actor, retain power description, save before entering Play Mode, attribute and skill roll arguments, Heroism persistence on reopening, return to details. No UI runtime errors in these checks.

Not verified:
- Actual Foundry server/document behavior, multiplayer synchronization, file uploads and host-specific permissions.
- Visual layout in a browser, PNG export, browser speech, and native ApplicationV2 rendering.

A Chromium visual test was attempted but the runtime was unavailable and its download failed. DOM checks do not substitute for browser layout checks. No live Foundry installation was available. The manifest declares the intended compatibility target, not a completed live-server certification.

Build warnings: the browser-data table in the dependency toolchain is old and the main JS bundle exceeds Vite's advisory 500 kB threshold (about 143 kB gzip). Neither prevented the build.
