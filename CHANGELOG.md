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

## 1.3.2 (2020-12-23)

### Added

- Nothing

### Changed

- Nothing

### Removed

- Debug code

## 1.3.3 (2020-12-24)

### Added

- Nothing

### Changed

- Made the check for circular dependencies by default to be disabled

### Removed

- Nothing

## 1.3.4 (2020-12-24)

### Added

- Log of the ellapsed time used to analyse the project
- Remove the comments from tsconfig.json before validating it as JSON

### Changed

- Improved the performance of circular dependecies

### Removed

- Nothing

## 1.3.5 (2020-12-27)

### Added

- Nothing

### Changed

- Nothing

### Removed

- Removed the detection of circular dependencies because of the poor performance

## 1.4.0 (2021-01-11)

### Added

- Added the detection of circular dependencies using a new algorithm
- Added the possibility to display the results initially expanded (instead of collapsed)

### Changed

- Nothing

### Removed

- Nothing

## 1.4.1 (2021-01-12)

### Added

- Nothing

### Changed

- Clicking on a file name will search for the name of the first circular dependency (if any)

### Removed

- Nothing

## 1.4.2 (2021-02-15)

### Added

- Nothing

### Changed

- Fixed the crash on folders having .js or .ts as extension
- Updated packages

### Removed

- Nothing

## 1.4.3 (2021-02-28)

### Added

- Nothing

### Changed

- Updated packages

### Removed

- Nothing

## 1.4.4 (2021-04-23)

### Added

- Nothing

### Changed

- Avoiding reporting empty paths as circular paths

### Removed

- Nothing

## 1.5.0 (2021-05-21)

### Added

- Nothing

### Changed

- Corrected the rules used to find the files containing code
- Corrected the rule for removing the comments from .json files

### Removed

- Nothing

## 1.6.0 (2021-05-21)

### Added

- Added support for "export let" and "export var"
- Added support for "import type"
- Added support for "import \* as"
- Added a test-project for improving the testing

### Changed

- The algorithm for detecting the not used exports

### Removed

- Nothing

## 1.7.0 (2021-05-25)

### Added

- Added a test-project for js for improving the testing

### Changed

- The algorithm for detecting the use of exports imported through "import" or "required"

### Removed

- Nothing
