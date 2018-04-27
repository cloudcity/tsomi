// @flow

const { last } = require('../../util')

class History {
  past: Array<string>
  future: Array<string>
  
  constructor() {
    this.past = []
    this.future = []
  }

  hasPast() {
    return !!this.past.length
  }

  clearFuture() {
    this.future = []
  }

  hasFuture() {
    return !!this.future.length
  }

  current() {
    return last(this.past)
  }

  goTo(str: string) {
    if(last(this.past) !== str)
      this.past.push(str)
  }

  addToFuture(str: string) {
    this.future.push(str)
  }

  goBack() {
    if(!this.hasPast())
      return false
    
    console.log(JSON.stringify(this.past))
    const p = this.past.pop()
    console.log(JSON.stringify(this.past))

    this.future.push(p)
    return p
  }

  goForward() {
    if(!this.hasFuture())
      return false

    const mostRecent = last(this.future)
    this.past.push(mostRecent)
    return this.current()
  }
}

module.exports = { History }

