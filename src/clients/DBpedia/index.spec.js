import moment from 'moment'

const { getPerson, searchForPeople } = require('./')

describe('searching dbpedia', () => {
  var originalTimeout;

  beforeEach(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
  });

  afterEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout)

  it('retrieves an individual result', (done) => {
    searchForPeople('Joyce Carol Oates').then(lst => {
      expect(lst.length).toEqual(2)

      console.log('[Joyce Carol Oates]')
      console.log(lst[0].birthDate)
      console.log(moment('1938-6-16'))
      console.log(lst[0].birthDate.isSame(moment('1938-6-16')))

      expect(lst[0].uri).toEqual('http://dbpedia.org/resource/Joyce_Carol_Oates')
      expect(lst[0].name).toEqual('Joyce Carol Oates')
      expect(lst[0].birthPlace).toEqual('http://dbpedia.org/resource/Lockport_(city),_New_York')
      expect(lst[0].birthDate.isSame(moment('1938-6-16'))).toBe(true)
      expect(lst[0].deathDate).toEqual(undefined)
      expect(lst[0].influencedByCount).toEqual(14)
      expect(lst[0].influencedCount).toEqual(4)
      done()
    }).catch(err => {
      console.log('exception:', err)
      expect(false).toEqual(true)
      done()
    })
  })

  /* TODO: I can't seem to get the searches for Charlotte and Emily correct.
  it('retrieves the correct result if a diacritic was missed', (done) => {
    searchForPeople('Charlotte Brontë').then(lst => {
      console.log(lst)
      expect(lst.length).toEqual(1)
      expect(lst[0]).toEqual({ name: 'Emily Brontë', uri: 'http://dbpedia.org/resource/Joyce_Carol_Oates', store: 24 })
      done()
    })
  })
  */

  /* TODO: this is now broken, because *ugh* searching
  it('retrieves many results for an inexact hit', (done) => {
    searchForPeople('Emily').then(lst => {
      expect(lst.length >= 1).toBeTruthy()
      done()
    })
  })
  */
})


describe('precise dbpedia gets', () => {
  it('retrieves Joyce Carol Oates with all influencers', (done) => {
    getPerson('Joyce_Carol_Oates'.trim()).then(person => {
      console.log(person)

      expect(person.uri).toEqual('http://dbpedia.org/resource/Joyce_Carol_Oates')
      expect(person.name).toEqual('Joyce Carol Oates')
      expect(person.birthPlace).toEqual('http://dbpedia.org/resource/Lockport_(city),_New_York')
      expect(person.birthDate.isSame(moment('1938-06-16'))).toBe(true)
      expect(person.deathDate).toEqual(undefined)
      console.log(person.influencedBy)
      console.log(person.influenced)
      done()
    }).catch(err => {
      console.log('exception:', err)
      expect(false).toEqual(true)
      done()
    })
  })
})

