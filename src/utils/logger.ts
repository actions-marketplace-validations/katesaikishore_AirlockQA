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
    console.log(pc.dim('  ─── Browser testing, request policy, and run evidence ───\n'));
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

  /** Print a plain step label with an optional detail line. */
  stage(title: string, detail?: string): void {
    console.log(`\n${pc.cyan('▸')} ${pc.bold(title)}`);
    if (detail) {
      console.log(pc.dim(`  └─ ${detail}`));
    }
  }

  /** @deprecated Use {@link stage}. The number argument is ignored. */
  moat(_num: number, title: string, detail?: string): void {
    this.stage(title, detail);
  }

  step(stepIndex: number, action: string, target?: string): void {
    console.log(
      pc.dim(`[step ${stepIndex.toString().padStart(2, '0')}] `) +
      pc.magenta(action) +
      (target ? pc.dim(` -> `) + pc.cyan(target) : '')
    );
  }

  securityViolation(reason: string, details?: Record<string, unknown>): void {
    console.log(pc.red(pc.bold('✖ Request blocked by policy')));
    console.log(pc.red(`  Reason: ${reason}`));
    if (details) {
      console.log(pc.dim(JSON.stringify(details, null, 2)));
    }
  }
}

export const logger = new Logger();

