import { describe, it, expect } from 'bun:test';
import { CausalXRay } from '../src/telemetry/causal-xray.js';

describe('Browser trace diagnostics prototype', () => {
  it('generates 32-character trace identifiers for browser requests', () => {
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
    expect(caughtError.xrayBundle.formattedTerminalBox).toContain('AIRLOCK BROWSER TRACE DIAGNOSTICS');
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

    expect(box).toContain('AIRLOCK BROWSER TRACE DIAGNOSTICS');
    expect(box).toContain('src/controllers/checkout.ts:88');
    expect(box).toContain('chargeCustomerCard');
    expect(box).toContain('Card declined: Insufficient funds');
    expect(box).toContain('UPDATE accounts SET balance');
  });

  it('marks backend source details unavailable when the service did not provide them', () => {
    const box = CausalXRay.formatTerminalDiagnostic({
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      stepName: 'Submit form',
      errorMsg: 'Assertion timed out',
      diag: { errorClass: 'AssertionFailure', errorMessage: 'Assertion timed out' },
    });

    expect(box).toContain('Unavailable (not supplied by the service)');
    expect(box).toContain('Observed error:');
    expect(box).not.toContain('controllers/api.ts');
  });
});
