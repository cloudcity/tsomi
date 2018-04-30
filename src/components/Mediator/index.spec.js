const { addEntry, getEntry, m } = require('./')

describe('mediator', () => {
  it('should save functions', () => {
    const fn = () => true 

    addEntry('react', 'test', fn)
    expect(m.react.test).toEqual(fn)
  })

  it('should get functions', () => {
    const fn = () => false

    addEntry('d3', 'test', fn)
    expect(getEntry('d3', 'test')).toEqual(fn)
  })
})

