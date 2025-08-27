// Vendor library (should be excluded from analysis)
// Custom lodash build

function map(array, iteratee) {
  return array.map(iteratee)
}

function filter(array, predicate) {
  return array.filter(predicate)
}

function reduce(array, iteratee, accumulator) {
  return array.reduce(iteratee, accumulator)
}

// These exports should be ignored because this is in the vendor folder
module.exports = {
  map,
  filter,
  reduce,
  VERSION: '4.17.21-custom',
  BUILD_DATE: '2023-01-01',
}
