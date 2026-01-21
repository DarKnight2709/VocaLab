/**
 * A mongoose schema plugin which applies the following in toJSON transform:
 *  - removes __v and any path that has private: true
 *  - replaces _id with id
 */

const toJSON = (schema) => {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret, options) => {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          delete ret[path];
        }
      });

      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  });
};

module.exports = toJSON;
