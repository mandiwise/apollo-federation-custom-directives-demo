import { defaultFieldResolver } from "graphql";
import { SchemaDirectiveVisitor } from "apollo-server";

class AllCapsTitleDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function (...args) {
      const result = await resolve.apply(this, args);

      if (result.length) {
        return result.map(res => ({ ...res, title: res.title.toUpperCase() }));
      }

      return result;
    };
  }
}

export default AllCapsTitleDirective;
