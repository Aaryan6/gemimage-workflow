export function getApiKey(): string | undefined {
  try {
    const settings = localStorage.getItem("ai-workflow-settings")
    if (settings) {
      const parsedSettings = JSON.parse(settings)
      return parsedSettings.apiKey
    }
  } catch {
    // If localStorage is not available or parsing fails, return undefined
  }
  return undefined
}