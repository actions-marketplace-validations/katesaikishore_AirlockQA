import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

export const PhantomSecretConfigSchema = z.object({
  /** Literal secret value. Prefer `realFromEnv` so real values stay out of config files. */
  real: z.string().min(1, 'Real secret cannot be empty').optional(),
  /** Name of an environment variable holding the real secret. Takes precedence over `real`. */
  realFromEnv: z.string().min(1, 'realFromEnv must name an environment variable').optional(),
  phantom: z.string().min(1, 'Phantom token cannot be empty'),
  allowedHosts: z.array(z.string()).default([]),
  allowedMethods: z.array(HttpMethodSchema).optional(),
  blockedPaths: z.array(z.string()).optional(),
  headerName: z.string().default('Authorization'),
  headerPrefix: z.string().default('Bearer '),
}).refine((secret) => secret.real !== undefined || secret.realFromEnv !== undefined, {
  message: 'Each secret needs either `real` or `realFromEnv`',
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
    allowedEgressHosts: ['127.0.0.1', 'localhost', '::1'],
    blockedEgressHosts: [],
    rules: [],
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
    // No default: a signing key must be supplied explicitly (config or environment).
    signingKey: z.string().min(1).optional(),
    outputDir: z.string().default('./.airlock/compliance'),
    generateHtmlReport: z.boolean().default(true),
  }).default({
    outputDir: './.airlock/compliance',
    generateHtmlReport: true,
  }),
});

