// @flow

const { runSparqlQuery } = require('../../components/Sparql')

class ParseError {
  message: string
  args: [any]

  constructor(message, ...args) {
    self.message = message
    self.args = args
  }
}

const query_search = 'SELECT ?person ?name COUNT(?inf) as ?score \
WHERE { \
  ?person a foaf:Person. \
  ?person foaf:name ?name. \
\
  {?inf dbpedia-owl:influenced ?person.} \
  UNION \
  {?person dbpedia-owl:influenced ?inf.} \
  UNION \
  {?inf dbpedia-owl:influencedBy ?person.} \
  UNION \
  {?person dbpedia-owl:influencedBy ?inf.} \
  UNION \
  {?inf dbprop:influenced ?person.} \
  UNION \
  {?person dbprop:influenced ?inf.} \
  UNION \
  {?inf dbprop:influences ?person.} \
  UNION \
  {?person dbprop:influences ?inf.} \
\
  filter( regex(str(?name), "%search_query%", "i")). \
} \
ORDER BY DESC(?score) \
LIMIT 10';


type Uri = string

type PersonJSON = {
  name: {
    type: string,
    value: string,
  },
  person: {
    type: string,
    value: string,
  },
  score: {
    datatype: string,
    type: string,
    value: string,
  }
}

type PersonResult = {
  name: string,
  uri: Uri,
  score: number,
}

const personResultFromJS = (js: PersonJSON): PersonResult => {
  if (js.name.type !== 'literal') {
    throw new ParseError('Unexpected name type:', js.name.type)
  }
  if (js.person.type !== 'uri') {
    throw new ParseError('Unexpected person type:', js.person.type)
  }
  if (js.score.type !== 'typed-literal' && js.score.datatype !== 'http://www.w3.org/2001/XMLSchema#integer') {
    throw new ParseError('Unexpected score type:', js.score.type, js.score.datatype)
  }
  return {
    name: js.name.value,
    uri: js.person.value,
    score: parseInt(js.score.value, 10),
  }
}

type SearchResultJSON = {
  results: {
    bindings: Array<PersonJSON>
  }
}

const searchForPeople = (name: string): Promise<Array<PersonResult>> =>
  runSparqlQuery(query_search, { search_query: name.trim() })
    .then((js: SearchResultJSON): Array<PersonResult> =>
      js.results.bindings.map(js_ => personResultFromJS(js_)))

module.exports = {
  searchForPeople,
}

