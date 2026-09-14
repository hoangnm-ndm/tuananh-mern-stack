import { HTTP_STATUS } from "../constants/httpStatus.js";

/**
 * Chuan hoa response thanh cong. MOI endpoint deu tra ve cung mot hinh dang
 * -> frontend chi can viet 1 lop xu ly duy nhat.
 *
 * Hinh dang:
 *   { success: true, message: string, data: any, meta?: object }
 */
export const ApiResponse = {
  /** 200 OK */
  ok(res, data = null, message = "Thanh cong", meta) {
    return res.status(HTTP_STATUS.OK).json(buildBody({ message, data, meta }));
  },

  /** 201 Created */
  created(res, data = null, message = "Tao moi thanh cong") {
    return res.status(HTTP_STATUS.CREATED).json(buildBody({ message, data }));
  },

  /** 204 No Content - khong co body */
  noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  },

  /**
   * 200 OK kem thong tin phan trang.
   * @param {{items: any[], total: number, page: number, limit: number}} result
   */
  paginated(res, result, message = "Thanh cong") {
    const { items, total, page, limit } = result;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    return res.status(HTTP_STATUS.OK).json(
      buildBody({
        message,
        data: items,
        meta: {
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
          },
        },
      }),
    );
  },
};

function buildBody({ message, data, meta }) {
  return {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}
