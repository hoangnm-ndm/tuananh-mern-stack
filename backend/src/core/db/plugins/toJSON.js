/**
 * Plugin Mongoose: chuan hoa output JSON cho MOI model.
 * - _id  -> id (frontend khong can biet quy uoc cua Mongo)
 * - Xoa __v
 * - Xoa cac field danh dau `private: true` trong schema (vd: password)
 *
 * Cach dung: schema.plugin(toJSONPlugin)
 */
export function toJSONPlugin(schema) {
  const existingTransform = schema.get("toJSON")?.transform;

  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(doc, ret, options) {
      // Xoa field duoc danh dau private trong schema
      for (const [path, schemaType] of Object.entries(schema.paths)) {
        if (schemaType.options?.private) deleteByPath(ret, path);
      }

      ret.id = ret.id ?? ret._id?.toString?.();
      delete ret._id;
      delete ret.__v;

      return existingTransform ? existingTransform(doc, ret, options) : ret;
    },
  });
}

function deleteByPath(object, path) {
  const segments = path.split(".");
  let cursor = object;
  for (let i = 0; i < segments.length - 1; i += 1) {
    if (cursor == null) return;
    cursor = cursor[segments[i]];
  }
  if (cursor != null) delete cursor[segments.at(-1)];
}
