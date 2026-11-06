import { describe, it, expect } from 'bun:test';
import { CausalXRay } from '../src/telemetry/causal-xray.js';

describe('Full-Stack Causal X-Ray Engine', () => {
  it('generates compliant 32-char W3C trace identifiers', () => {
    const xray = new CausalXRay();
    const traceId = xray.getTraceId();

    expect(traceId).toBeDefined();
    expect(traceId.length).toBe(32);
  });

  it('records step spans and correlates DOM actions', () => {
    const xray = new CausalXRay();
    const spanId = xray.startStep('Submit Checkout Form', {
      action: 'click',
      selector: 'button#pay-button',
    });

    expect(spanId).toBeDefined();
    const traces = xray.getTraces();
    expect(traces.length).toBe(1);
    expect(traces[0].stepName).toBe('Submit Checkout Form');
    expect(traces[0].domAction?.selector).toBe('button#pay-button');
  });

  it('generates diagnostic failure bundle with terminal box when action throws', async () => {
    const xray = new CausalXRay();

    const mockPage: any = {
      route: async () => {},
      on: () => {},
    };

    let caughtError: any = null;
    try {
      await xray.traceStep(mockPage, 'Payment Verification Step', async () => {
        throw new Error('Payment processing timed out');
      });
    } catch (err: any) {
      caughtError = err;
    }

    expect(caughtError).not.toBeNull();
    expect(caughtError.message).toContain('Payment processing timed out');
    expect(caughtError.xrayBundle).toBeDefined();
    expect(caughtError.xrayBundle.formattedTerminalBox).toContain('AIRLOCK CAUSAL X-RAY');
    expect(caughtError.xrayBundle.formattedTerminalBox).toContain('Failed Step:');
  });

  it('formats terminal diagnostic box cleanly', () => {
    const box = CausalXRay.formatTerminalDiagnostic({
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      stepName: 'CLICK button#submit-payment',
      errorMsg: 'Server returned 500 Internal Server Error',
      diag: {
        errorClass: 'StripeCardError',
        errorMessage: 'Card declined: Insufficient funds',
        culpritFile: 'src/controllers/checkout.ts',
        culpritLine: 88,
        culpritFunction: 'chargeCustomerCard',
        databaseQuery: 'UPDATE accounts SET balance = balance - 5000 WHERE id = $1',
        codeSnippet: 'await stripe.charges.create({ amount, currency })',
      },
    });

    expect(box).toContain('AIRLOCK CAUSAL X-RAY: ROOT-CAUSE DIAGNOSTIC');
    expect(box).toContain('src/controllers/checkout.ts:88');
    expect(box).toContain('chargeCustomerCard');
    expect(box).toContain('Card declined: Insufficient funds');
    expect(box).toContain('UPDATE accounts SET balance');
  });
});
