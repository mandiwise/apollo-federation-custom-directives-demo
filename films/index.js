import { ApolloServer, gql, SchemaDirectiveVisitor } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";

import { films } from "../data.js";
import AllCapsTitleDirective from "../shared/AllCapsTitleDirective";
import FormattableDateDirective from "../shared/FomattableDateDirective";

const port = 4002;

const typeDefs = gql`
  directive @allCapsTitle on FIELD_DEFINITION

  directive @date(defaultFormat: String = "mmmm d, yyyy") on FIELD_DEFINITION

  type Film {
    id: ID!
    title: String
    actors: [Person]
    director: Person
    releaseDate(format: String): String @date(defaultFormat: "shortDate")
  }

  extend type Person @key(fields: "id") {
    id: ID! @external
    appearedIn: [Film]
    directed: [Film] @allCapsTitle
  }

  extend type Query {
    film(id: ID!): Film!
    films: [Film]
  }
`;

const resolvers = {
  Film: {
    actors(film) {
      return film.actors.map(actor => ({ __typename: "Person", id: actor }));
    },
    director(film) {
      return { __typename: "Person", id: film.director };
    }
  },
  Person: {
    appearedIn(person) {
      return films.filter(film =>
        film.actors.find(actor => actor === person.id)
      );
    },
    directed(person) {
      return films.filter(film => film.director === person.id);
    }
  },
  Query: {
    film(_, { id }) {
      return films.find(film => film.id === id);
    },
    films() {
      return films;
    }
  }
};

const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
const directives = {
  date: FormattableDateDirective,
  allCapsTitle: AllCapsTitleDirective
};
SchemaDirectiveVisitor.visitSchemaDirectives(schema, directives);

const server = new ApolloServer({ schema });

server.listen({ port }).then(({ url }) => {
  console.log(`Films service ready at ${url}`);
});
