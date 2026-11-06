import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

export const PhantomSecretConfigSchema = z.object({
  real: z.string().min(1, 'Real secret cannot be empty'),
  phantom: z.string().min(1, 'Phantom token cannot be empty'),
  allowedHosts: z.array(z.string()).default([]),
  allowedMethods: z.array(HttpMethodSchema).optional(),
  blockedPaths: z.array(z.string()).optional(),
  headerName: z.string().default('Authorization'),
  headerPrefix: z.string().default('Bearer '),
});

export const EgressRuleSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  hostPattern: z.string(),
  methods: z.array(HttpMethodSchema).optional(),
  allowedPaths: z.array(z.string()).optional(),
  blockedPaths: z.array(z.string()).optional(),
  action: z.enum(['ALLOW', 'BLOCK', 'REDACT', 'ALERT']).default('ALLOW'),
  maxPayloadBytes: z.number().optional(),
});

export const EgressPolicyConfigSchema = z.object({
  defaultAction: z.enum(['BLOCK', 'ALLOW']).default('BLOCK'),
  allowedEgressHosts: z.array(z.string()).default([]),
  blockedEgressHosts: z.array(z.string()).default([]),
  rules: z.array(EgressRuleSchema).default([]),
  logPayloads: z.boolean().default(true),
});

export const AirlockConfigSchema = z.object({
  projectName: z.string().default('AirlockQA Project'),
  baseUrl: z.string().default('http://localhost:3000'),
  browser: z.object({
    headless: z.boolean().default(true),
    executablePath: z.string().optional(),
    slowMo: z.number().default(0),
    viewport: z.object({
      width: z.number().default(1280),
      height: z.number().default(800),
    }).default({ width: 1280, height: 800 }),
  }).default({
    headless: true,
    slowMo: 0,
    viewport: { width: 1280, height: 800 },
  }),
  proxy: z.object({
    enabled: z.boolean().default(true),
    port: z.number().default(8899),
    host: z.string().default('127.0.0.1'),
  }).default({
    enabled: true,
    port: 8899,
    host: '127.0.0.1',
  }),
  secrets: z.record(z.string(), PhantomSecretConfigSchema).default({}),
  policy: EgressPolicyConfigSchema.default({
    defaultAction: 'BLOCK',
    allowedEgressHosts: ['127.0.0.1', 'localhost', 'api.stripe.com'],
    blockedEgressHosts: ['pastebin.com', 'webhook.site', 'transfer.sh'],
    rules: [
      {
        id: 'block-refunds-and-wipes',
        description: 'Prevent destructive operations during QA',
        hostPattern: '*',
        blockedPaths: ['*/refunds*', '*/wipe*', '*/delete-all*'],
        action: 'BLOCK',
      },
      {
        id: 'allow-staging-and-local',
        description: 'Allow standard local and staging interaction',
        hostPattern: 'localhost',
        action: 'ALLOW',
      },
      {
        id: 'allow-stripe-get-and-charge',
        description: 'Allow Stripe API calls except refunds',
        hostPattern: 'api.stripe.com',
        allowedPaths: ['/v1/charges', '/v1/customers', '/v1/tokens'],
        blockedPaths: ['/v1/refunds'],
        action: 'ALLOW',
      },
    ],
    logPayloads: true,
  }),
  compiler: z.object({
    outputDir: z.string().default('./tests/generated'),
    defaultTimeoutMs: z.number().default(5000),
    emitAriaFallbacks: z.boolean().default(true),
  }).default({
    outputDir: './tests/generated',
    defaultTimeoutMs: 5000,
    emitAriaFallbacks: true,
  }),
  healer: z.object({
    autoHeal: z.boolean().default(true),
    confidenceThreshold: z.number().default(0.8),
    datasetDir: z.string().default('./.airlock/dataset'),
    saveMutations: z.boolean().default(true),
  }).default({
    autoHeal: true,
    confidenceThreshold: 0.8,
    datasetDir: './.airlock/dataset',
    saveMutations: true,
  }),
  forker: z.object({
    checkpointsDir: z.string().default('./.airlock/checkpoints'),
    maxParallelForks: z.number().default(10),
  }).default({
    checkpointsDir: './.airlock/checkpoints',
    maxParallelForks: 10,
  }),
  compliance: z.object({
    signingKey: z.string().default('airlock-dev-signing-key-32-chars-long!'),
    outputDir: z.string().default('./.airlock/compliance'),
    generateHtmlReport: z.boolean().default(true),
  }).default({
    signingKey: 'airlock-dev-signing-key-32-chars-long!',
    outputDir: './.airlock/compliance',
    generateHtmlReport: true,
  }),
});

