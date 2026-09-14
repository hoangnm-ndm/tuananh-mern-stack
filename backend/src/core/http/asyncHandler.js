/**
 * Boc mot handler async de moi loi (Promise reject) tu dong di vao errorHandler,
 * thay vi phai viet try/catch lap di lap lai o tung controller.
 *
 * Express 5 da tu bat Promise reject, nhung ta van dung asyncHandler de:
 *  - tuong thich nguoc Express 4,
 *  - y dinh ro rang khi doc code.
 *
 * @example router.get("/", asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (handler) => (req, res, next) => {
  // try/catch bao ben ngoai la BAT BUOC: neu handler nem loi DONG BO
  // (truoc khi tra ve Promise), `Promise.resolve(...)` chua kip chay de bat.
  try {
    return Promise.resolve(handler(req, res, next)).catch(next);
  } catch (error) {
    next(error);
    return Promise.resolve();
  }
};

/** Bien the cho middleware nhan 4 tham so (err, req, res, next). */
export const asyncErrorHandler = (handler) => (err, req, res, next) => {
  try {
    return Promise.resolve(handler(err, req, res, next)).catch(next);
  } catch (error) {
    next(error);
    return Promise.resolve();
  }
};
