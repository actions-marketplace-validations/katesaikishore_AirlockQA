export const scenarios = {
  checkout: {
    label: "Checkout payment",
    target: "staging.shop.test/checkout",
    steps: [
      ["Sandbox prepared", "A clean browser session starts with a phantom payment token.", "info"],
      ["Checkout flow replayed", "Form actions and assertions run inside the isolated browser context.", "info"],
      ["Approved request observed", "A permitted payment-method lookup crosses the policy boundary.", "success"],
      ["Refund mutation stopped", "The sample policy blocks the destructive request before it leaves the host.", "blocked"]
    ]
  },
  auth: {
    label: "Admin access control",
    target: "staging.shop.test/admin",
    steps: [
      ["Sandbox prepared", "A clean browser session starts with a short-lived phantom session.", "info"],
      ["Role checks replayed", "The sample verifies a viewer route and a restricted settings route.", "info"],
      ["Allowed route observed", "The read-only request is accepted by the sample policy.", "success"],
      ["Restricted action stopped", "The sample policy blocks an unauthorized settings mutation.", "blocked"]
    ]
  },
  fork: {
    label: "Warm state branching",
    target: "staging.shop.test/cart",
    steps: [
      ["Sandbox prepared", "A browser context reaches the checkpoint used for this sample.", "info"],
      ["Warm checkpoint captured", "The current browser state becomes a reusable branch point.", "success"],
      ["Three variants branched", "Independent sample runs continue from the same warm state.", "info"],
      ["Branches compared", "The preview shows each branch without repeating its setup flow.", "success"]
    ]
  }
};

export function createSampleRun(scenarioId, sequence, now) {
  const scenario = scenarios[scenarioId] || scenarios.checkout;
  const runNumber = String(sequence).padStart(4, "0");
  const timestamp = new Date(now).toISOString();
  const isFork = scenarioId === "fork";

  return {
    id: "preview-run-" + runNumber,
    scenarioId: scenarios[scenarioId] ? scenarioId : "checkout",
    scenarioLabel: scenario.label,
    target: scenario.target,
    timestamp,
    events: scenario.steps.map(function (step, index) {
      const elapsedSeconds = (index * 400) / 1000;
      const offset = index === 0 ? "0000" : elapsedSeconds.toFixed(1).padStart(4, "0");
      return {
        offset: offset + "s",
        title: step[0],
        detail: step[1],
        tone: step[2]
      };
    }),
    packets: [
      {
        id: "sample-01",
        method: isFork ? "GET" : "GET",
        path: isFork ? "/session/checkpoint" : "/v1/payment_methods",
        host: isFork ? "staging.shop.test" : "api.stripe.test",
        action: "Phantom value only",
        verdict: "Allowed in sample",
        blocked: false
      },
      {
        id: "sample-02",
        method: "POST",
        path: isFork ? "/cart/variant" : (scenarioId === "auth" ? "/admin/settings" : "/v1/refunds"),
        host: isFork ? "staging.shop.test" : (scenarioId === "auth" ? "staging.shop.test" : "api.stripe.test"),
        action: "Stopped at policy boundary",
        verdict: "Blocked in sample",
        blocked: true
      }
    ],
    checkpoints: isFork ? [
      { name: "Cart ready", id: "sample-checkpoint-01", memory: "Illustrative state", step: 17 },
      { name: "Variant A", id: "sample-branch-01", memory: "Independent branch", step: 18 },
      { name: "Variant B", id: "sample-branch-02", memory: "Independent branch", step: 18 }
    ] : [
      { name: scenarioId === "auth" ? "Signed-in session" : "Checkout ready", id: "sample-checkpoint-01", memory: "Illustrative state", step: 17 }
    ],
    proof: {
      root: "example: 9f62c8a4 · preview only",
      signature: "example: Ed25519 signature omitted"
    }
  };
}

// Every value below is an interface fixture. The cloud API currently accepts
// POST /v1/runs; it does not expose a run-history or usage endpoint.
const runFixtures = [
  { scenario: "checkout", sequence: 1042, at: "2026-11-06T10:42:00.000Z", status: "success", durationMs: 42800, passedSteps: 18, totalSteps: 18, branch: "main", commit: "a84d2c1", actor: "Maya Chen", environment: "staging" },
  { scenario: "auth", sequence: 1041, at: "2026-11-06T10:18:00.000Z", status: "policy_violation", durationMs: 31200, passedSteps: 11, totalSteps: 12, branch: "feat/role-checks", commit: "c07be93", actor: "CI pipeline", environment: "preview" },
  { scenario: "fork", sequence: 1040, at: "2026-11-06T09:54:00.000Z", status: "success", durationMs: 26700, passedSteps: 14, totalSteps: 14, branch: "main", commit: "93fc018", actor: "Jordan Lee", environment: "staging" },
  { scenario: "checkout", sequence: 1039, at: "2026-11-06T09:31:00.000Z", status: "failed", durationMs: 51900, passedSteps: 16, totalSteps: 18, branch: "fix/checkout-retry", commit: "e612af4", actor: "CI pipeline", environment: "preview" },
  { scenario: "auth", sequence: 1038, at: "2026-11-06T09:04:00.000Z", status: "success", durationMs: 29400, passedSteps: 12, totalSteps: 12, branch: "main", commit: "6d0b18e", actor: "Maya Chen", environment: "staging" },
  { scenario: "fork", sequence: 1037, at: "2026-11-06T08:46:00.000Z", status: "success", durationMs: 27100, passedSteps: 14, totalSteps: 14, branch: "feat/warm-state", commit: "e701baf", actor: "CI pipeline", environment: "preview" }
];

export const sampleRuns = runFixtures.map(function (fixture) {
  const run = createSampleRun(fixture.scenario, fixture.sequence, fixture.at);
  return {
    ...run,
    status: fixture.status,
    durationMs: fixture.durationMs,
    passedSteps: fixture.passedSteps,
    totalSteps: fixture.totalSteps,
    branch: fixture.branch,
    commit: fixture.commit,
    actor: fixture.actor,
    environment: fixture.environment
  };
});

export const sampleMetrics = {
  // Display these only alongside the preview disclosure in the dashboard UI.
  totalRuns: "1,284",
  passRate: "96.8%",
  policyBlocks: "17",
  medianDuration: "42s",
  runsToday: "128",
  reliability: "99.2%"
};

export const sampleAnalytics = {
  dailyRuns: [42, 55, 49, 72, 64, 88, 76],
  dailyPassRate: [94, 96, 95, 98, 97, 96, 97],
  flakyTests: [
    { name: "Checkout › applies saved payment method", rate: "3.8%", runs: 52 },
    { name: "Account › refreshes session after login", rate: "2.1%", runs: 47 },
    { name: "Cart › restores warm checkpoint", rate: "1.6%", runs: 61 }
  ],
  testGroups: [
    { name: "Checkout", total: 42, passing: 40, tone: "blue" },
    { name: "Authentication", total: 31, passing: 30, tone: "violet" },
    { name: "Account settings", total: 24, passing: 23, tone: "teal" },
    { name: "Cart and pricing", total: 18, passing: 17, tone: "amber" }
  ]
};
