// Library utilities - included in analysis
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// This function is not used anywhere - should be detected as unused
export function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const TIMING_CONSTANTS = {
  DEFAULT_DEBOUNCE: 300,
  DEFAULT_THROTTLE: 100,
}

// This constant is not used anywhere - should be detected as unused
export const PERFORMANCE_CONFIG = {
  ENABLE_PROFILING: false,
  LOG_TIMING: true,
}
