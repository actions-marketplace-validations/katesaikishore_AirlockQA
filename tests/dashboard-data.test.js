import { describe, expect, test } from "bun:test";
import { createSampleRun, scenarios } from "../public/dashboard-data.js";

describe("dashboard sample data", () => {
  test("defines a safe sample for each supported scenario", () => {
    for (const scenarioId of Object.keys(scenarios)) {
      const run = createSampleRun(scenarioId, 7, "2026-11-06T12:00:00.000Z");

      expect(run.scenarioId).toBe(scenarioId);
      expect(run.id).toBe("preview-run-0007");
      expect(run.events).toHaveLength(4);
      expect(run.events.map((event) => event.offset)).toEqual(["0000s", "00.4s", "00.8s", "01.2s"]);
      expect(run.packets).toHaveLength(2);
      expect(run.packets.some((packet) => packet.blocked)).toBe(true);
      expect(run.checkpoints.length).toBeGreaterThan(0);
      expect(run.proof.signature).toContain("omitted");
    }
  });

  test("falls back to checkout for an unknown scenario", () => {
    const run = createSampleRun("unexpected-value", 1, 0);

    expect(run.scenarioId).toBe("checkout");
    expect(run.scenarioLabel).toBe(scenarios.checkout.label);
    expect(run.id).toBe("preview-run-0001");
  });
});
