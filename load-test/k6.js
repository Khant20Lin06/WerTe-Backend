import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric: track error rate across all requests.
const errorRate = new Rate('errors');

// __ENV.BASE_URL is injected via -e BASE_URL=... or defaults to localhost.
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  // Ramp to 30 VUs over 10s, hold for 30s, ramp down 10s.
  stages: [
    { duration: '10s', target: 30 },
    { duration: '30s', target: 30 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    // 95th-percentile response time under 500ms across all requests.
    http_req_duration: ['p(95)<500'],
    // Fewer than 1% of requests must fail (non-2xx or network error).
    errors: ['rate<0.01'],
  },
};

// Endpoints exercised in every iteration (public, no auth required).
const SCENARIOS = [
  { url: `${BASE_URL}/health/live`, name: 'liveness' },
  { url: `${BASE_URL}/health/ready`, name: 'readiness' },
  { url: `${BASE_URL}/metrics`, name: 'prometheus-metrics' },
];

export default function () {
  for (const scenario of SCENARIOS) {
    const res = http.get(scenario.url, {
      tags: { name: scenario.name },
      timeout: '5s',
    });

    const ok = check(res, {
      [`${scenario.name}: status 2xx`]: (r) =>
        r.status >= 200 && r.status < 300,
      [`${scenario.name}: response time < 500ms`]: (r) =>
        r.timings.duration < 500,
    });

    // Record any non-2xx as an error for the threshold check.
    errorRate.add(!ok);

    // Minimal think time so we don't hammer a single endpoint in a tight loop.
    sleep(0.1);
  }
}
