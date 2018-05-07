const { searchForPeople } = require('./')

describe('DBpedia library', () => {
  it('retrieves an individual result', (done) => {
    searchForPeople('Joyce Carol Oates').then(lst => {
      expect(lst.length).toEqual(1)
      expect(lst[0]).toEqual({ name: 'Joyce Carol Oates', uri: 'http://dbpedia.org/resource/Joyce_Carol_Oates', score: 24 })
      done()
    })
  })

  /*TODO: I can't seem to get the searches for Charlotte and Emily correct.
  it('retrieves the correct result if a diacritic was missed', (done) => {
    searchForPeople('Charlotte Brontë').then(lst => {
      console.log(lst)
      expect(lst.length).toEqual(1)
      expect(lst[0]).toEqual({ name: 'Emily Brontë', uri: 'http://dbpedia.org/resource/Joyce_Carol_Oates', store: 24 })
      done()
    })
  })
  */

  it('retrieves many results for an inexact hit', (done) => {
    searchForPeople('Emily').then(lst => {
      expect(lst.length >= 1).toBeTruthy()
      done()
    })
  })
})

