import type { ComplianceProofBundle } from '../types/index.js';

/** Legacy class name; generated content is run evidence, not a compliance report. */
export class Soc2Reporter {
  static generateExecutiveSummary(bundle: ComplianceProofBundle): string {
    return `# QAFind Run Evidence

**Run ID:** \`${bundle.runId}\`  
**Timestamp:** ${bundle.timestamp}  
**Ledger root:** \`${bundle.merkleRoot}\`

**Signature:** \`${bundle.signature.substring(0, 32)}...\` (${bundle.signingAlgorithm})

## Recorded data

- Browser action dispatches recorded: ${bundle.summary.totalSteps}
- Step pass/fail: Not assessed by this runner
- Run duration: ${bundle.summary.durationMs} ms
- Configured phantom values: ${bundle.policyAudit.phantomTokensConfigured}
- Egress requests allowed / blocked: ${bundle.policyAudit.egressAllowedCount} / ${bundle.policyAudit.egressBlockedCount}
- Real-secret exposure: Not comprehensively measured
- Hash-chain status: ${bundle.ledgerVerificationStatus}

## Compliance status

SOC 2 and ISO 27001 controls have not been assessed by this evidence bundle. A valid hash chain and signature do not establish compliance certification.
`;
  }

  static generateGitHubPRComment(bundle: ComplianceProofBundle): string {
    const evidenceBadge = bundle.ledgerVerificationStatus === 'VALID_CHAIN'
      ? '✅ HASH CHAIN VALID'
      : '⚠️ HASH CHAIN INVALID';

    return `## ${evidenceBadge} QAFind run evidence

This bundle records browser-run events and a signed hash chain. It is not a SOC 2 or ISO 27001 assessment.

| Recorded metric | Result |
| :--- | :--- |
| Run ID | \`${bundle.runId}\` |
| Browser action dispatches | ${bundle.summary.totalSteps} |
| Step pass/fail | Not assessed |
| Run duration | ${bundle.summary.durationMs} ms |
| Configured phantom values | ${bundle.policyAudit.phantomTokensConfigured} |
| Egress requests allowed / blocked | ${bundle.policyAudit.egressAllowedCount} / ${bundle.policyAudit.egressBlockedCount} |
| Real-secret exposure | Not comprehensively measured |
| Ledger root | \`${bundle.merkleRoot.substring(0, 16)}...\` |
| Signature | ${bundle.signingAlgorithm} |

To verify the signature locally, use the audit command with the signing key that created this bundle.
`;
  }
}
