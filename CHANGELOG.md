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

- Added support for logging in an output window all executed steps (default false - no logging in the output window)
- Added support for ignoring not used exports via comments (default false - obey the comment in the code)
  ```javascript
  // find-unused-exports:ignore-next-line-exports
  export default MyClass;
  ```
- Added the possibility to remove a file or export from the list of results

### Changed

- Update packages

### Removed

- Nothing

## 1.1.1 (2020-12-02)

### Added

- Nothing

### Changed

- Removed the hide action icon when no unused export is found

### Removed

- Nothing

## 1.1.2 (2020-12-03)

### Added

- Nothing

### Changed

- Corrected the analyse of the js projects
- Corrected the analyse of the ts projects with allowJs enabled in tsconfig.json

### Removed

- Nothing

## 1.2.0 (2020-12-22)

### Added

- Added support for exported consts and types via object destructuring

### Changed

- Nothing

### Removed

- Nothing

## 1.3.0 (2020-12-23)

### Added

- Added support for detection of circular imports/dependences, which produce undefined variables by import

### Changed

- Nothing

### Removed

- Nothing

## 1.3.1 (2020-12-23)

### Added

- Nothing

### Changed

- Clicking on a circular dependency in panel will open it in editor

### Removed

- Nothing
