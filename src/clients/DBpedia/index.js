// @flow

import { type PersonAbstract, type PersonDetail, type SubjectId, mkSubjectFromDBpediaUri } from '../../types'

const { runSparqlQuery } = require('../../components/Sparql')

class ParseError {
  message: string
  args: Array<any>

  constructor(message, ...args) {
    this.message = message
    this.args = args
  }
}

/* eslint no-multi-str: off */
const queryPersonAbstract = 'SELECT ?person ?name ?birthPlace ?birthDate ?deathDate COUNT(DISTINCT ?influencedBy) as ?influencedByCount COUNT(DISTINCT ?influenced) as ?influencedCount ?abstract \
WHERE { \
  ?person a foaf:Person. \
  ?person foaf:name ?name. \
  OPTIONAL { ?person dbo:abstract ?abstract. } \
  OPTIONAL { ?person dbo:birthPlace ?birthPlace. } \
  OPTIONAL { ?person dbo:birthDate ?birthDate. } \
  OPTIONAL { ?person dbo:deathDate ?deathDate. } \
  ?person dbpedia-owl:influencedBy ?influencedBy. \
  ?person dbpedia-owl:influenced ?influenced \
  filter( regex(str(?name), "%search_query%", "i") ) \
  filter( lang(?abstract) = "en" ). \
}'

type PersonJSON = {
  person: { [string]: any },
  name: { [string]: any },
  abstract: { [string]: any },
  birthPlace?: { [string]: any },
  birthDate?: { [string]: any },
  deathDate?: { [string]: any },
  influencedByCount?: { [string]: any },
  influencedCount?: { [string]: any },
  influencedBy: { [string]: any },
  influenced: { [string]: any },
}

const personAbstractFromJS = (js: PersonJSON): PersonAbstract => {
  if (js.person.type !== 'uri') {
    throw new ParseError('Unexpected person uri type:', js.person.type)
  }
  if (js.name.type !== 'literal') {
    throw new ParseError('Unexpected name type:', js.name.type)
  }
  if (js.abstract && (js.abstract.type !== 'literal')) {
    throw new ParseError('Unexpected abstract type:', js.abstract.type)
  }

  if (js.birthPlace && js.birthPlace.type !== 'uri') {
    throw new ParseError('Unexpected birthPlace type:', js.birthPlace.type)
  }

  if (js.birthDate &&
    (js.birthDate.type !== 'typed-literal' || js.birthDate.datatype !== 'http://www.w3.org/2001/XMLSchema#date')) {
    throw new ParseError('Unexpected birthDate type:', js.birthDate.type, js.birthDate.datatype)
  }

  if (js.deathDate &&
    (js.deathDate.type !== 'typed-literal' || js.deathDate.datatype !== 'http://www.w3.org/2001/XMLSchema#date')) {
    throw new ParseError('Unexpected deathDate type:', js.deathDate.type, js.deathDate.datatype)
  }

  if (js.influencedByCount &&
    (js.influencedByCount.type !== 'typed-literal' || js.influencedByCount.datatype !== 'http://www.w3.org/2001/XMLSchema#integer')) {
    throw new ParseError('Unexpected influencedByCount type:', js.influencedByCount.type, js.influencedByCount.datatype)
  }

  if (js.influencedCount &&
    (js.influencedCount.type !== 'typed-literal' || js.influencedCount.datatype !== 'http://www.w3.org/2001/XMLSchema#integer')) {
    throw new ParseError('Unexpected influencedCount type:', js.influencedCount.type, js.influencedCount.datatype)
  }


  return {
    type: 'PersonAbstract',
    uri: js.person.value,
    name: js.name.value,
    abstract: js.abstract.value,
    birthPlace: js.birthPlace ? js.birthPlace.value : undefined,
    birthDate: js.birthDate ? js.birthDate.value : undefined,
    deathDate: js.deathDate ? js.deathDate.value : undefined,
    influencedByCount: js.influencedByCount ? parseInt(js.influencedByCount.value, 10) : 0,
    influencedCount: js.influencedCount ? parseInt(js.influencedCount.value, 10) : 0,
  }
}

type SearchResultJSON = {
  results: {
    bindings: Array<PersonJSON>
  }
}

/* TODO: searchForPeople may return two hits that have the same URL. Find and
 * merge those, probably withe first hit. i.e.:
 *
 * {name: "Sir Walter Scott, Bt", uri: "http://dbpedia.org/resource/Walter_Scott", score: 37}
 * {name: "Walter Scott", uri: "http://dbpedia.org/resource/Walter_Scott", score: 37}
 * =>
 * {name: "Sir Walter Scott, Bt", uri: "http://dbpedia.org/resource/Walter_Scott", score: 37}
 */
const searchForPeople = (name: string): Promise<Array<PersonAbstract>> =>
  runSparqlQuery(queryPersonAbstract, { search_query: name.trim() })
    .then((js: SearchResultJSON): Array<PersonAbstract> =>
      js.results.bindings.map(js_ => personAbstractFromJS(js_)))


const queryPersonDetail = 'SELECT ?person ?name ?birthPlace ?birthDate ?deathDate ?influencedBy ?influenced ?abstract \
WHERE { \
  ?person a foaf:Person. \
  ?person foaf:name ?name. \
  OPTIONAL { ?person dbo:abstract ?abstract. } \
  OPTIONAL { ?person dbo:birthPlace ?birthPlace. } \
  OPTIONAL { ?person dbo:birthDate ?birthDate. } \
  OPTIONAL { ?person dbo:deathDate ?deathDate. } \
  ?person dbpedia-owl:influencedBy ?influencedBy. \
  ?person dbpedia-owl:influenced ?influenced \
  filter( regex(str(?person), "%search_query%") ) \
  filter( lang(?abstract) = "en" ). \
}'

const getPerson = (s: SubjectId): Promise<?PersonDetail> =>
  runSparqlQuery(queryPersonDetail, { search_query: s })
    .then((js: SearchResultJSON): ?PersonDetail => {
      const bindings = js.results.bindings
      const base = bindings.length > 0 ? bindings[0] : undefined
      if (!base) { return null }

      let influencedBy = {}
      let influenced = {}
      for (let i = 0; i < bindings.length; i++) {
        influencedBy[mkSubjectFromDBpediaUri(bindings[i].influencedBy.value)] = 1
        influenced[mkSubjectFromDBpediaUri(bindings[i].influenced.value)] = 1
      }

      return {
        type: 'PersonDetail',
        uri: base.person.value,
        name: base.name.value,
        abstract: base.abstract.value,
        birthPlace: base.birthPlace ? base.birthPlace.value : undefined,
        birthDate: base.birthDate ? base.birthDate.value : undefined,
        deathDate: base.deathDate ? base.deathDate.value : undefined,
        influencedBy: Object.keys(influencedBy),
        influenced: Object.keys(influenced),
      }
    })


module.exports = {
  getPerson,
  searchForPeople,
}

