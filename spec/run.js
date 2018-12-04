const Jasmine = require('jasmine')

require('isomorphic-fetch')

const jasmine = new Jasmine()
jasmine.loadConfigFile('spec/support/jasmine.json')
jasmine.execute()
