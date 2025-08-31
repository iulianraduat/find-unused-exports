# Change Log

All notable changes to the "Find Unused Exports" extension will be documented in this file.

### Note

This extension assumes a set of default exclude folders:

- \*\*/\*.d.ts
- node_modules/\*\*/\*
- \*\*/node_modules/\*\*/\*

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

## 1.7.1 (2021-05-25)

### Added

- Nothing

### Changed

- Fixed bug introduced with 1.7.0: "import as name" no longer mark export as being used
- Any folder in tsconfig.json's "include" whithout glob characters will be assumed to mean all files in all subfolders of that folder
- Improved the test projects

### Removed

- Nothing

## 1.8.0 (2021-06-06)

### Added

- The logging can also be saved in a file (.vscode/find-unused-exports.log)
- Logging for almost all steps of the algorithm, so that detection of bottlenecks to be easier

### Changed

- The regular expression for detecting the imports

### Removed

- Nothing

## 1.9.0 (2021-08-29)

### Added

- Detect imports/exports of generator functions
- Detect exports of destructured assignments
- Try to read the configuration from jsconfig.json if tsconfig.json is missing

### Changed

- Consider an export from a file as both an import and an export, which fixes the problem of reporting re-exported entities as not being used
- Quicker scan of the files for imports and exports definitions

### Removed

- Nothing

## 1.10.0 (2021-09-04)

### Added

- Added support to skip additional files via a declaration in package.json or .findUnusedExports.json

### Changed

- Nothing

### Removed

- Nothing

## 1.10.1 (2021-10-10)

### Added

- Nothing

### Changed

- Added a protection to catch the crash on "TypeError: Cannot read property 'charAt' of undefined"

### Removed

- Nothing

## 1.10.2 (2021-10-10)

### Added

- Nothing

### Changed

- Repackaged the extension

### Removed

- Nothing

## 1.10.3 (2021-11-26)

### Added

- Nothing

### Changed

- Updated the packages

### Removed

- Nothing

## 1.11.0 (2021-11-26)

### Added

- Support for `import { type BaseType } from ...` from typescript 4.5

### Changed

- Nothing

### Removed

- Nothing

## 1.11.1 (2021-11-28)

### Added

- Nothing

### Changed

- Correctly ignoring specified files on windows

### Removed

- Nothing

## 1.11.2 (2022-02-04)

### Added

- Nothing

### Changed

- Updated the packages

### Removed

- Nothing

## 1.12.0 (2022-02-14)

### Added

- Support including additional globs via .findUnusedExports.json

### Changed

- Using the production icons from VS Code
- Using three panels for Overview, Unused exports and Circular imports

### Removed

- Nothing

## 1.12.1 (2022-02-14)

### Added

- Nothing

### Changed

- Corrected the numbers displayed for "Not used exports" and "Found circular imports" in OVERVIEW

### Removed

- Nothing

## 1.12.2 (2022-02-14)

### Added

- Nothing

### Changed

- Re-added wrongly removed icons

### Removed

- Nothing

## 1.13.0 (2022-02-14)

### Added

- Any error trying to parse a JSON file is reported in OVERVIEW
- All include and exclude globs are displayed in OVERVIEW

### Changed

- Nothing

### Removed

- Nothing

## 1.14.0 (2022-02-16)

### Added

- Display the used glob instead of the defined glob
- Display the number of matched files for an include glob

### Changed

- Fixed the bug which used exclude as include from packageJson's findUnusedExports field

### Removed

- Nothing

## 1.14.1 (2022-02-18)

### Added

- Display which exclude globs are added by this extension (marked as default)

### Changed

- Using the "default" exclude globs only for include globs from jsconfig.json or tsconfig.json (they end in .js(x) or .ts(x))
  - This is a fix to be able to find imports done only in default excluded files of exports done in included files (like an import in a .d.ts file for an export done in a typescript file)

### Removed

- Nothing

## 1.15.0 (2022-02-23)

### Added

- Support for workspaces

### Changed

- Nothing

### Removed

- Nothing

## 1.15.1 (2022-02-24)

### Added

- Nothing

### Changed

- Changed the use of default exclude globs and documented them in README.md file

### Removed

- Nothing

## 1.15.2 (2022-02-25)

### Added

- Nothing

### Changed

- Small improvement in README.md file

### Removed

- Nothing

## 1.15.3 (2022-04-07)

