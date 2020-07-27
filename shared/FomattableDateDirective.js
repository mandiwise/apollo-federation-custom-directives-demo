import { defaultFieldResolver, GraphQLString } from "graphql";
import { SchemaDirectiveVisitor } from "apollo-server";
import formatDate from "dateformat";

class FormattableDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { defaultFormat } = this.args;

    field.args.push({
      name: "format",
      type: GraphQLString
    });

    field.resolve = async function (
      source,
      { format, ...otherArgs },
      context,
      info
    ) {
      const date = await resolve.call(this, source, otherArgs, context, info);
      return formatDate(date, format || defaultFormat);
    };
  }
}

export default FormattableDateDirective;
