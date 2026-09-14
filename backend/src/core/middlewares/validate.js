import { AppError } from "../errors/index.js";

/**
 * Middleware validate request bang Zod.
 *
 * Nhan mot object mo ta schema cho tung phan cua request:
 *   validate({ body: createProductSchema, params: idParamSchema, query: listQuerySchema })
 *
 * Diem quan trong: GAN LAI gia tri da parse vao req.
 * Nho vay controller nhan duoc du lieu DA duoc ep kieu (vd: "10" -> 10) va da co default.
 *
 * Express 5 khien req.query chi doc (getter) -> ta ghi vao req.validatedQuery
 * va dong thoi dinh nghia lai req.query bang defineProperty de code cu van chay.
 */
export function validate(schemas = {}) {
  const targets = ["body", "params", "query", "headers", "cookies"];

  return (req, _res, next) => {
    const issues = [];

    for (const target of targets) {
      const schema = schemas[target];
      if (!schema) continue;

      // Express 5 de req.body = undefined khi request KHONG co body.
      // Quy doi ve {} de schema chi toan field optional van hop le.
      const input = target === "body" ? (req.body ?? {}) : req[target];
      const result = schema.safeParse(input);

      if (!result.success) {
        issues.push(
          ...result.error.issues.map((issue) => ({
            field: [target, ...issue.path].join("."),
            path: issue.path.map(String),
            location: target,
            message: issue.message,
            code: issue.code,
          })),
        );
        continue;
      }

      assignParsed(req, target, result.data);
    }

    if (issues.length) {
      return next(AppError.validation("Du lieu gui len khong hop le", issues));
    }

    return next();
  };
}

function assignParsed(req, target, value) {
  if (target === "query") {
    // req.query cua Express 5 la getter -> phai dinh nghia lai
    req.validatedQuery = value;
    Object.defineProperty(req, "query", {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    return;
  }
  req[target] = value;
}

/** Duong tat khi chi can validate body. */
export const validateBody = (schema) => validate({ body: schema });
export const validateParams = (schema) => validate({ params: schema });
export const validateQuery = (schema) => validate({ query: schema });
