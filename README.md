# Find Unused Exports

[![Marketplace Version](https://img.shields.io/vscode-marketplace/v/iulian-radu-at.find-unused-exports)](https://marketplace.visualstudio.com/items?itemName=iulian-radu-at.find-unused-exports)
[![Installs](https://img.shields.io/vscode-marketplace/i/iulian-radu-at.find-unused-exports)](https://marketplace.visualstudio.com/items?itemName=iulian-radu-at.find-unused-exports)
[![Rating](https://img.shields.io/vscode-marketplace/r/iulian-radu-at.find-unused-exports)](https://marketplace.visualstudio.com/items?itemName=iulian-radu-at.find-unused-exports)
<a href="http://opensource.org/licenses/GPL-3.0" target="_blank" rel="noreferrer noopener"><img src="https://img.shields.io/badge/license-GPL-orange.png?color=blue&amp;style=flat-square" alt="The GPL-3.0 License"></a>

Automatically find all exports in typescript and javascript files which are not imported in other files.

## Sponsorship

By purchasing [Coding Guidelines for React with TypeScript](https://www.amazon.com/dp/B0DD3DNDY1) from any Amazon website, you will get a set of guidelines for writing a clean, maintainable, and efficient code. Also you will sponsor me, showing your appreciation for my effort in creating and mentaining this extension.

## Features

- Automatically find all exports and imports in .ts and .tsx files
- Automatically find all exports and imports in .js and .jsx files, if tsconfig.json allows for .js files in project
- All imports from node modules are ignored
- Configurable display of results as expanded or collapsed
- If tsconfig.json/jsconfig.json defines baseUrl, all imports will be resolved using paths relative to baseUrl
- A file having only not used exports will be marked as "not used" and a delete button will be available
- If there are no unused exports, then the panel will display an entry saying this
- A not use export can be marked as being ignored using the following comment in its previous line
  - // find-unused-exports:ignore-next-line-exports
- Can detect circular imports, which produce undefined variables by import
  - Only the first set of circular imports for a file is displayed in panel (for clarity of the circular path)
- Files can be added to a list (via the interface) to ignore all their current and futher unused exports
  - The list is stored in .vscode/find-unused-exports.json
  - You can add a file to ignore list using the checkmark right from its name and only if there are some used exports

## Usage

This extension has its own panel. The symbol of this panel is a ban sign with two arrows (see bellow).

Open the panel and the extension will start the scan of the project.
If you made changes to the files, the extension will not detect these to avoid unnecessary scans.
You can force a rescan using the reload button found at top right of the panel.

If there are no unused exports, the panel will display a single entry saying this.

An "import \* as" will assume that all imported exports are used from that file.

### Included/Excluded files

By default are matched only .js, .jsx, .ts and .tsx files.
The .js and .jsx are included in pattern only if compilerOptions.allowJs from tsconfig.json is true or the project is in javascript.

If there are no defined exclude then the default exclude globs are used:

- node_modules/\*\*/\*
- bower_components/\*\*/\*
- jspm_packages/\*\*/\*

If there are no defined files nor include globs, then the following exclude globs are added:

- \*\*/node_modules/\*\*/\*
- \*\*/\*.d.ts

If you want to include/exclude other files than the default (like storybook's .stories.ts files or .svelte files), you can:

- add a section called findUnusedExports in package.json

```json
# package.json
{
  "findUnusedExports": {
    "include": [ "./src/**/*.d.ts", "src/**/*.svelte" ],
    "exclude": [ "./src/**/*.stories.@(js|jsx|ts|tsx)" ]
  }
}
```

- create a file called .findUnusedExports.json in the same folder with package.json

```json
# .findUnusedExports.json
{
  "include": [ "./src/**/*.d.ts", "src/**/*.svelte" ],
  "exclude": [ "./storybook/**/*.stories.@(js|jsx|ts|tsx)" ]
}
```

If both are used then the include and excluded rules from both of them will be used.

### Screenshot

Bellow you can see the list of unused exports and circular imports found in the currently opened project as are they displayed by this extension:

![Find Unused Exports](images/screenshot.png)

### Buttons

**OVERVIEW**:

- Refresh list of unused exports (and circular imports)
- Show the output window

**UNUSED EXPORTS**:

- Expand all rows
- Collapse all rows
- Refresh list of unused exports (and circular imports)

**CIRCULAR IMPORTS**:

- Enable/Disable detection of circular imports
- Expand all rows
- Collapse all rows
- Refresh list of unused exports (and circular imports)

## Requirements

There are no special requirements.

## Extension Settings

- findUnusedExports.considerMainExportsUsed

  - Find unused exports: consider all exports from the file used in the main field of package.json as used
  - default false

- findUnusedExports.defaultResultExpanded:

  - Find unused exports: show all found results initially expanded (otherwise collapsed)
  - default false

- findUnusedExports.debug:

  - Find unused exports: log all actions in an output window
  - default false

- findUnusedExports.logInFile

  - Save the log in a file (.vscode/find-unused-exports.log located in the first folder defined for a workspace)

- findUnusedExports.logOnlyLastRun

  - Save only the log for the last run/check

- findUnusedExports.showIgnoredExports

  - Find unused exports: show all unused exports, even if they are marked as ignored
  - default false

- findUnusedExports.detectCircularImports

  - Find unused exports: detect circular imports
  - default false

## Known Issues

If the main/entry file has exports then this extension marks it as "not used" and allows you to remove it. Hence, please check before deleting any file if it is the main/entry file.

There is no support for defined paths aliases or rootDirs in tsconfig.json and jsconfig.json files.

If there are no files or include globs and there are a lot of files, the extension can take a lot of time to scan for files and it looks like it is stuck in a loop.

## FAQ

- Why it is a component reported as not being used when it is?

Please check if you do not export a component by both, name and default. In this case maybe you import it only by one of them and so correctly the other is reported as not being used.

```javascript#
# exporting-file.ts
export const MyComponent = () => {...} // <- this is not used as export only
export default MyComponent; // <- this is the only used export

#importing-file.ts
import MyComponent from './exporting-file';
```

## Change Log

See Change Log [here](CHANGELOG.md)

## Issues

Submit an [issue](https://github.com/iulian-radu-at/find-unused-exports/issues) if you find any bug or have any request.

## Contribution

Fork the [repo](https://github.com/iulian-radu-at/find-unused-exports) and submit pull requests.
