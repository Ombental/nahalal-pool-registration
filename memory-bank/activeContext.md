# Active Context

## Current Focus

- Codebase refactor for maintainability and DRY principles.
- Extraction of common JS utilities into a single module.

## Recent Changes

- Created `js/utils.js` with:
  - `sha256` (async hash)
  - `setFeedback` (unified feedback display)
  - `arrayToCSV` and `downloadCSV` (CSV export)
  - `isFutureSlot` (date/time logic)
  - `getGroupColor` (color assignment for slot groups)
- Refactored all JS files to use these utilities via `window.nahalalUtils`.
- Removed duplicate code for hashing, feedback, CSV, and color logic.
- Improved maintainability and consistency across the codebase.

## Next Steps

- Monitor for further utility extraction opportunities.
- Continue modularizing and documenting as new features are added.

## Active Decisions & Considerations

- Table is rectangular and visually consistent regardless of slot configuration.
- All scroll and sticky header logic is handled via CSS for reliability.
- No pending refactors or technical debt in this area.

## Insights

- User experience for viewing large numbers of slots is now much improved.
- The table is now robust for both admins and regular users.
