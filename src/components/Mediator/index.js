// @flow

type Owner = 'react' | 'd3'

type Record = { [string]: Function }
type Map = {
  react: Record,
  d3: Record
}

const m: Map = {
  react: {},
  d3: {}
}

const addEntry = (o: Owner, n: string, f: Function) =>
  m[o][n] = f

const getEntry = (o: Owner, n: string) => 
  m[o][n]

module.exports = {
  addEntry,
  getEntry,
  m // do not import unless you are tests
}

