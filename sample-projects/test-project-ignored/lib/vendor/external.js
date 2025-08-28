// Vendor/external library - should be excluded from analysis
export function externalFunction() {
  return 'This is from an external library'
}

export const EXTERNAL_VERSION = '2.1.0'

export class ExternalLibrary {
  constructor(config) {
    this.config = config
  }

  process(data) {
    return `Processed: ${data}`
  }
}

// These exports should be ignored since vendor folder is excluded
export default ExternalLibrary
