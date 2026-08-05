/**
 * Product Analytics Platform — Tracking SDK
 *
 * Usage:
 *   <script src="https://your-app.com/sdk/analytics.js"></script>
 *   <script>
 *     Analytics.init("YOUR_API_KEY", { apiUrl: "https://your-api.com/api/v1" });
 *     Analytics.track("Page Viewed");
 *     Analytics.track("Purchase", { amount: 49.99, plan: "pro" });
 *   </script>
 *
 * Requests are sent via sendBeacon when available (fire-and-forget, safe
 * on page unload) and fall back to fetch otherwise.
 */
(function (window) {
  "use strict";

  var DEFAULT_API_URL = "http://localhost:8000/api/v1";
  var DISTINCT_ID_KEY = "pap_distinct_id";

  var state = { apiKey: null, apiUrl: DEFAULT_API_URL };

  function getDistinctId() {
    try {
      var existing = window.localStorage.getItem(DISTINCT_ID_KEY);
      if (existing) return existing;
      var generated = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(DISTINCT_ID_KEY, generated);
      return generated;
    } catch (e) {
      return "anon_" + Date.now();
    }
  }

  function init(apiKey, options) {
    if (!apiKey) {
      console.error("[Analytics] init() requires an API key");
      return;
    }
    state.apiKey = apiKey;
    if (options && options.apiUrl) state.apiUrl = options.apiUrl;
  }

  function track(name, properties, distinctId) {
    if (!state.apiKey) {
      console.error("[Analytics] Call Analytics.init(apiKey) before track()");
      return;
    }
    if (!name) {
      console.error("[Analytics] track() requires an event name");
      return;
    }

    var payload = JSON.stringify({
      name: name,
      distinct_id: distinctId || getDistinctId(),
      properties: properties || {},
    });

    var url = state.apiUrl.replace(/\/$/, "") + "/track";

    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url + "?api_key=" + encodeURIComponent(state.apiKey), blob);
      return;
    }

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": state.apiKey },
      body: payload,
      keepalive: true,
    }).catch(function (err) {
      console.error("[Analytics] Failed to send event:", err);
    });
  }

  // Simple string hash -> [0, 1), used to deterministically bucket a user
  // into a variant so the same user always sees the same variant.
  function hashToUnitInterval(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0) / 4294967295;
  }

  /**
   * Deterministically buckets the current user into one of `variants`
   * (e.g. [{name: "Control", traffic_allocation: 50}, {name: "New Copy", traffic_allocation: 50}])
   * and fires the "Experiment Viewed" exposure event the dashboard uses
   * to compute conversion rates and significance.
   */
  function getVariant(experimentId, variants) {
    var distinctId = getDistinctId();
    var bucket = hashToUnitInterval(experimentId + ":" + distinctId) * 100;

    var cumulative = 0;
    var chosen = variants[variants.length - 1];
    for (var i = 0; i < variants.length; i++) {
      cumulative += variants[i].traffic_allocation;
      if (bucket < cumulative) {
        chosen = variants[i];
        break;
      }
    }

    track("Experiment Viewed", { experiment_id: experimentId, variant: chosen.name }, distinctId);
    return chosen.name;
  }

  window.Analytics = { init: init, track: track, getVariant: getVariant };
})(window);
