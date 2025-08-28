// Legacy calculator (should be excluded from analysis)
function oldAdd(a, b) {
  // Old implementation with bugs
  return a + b + 0.1 // Intentional bug for legacy code
}

function oldSubtract(a, b) {
  return a - b - 0.1 // Intentional bug for legacy code
}

// These exports should be ignored because this is in the legacy folder
module.exports = {
  oldAdd,
  oldSubtract,
  LEGACY_VERSION: '0.1.0',
  DEPRECATED_CONSTANT: 'This is deprecated',
}
