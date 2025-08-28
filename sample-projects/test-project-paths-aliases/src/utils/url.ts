// URL utilities
export function formatUrl(baseUrl: string, endpoint: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${base}${path}`
}

// This function is not used anywhere - should be detected as unused
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}

  for (const [key, value] of params) {
    result[key] = value
  }

  return result
}

// This function is not used anywhere - should be detected as unused
export function buildQueryString(params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params)
  return searchParams.toString()
}
