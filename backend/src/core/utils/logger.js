/**
 * Logger toi gian, khong phu thuoc thu vien ngoai.
 * - Moi truong production: xuat JSON 1 dong -> de day vao Datadog/CloudWatch.
 * - Moi truong khac: xuat dang doc duoc cho nguoi.
 *
 * Muon thay bang pino/winston: chi can giu nguyen interface
 * { debug, info, warn, error, child } o day.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };

const COLORS = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  reset: "\x1b[0m",
};

function createLogger({ level = "info", pretty = true, bindings = {} } = {}) {
  const threshold = LEVELS[level] ?? LEVELS.info;

  const write = (levelName, message, context) => {
    if (LEVELS[levelName] < threshold) return;

    const payload = {
      level: levelName,
      time: new Date().toISOString(),
      msg: message,
      ...bindings,
      ...(context ?? {}),
    };

    const stream = LEVELS[levelName] >= LEVELS.error ? console.error : console.info;

    if (!pretty) {
      stream(JSON.stringify(payload));
      return;
    }

    const { level: _l, time, msg, ...rest } = payload;
    const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";
    stream(
      `${COLORS[levelName]}[${levelName.toUpperCase()}]${COLORS.reset} ${time} ${msg}${extra}`,
    );
  };

  return {
    level,
    debug: (message, context) => write("debug", message, context),
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context),
    /** Tao logger con gan san context (vd: requestId). */
    child: (childBindings) =>
      createLogger({ level, pretty, bindings: { ...bindings, ...childBindings } }),
  };
}

export { createLogger, LEVELS };

/** Logger mac dinh cua ung dung. config/env.js se cau hinh lai khi khoi dong. */
export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  pretty: process.env.NODE_ENV !== "production",
});