### Added

- Nothing

### Changed

- Fixed the removal of folders from treeview when they are deleted and their parent is hidden
- The root folder in circular imports is no longer hidden if there is only one folder left displayed

### Removed

- Nothing

## 1.16.0 (2022-06-19)

### Added

- Support for TypeScript 4.7 compilerOptions.moduleSuffixes option from tsconfig.json
- Support link for extension's author (https://www.patreon.com/iulian_radu_at)

### Changed

- Updated packages

### Removed

- Nothing

## 1.17.0 (2022-09-25)

### Added

- Display in status bar if the extension is updating the list of exports and circular imports

### Changed

- Updated packages
- The windows path is displayed in a posix format in debug window as glob 8 is using posix format for path also in windows ("/" instead of "\\")

### Removed

- Nothing

## 1.18.0 (2022-09-25)

### Added

- The exports made in the file defined in the main field of package.json can be considered used (needs to be enabled via a setting of this extension)

### Changed

- Nothing

### Removed

- Nothing

## 1.18.1 (2022-09-26)

### Added

- Protection to multiple unused exports with the same name but different types

### Changed

- Nothing

### Removed

- Nothing

## 1.18.2 (2022-10-23)

### Added

- Nothing

### Changed

- Updated the packages

### Removed

- Nothing

## 1.18.3 (2022-10-23)

### Added

- Nothing

### Changed

- Updated the packages

### Removed

- Nothing

## 1.19.0 (2022-11-23)

### Added

- It is possible to define globs, file names or workspaces to be ignored for unused exports

### Changed

- Updated the packages

### Removed

- Nothing

## 1.19.1 (2022-12-15)

### Added

- Nothing

### Changed

- Fixed bug creating empty configuration file
- A file containing only unused exports can be added now to the list of ignored files

### Removed

- Nothing

## 1.20.0 (2023-02-08)

### Added

- Support for mapping paths

### Changed

- Nothing

### Removed

- Nothing

## 1.21.0 (2023-04-27)

### Added

- Ignoring all template strings so it no longer produces false positives for imports/exports found in them

### Changed

- The minimum VSCode version must be 1.75.0
- Using an improved version of glob (which is used to find files)
- The extension is activated only when visiting the corresponding view or its command is run

### Removed

- Nothing

## 1.21.1 (2023-05-07)

### Added

- Nothing

### Changed

- Fixed the bug introduced with the use of the glob 10

### Removed

- Nothing

## 1.21.2 (2023-05-07)

### Added

- Nothing

### Changed

- Fixed all circular imports in project

### Removed

- Nothing

## 2.0.0 (2023-06-10)

### Added

- Nothing

### Breaking changes

- If there are defined include rules in package.json or .findUnusedExports.json then
  the default include glob rule and the files and include from tsconfig.json or jsconfig.json are no longer applied
- If there are defined exclude rules in package.json or .findUnusedExports.json then
  the default exclude glob rule and the exclude from tsconfig.json or jsconfig.json are no longer applied

### Removed

- Reporting "Multiple unused exports with the same name"

## 2.0.1 (2023-06-10)

### Added

- Nothing

### Changes

- Fixed the badges

### Removed

- Nothing

## 2.1.1 (2023-09-22)

### Added

- Nothing

### Changes

- Displays in view when it is doing the refresh
- Drastically reduced the size of the file packing this extension

### Removed

- The "Find unused exports" in status bar

## 2.1.2 (2024-03-17)

### Added

- Test project for aliased paths

### Changes

- Fixed the detection of not used types from `export { type TYPE }`
- Fixed the detection of not used types from `export type { TYPE }`
- Fixed the detection of paths aliases usage
- Updated the packages

### Removed

- Nothing

## 2.1.3 (2024-04-10)

### Added

- Nothing

### Changes

- Updated the links

### Removed

- Nothing

## 2.1.4 (2024-04-10)

### Added

- Nothing

### Changes

- Added emojies to output messages

### Removed

- Nothing

## 2.1.5 (2024-09-01)

### Added

- Write in log the list of unused exports

### Changes

- Fixed the number of not used exports reported in logs
- The link for support
- Updated the packages
- Optimized the imports

### Removed

- Nothing

## 2.2.0 (2025-08-31)

### Added

- Hightlights in editor the found unused exports by this extension (credit goes to d0whc3r)

### Changes

- Nothing

### Removed

- Nothing
