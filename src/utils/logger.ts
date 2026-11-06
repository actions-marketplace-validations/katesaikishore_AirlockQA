import pc from 'picocolors';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

class Logger {
  private level: LogLevel = 'info';

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  banner(): void {
    console.log(pc.cyan(`
   █████╗ ██╗██████╗ ██╗      ██████╗  ██████╗██╗  ██╗ ██████╗  █████╗ 
  ██╔══██╗██║██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔═══██╗██╔══██╗
  ███████║██║██████╔╝██║     ██║   ██║██║     █████╔╝ ██║   ██║███████║
  ██╔══██║██║██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ██║   ██║██╔══██║
  ██║  ██║██║██║  ██║███████╗╚██████╔╝╚██████╗██║  ██╗╚██████╔╝██║  ██║
  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
`));
    console.log(pc.dim('  ─── The Zero-Trust, Self-Compiling, Time-Traveling AI QA Engine ───\n'));
  }

  info(msg: string, ...args: unknown[]): void {
    console.log(pc.blue('ℹ') + ' ' + msg, ...args);
  }

  success(msg: string, ...args: unknown[]): void {
    console.log(pc.green('✔') + ' ' + pc.bold(msg), ...args);
  }

  warn(msg: string, ...args: unknown[]): void {
    console.log(pc.yellow('⚠') + ' ' + pc.yellow(msg), ...args);
  }

  error(msg: string, ...args: unknown[]): void {
    console.error(pc.red('✖') + ' ' + pc.bold(pc.red(msg)), ...args);
  }

  moat(num: number, title: string, detail?: string): void {
    const badge = pc.bgCyan(pc.black(` AIRLOCK `));
    console.log(`\n${badge} ${pc.bold(title)}`);
    if (detail) {
      console.log(pc.dim(`  └─ ${detail}`));
    }
  }

  step(stepIndex: number, action: string, target?: string): void {
    console.log(
      pc.dim(`[step ${stepIndex.toString().padStart(2, '0')}] `) +
      pc.magenta(action) +
      (target ? pc.dim(` -> `) + pc.cyan(target) : '')
    );
  }

  securityViolation(reason: string, details?: Record<string, unknown>): void {
    console.log(pc.bgRed(pc.white(' 🚨 AIRLOCK POLICY VIOLATION BLOCKED 🚨 ')));
    console.log(pc.red(`  Reason: ${reason}`));
    if (details) {
      console.log(pc.dim(JSON.stringify(details, null, 2)));
    }
  }
}

export const logger = new Logger();

