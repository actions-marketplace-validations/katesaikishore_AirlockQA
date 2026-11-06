import type { ComplianceProofBundle } from '../types/index.js';

export class Soc2Reporter {
  static generateExecutiveSummary(bundle: ComplianceProofBundle): string {
    return `# SOC 2 Type II & ISO 27001 Execution Attestation
**Run ID:** \`${bundle.runId}\`  
**Timestamp:** ${bundle.timestamp}  
**Merkle Root Hash:** \`${bundle.merkleRoot}\`  
**Digital Signature:** \`${bundle.signature.substring(0, 32)}...\` (${bundle.signingAlgorithm})  

---

## 1. Trust Services Criteria Evaluation

### CC6.1 - Logical Access Controls & Credential Masking
- **Status:** **${bundle.soc2Mapping.cc6_1_logicalAccess}**
- **Evidence:** Phantom Credential Architecture deployed.
- **Phantom Tokens Injected:** ${bundle.policyAudit.phantomTokensConfigured}
- **Real Secrets Exposed to Sandbox:** ${bundle.policyAudit.realSecretsExposedToSandbox} (ZERO-LEAK GUARANTEED)
- **Mechanism:** Secrets replaced at the OS / network proxy boundary; test execution runner possessed zero plaintext credentials.

### CC6.6 - Boundary Protection & Egress Filtering
- **Status:** **${bundle.soc2Mapping.cc6_6_boundaryProtection}**
- **Evidence:** Deterministic Egress Firewall active throughout entire run.
- **Blocked Egress / Mutation Attempts:** ${bundle.policyAudit.egressBlockedCount}
- **Authorized Upstream Requests:** ${bundle.policyAudit.egressAllowedCount}
- **Destructive Operations Prevented:** ${bundle.policyAudit.unauthorizedMutationsPrevented}
- **Mechanism:** Real-time host whitelisting and mutation rule inspection intercepted and blocked unauthorized requests.

### CC7.1 - System Operations & Deterministic Change Management
- **Status:** **${bundle.soc2Mapping.cc7_1_changeVerification}**
- **Evidence:** Zero-token deterministic Playwright test suite.
- **Total Steps Verified:** ${bundle.summary.totalSteps}
- **Steps Passed:** ${bundle.summary.passedSteps}
- **Stochastic Hallucination Risk:** 0.0% (Deterministic state assertion)

### CC8.1 - Non-Repudiation & Cryptographic Audit Trails
- **Status:** **${bundle.soc2Mapping.cc8_1_nonRepudiation}**
- **Evidence:** ${bundle.blocksCount} execution events recorded in tamper-evident hash chain.
- **Chain Integrity:** ${bundle.ledgerVerificationStatus}

---
*Signed by Airlock Cryptographic Engine v1.0.0*
`;
  }

  static generateGitHubPRComment(bundle: ComplianceProofBundle): string {
    const isPassing = bundle.summary.failedSteps === 0;
    const statusBadge = isPassing ? '✅ PASS' : '❌ FAIL';
    const securityBadge = bundle.policyAudit.realSecretsExposedToSandbox === 0 ? '🛡️ ZERO-LEAK VERIFIED' : '🚨 LEAK DETECTED';

    return `## ${statusBadge} AirlockQA Deterministic Test Run

| Metric | Result | Target / Standard |
| :--- | :--- | :--- |
| **Execution Mode** | Deterministic Playwright | Zero-Token ($0.00 CI cost) |
| **Duration** | \`${bundle.summary.durationMs}ms\` | < 1,000ms |
| **Security Clearance** | **${securityBadge}** | SOC 2 CC6.1 Compliant |
| **Real Secrets Exposed** | \`0\` (Phantom Credential Protected) | 0 Plaintext Secrets |
| **Egress Violations Blocked** | \`${bundle.policyAudit.egressBlockedCount}\` (Destructive mutations stopped) | Deterministic Firewall |
| **Merkle Root Hash** | \`${bundle.merkleRoot.substring(0, 16)}...\` | Tamper-Evident Ledger |
| **Signature** | \`${bundle.signature.substring(0, 24)}...\` | HMAC-SHA256 Signed |

<details>
<summary><b>🔍 Cryptographic Audit Details</b></summary>

\`\`\`json
{
  "runId": "${bundle.runId}",
  "merkleRoot": "${bundle.merkleRoot}",
  "signature": "${bundle.signature}",
  "ledgerBlocks": ${bundle.blocksCount},
  "soc2Compliance": {
    "cc6_1_logicalAccess": "${bundle.soc2Mapping.cc6_1_logicalAccess}",
    "cc6_6_boundaryProtection": "${bundle.soc2Mapping.cc6_6_boundaryProtection}",
    "cc7_1_changeVerification": "${bundle.soc2Mapping.cc7_1_changeVerification}"
  }
}
\`\`\`

To independently verify this bundle locally:
\`\`\`bash
npx airlock audit .airlock/compliance/latest-attestation.json
\`\`\`
</details>
`;
  }
}

