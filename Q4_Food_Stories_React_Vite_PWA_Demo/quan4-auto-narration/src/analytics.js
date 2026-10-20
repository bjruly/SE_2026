/**
 * @typedef {'app_open' | 'narration_play' | 'narration_complete'} AnalyticsEventType
 * @typedef {{ type: AnalyticsEventType, poiId?: string, language?: string }} AnalyticsEvent
 */

const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT

/**
 * Sends aggregate-friendly events when an analytics API is configured.
 * The payload intentionally excludes user identity and location.
 * @param {AnalyticsEvent} event
 */
export function trackAnalyticsEvent(event) {
  if (!endpoint) return

  const payload = {
    event: event.type,
    occurredAt: new Date().toISOString(),
    ...(event.poiId ? { poiId: event.poiId } : {}),
    ...(event.language ? { language: event.language } : {})
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(error => {
    console.error('Unable to send analytics event.', error)
  })
}
