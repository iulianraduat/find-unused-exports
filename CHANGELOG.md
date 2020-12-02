# Change Log

All notable changes to the "Find Unused Exports" extension will be documented in this file.

## 1.0.0 (2020-07-01)

### Added

- Automatically find all exports and imports in .ts and .tsx files
- Automatically find all exports and imports in .js and .jsx files, if tsconfig.json allows for .js files in project
- All imports from node modules are ignored
- The test files are ignored, hence the exports used only by unit tests will be displayed as not used
- If tsconfig.json defines baseUrl, it will resolve all imports using paths relative to baseUrl
- A file having all exports not used will be marked as "not used" and a delete button will be available
- If there are no unused exports, then the panel will display an entry saying this

### Changed

- Nothing

### Removed

- Nothing

## 1.0.1 (2020-09-06)

### Added

- Detect export interface

### Changed

- Update packages

### Removed

- Nothing

## 1.0.2 (2020-09-21)

### Added

- Detect export function

### Changed

- Update packages

### Removed

- Nothing

## 1.0.3 (2020-10-06)

### Added

- Detect aliased imports and exports

### Changed

- Update packages
- Fixed the detection of "export \* as"

### Removed

- Nothing

## 1.1.0 (2020-12-02)

### Added

- Added support for logging in VS Code all discovery steps
- Added support for ignoring not used exports via comments
- Added the possibility to remove a file or export only from the list of results

### Changed

- Update packages

### Removed

- Nothing
