import { ApolloServer, gql, SchemaDirectiveVisitor } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";

import { people } from "../data.js";
import FormattableDateDirective from "../shared/FomattableDateDirective";

const port = 4001;

const typeDefs = gql`
  directive @date(defaultFormat: String = "mmmm d, yyyy") on FIELD_DEFINITION

  type Person @key(fields: "id") {
    id: ID!
    dateOfBirth: String @date
    name: String
  }

  extend type Query {
    person(id: ID!): Person
    people: [Person]
  }
`;

const resolvers = {
  Person: {
    __resolveReference(object) {
      return people.find(person => person.id === object.id);
    }
  },
  Query: {
    person(_, { id }) {
      return people.find(person => person.id === id);
    },
    people() {
      return people;
    }
  }
};

const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
const directives = { date: FormattableDateDirective };
SchemaDirectiveVisitor.visitSchemaDirectives(schema, directives);

const server = new ApolloServer({ schema });

server.listen({ port }).then(({ url }) => {
  console.log(`People service ready at ${url}`);
});
