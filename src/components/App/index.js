// @flow
/* eslint no-restricted-globals: off, no-console: off, no-underscore-dangle: off */

import * as fp from 'lodash/fp'

import ErrorBox from '../ErrorBox'
import InfluenceChart from '../InfluenceChart'
import Navbar from '../Navbar/'
import WikiCollapse from '../WikiCollapse'
import { type WikiDivState } from '../../store'
import * as store from '../../store'
import { type Uri, type SubjectId, type PersonDetail, wikipediaMobileUri } from '../../types'
import * as dbpedia from '../../clients/DBpedia'

const React = require('react')
const { connect } = require('react-redux')

const { WikiDiv } = require('../Wikidiv/')
const { About } = require('../About/')


require('./main.css')


type AccordionEvent = 'None', 

type ChartAccordionClass = 'chart-div-normal' | 'chart-div-expanding' | 'chart-div-expanded' | 'chart-div-contracing';
type WikiAccordionClass = 'wiki-div-visible' | 'wiki-div-hidden' | 'wiki-div-fadeout' | 'wiki-div-fade-in';


/*
const runAccordionState = (initial: AccordionState): (AccordionState, ?TimeoutId) => {
  switch (initial) {
    case 'balanced':
      return ('wiki-fade-out', setTimeout(() => )
    case 'chart-only':
      return ('
    case 'wiki-fade-out':
    case 'wiki-fade-in':
    case 'expanding-chart':
    case 'contracting-chart':
    default:
      throw Error('Invalid accordion state: ', initial)
  }
}
*/


/*
const chartDivStateTag = (state: AccordionState): string => {
  switch (state) {
    case 'visible': return 'chart-div-normal'
    case 'collapsing': return 'chart-div-expanding'
    case 'hidden': return 'chart-div-expanded'
    case 'expanding': return 'chart-div-contracting'
    default: return 'chart-div-normal'
  }
}

const wikiDivStateTag = (state: AccordionState): string => {
  switch (state) {
    case 'visible': return 'wiki-div-visible'
    case 'collapsing': return 'wiki-div-hiding'
    case 'hidden': return 'wiki-div-hidden'
    case 'expanding': return 'wiki-div-appearing'
    default: return 'wiki-div-visible'
  }
}
*/

/* eslint react/no-unused-state: off, react/no-unused-prop-types: off */
type AppProps = {
  errorMessage: ?string,
  focusedSubject: SubjectId,
  searchString: ?string,
  showAboutPage: bool,
  subjectId: string,
  wikiDivState: AccordionState,
  wikiUri: string,

  cachePerson: (SubjectId, PersonDetail) => void,
  focusOnPerson: SubjectId => void,
  goHome: void => void,
  saveSearchResults: (?string, Array<PersonDetail>) => void,
  setErrorMessage: ?string => void,
  setLoadInProgress: ?SubjectId => void,
  setSearchInProgress: bool => void,
  setWikiUri: Uri => void,
  toggleAboutPage: void => void,
  setAccordionState: AccordionState => void,
}
type AppState = {|
  errorTimer: ?TimeoutID,
  animationTimer: ?TimeoutID,
|}

class App_ extends React.Component<AppProps, AppState> {
  static getDerivedStateFromProps(newProps: AppProps, prevState: AppState): AppState {
    if (newProps.errorMessage && prevState.errorTimer === null) {
      return {
        ...prevState,
        errorTimer: setTimeout(
          () => {
            newProps.setErrorMessage(null)
          },
          5 * 1000,
        ),
      }
    } else if (!newProps.errorMessage) {
      return { ...prevState, errorTimer: null }
    }
    return prevState
  }

  constructor(props: AppProps) {
    super(props)

    this.state = { animationTimer: null, errorTimer: null }
  }

  componentDidMount() {
    this.getAndCachePerson_(this.props.focusedSubject).then((person: ?PersonDetail) => {
      if (person !== null && person !== undefined) {
        this.focusPerson(person.id)
      }
    })
  }

  getAndCachePerson_(n: SubjectId): Promise<?PersonDetail> {
    return dbpedia.getPerson(n)
      .then((person: ?PersonDetail): Promise<PersonDetail> =>
        new Promise((res, rej) => {
          if (person === null || person === undefined) {
            rej()
          } else {
            this.props.cachePerson(n, person)
            res(person)
          }
        }))
      .catch((err) => {
        if (err === undefined) return
        console.log('[getAndCachePerson_ handler]', err)
        this.props.setErrorMessage(`Retrieving ${n.toString()} failed. Give us a few minutes and please try again.`)
      })
  }

  focusPerson(n: SubjectId): void {
    this.props.setLoadInProgress(n)
    this.getAndCachePerson_(n).then((person: ?PersonDetail) => {
      if (person === null || person === undefined) return

      try {
        window.history.pushState(
          '',
          n,
          `${location.origin}${location.pathname}?subject=${n.asString()}`,
        )
      } catch (error) {
        console.error('Cannot modify window history: ', error)
      }
      if (person.wikipediaUri) {
        const uri = person.wikipediaUri
        const muri = wikipediaMobileUri(uri)
        this.props.setWikiUri(muri || uri)
      }
      this.props.saveSearchResults(null, [])
      return Promise.all([
        ...(person.influencedBy.map(i => this.getAndCachePerson_(i))),
        ...(person.influenced.map(i => this.getAndCachePerson_(i))),
      ])
    }).then(() => {
      this.props.focusOnPerson(n)
      this.props.setLoadInProgress(null)
    }).catch((err) => {
      console.log('[focusPerson]', err)
      this.props.setErrorMessage(`Oops! Focusing on ${n.asString()} failed. Give us a few minutes and please try again.`)
    })
  }

  submitSearch(name: string) {
    this.props.setSearchInProgress(true)
    dbpedia.searchForPeople(name)
      .then((people: Array<?PersonDetail>): void =>
        this.props.saveSearchResults(name, fp.filter(p => p != null)(people)))
      .catch((err) => {
        this.props.setSearchInProgress(false)
        if (err.message === 'request timed out') {
          this.props.setErrorMessage(`Searching for ${name} timed out. Please try your search again.`)
        } else {
          console.log(err)
          this.props.setErrorMessage(`Oops! Searching for ${name} failed. Give us a few minutes and please try again.`)
        }
      })
  }

  animateToChartOnly() {
    while (this.props.wikiDivState != 'chart-only') {
      switch (this.props.wikiDivState) {
        case 'balanced':
          this.props.setAccordionState('wiki-fade-out')
          await sleep(1000)
          break
        case 'wiki-fade-out':
          this.props.setAccordionState('expanding-chart')
          await sleep(1000)
          break
        case 'expanding-chart':
          this.props.setAccordionState('chart-only')
          break
        default:
          return
      }
    }
  }

  animateToBalanced() {
    while (this.props.wikiDivState != 'balanced') {
      switch (this.props.wikiDivState) {
        case 'chart-only':
          this.props.setAccordionState('contracting-chart')
          await sleep(1000)
        case 'contracting-chart':
          this.props.setAccordionState('
        case 'wiki-fade-in':
        default:
          return
      }
    }
  }

  toggleWikiDiv() {
    new Promise((resolve, reject) => {
      switch (this.props.wikiDivState) {
        case 'balanced': {
          this.animateToChartOnly()
          /*
          this.props.setAccordionState('collapsing')
          const timer = setTimeout(() => {
            this.setState({ animationTimer: null })
            this.props.setAccordionState('hidden')
          },
          6 * 1000)
          this.setState({ animationTimer: timer })
          return
          */
          resolve()
        }
        case 'chart-only': {
          this.animateToBalanced()
          /*
          this.props.setAccordionState('expanding')
          const timer = setTimeout(() => {
            this.setState({ animationTimer: null })
            this.props.setAccordionState('visible')
          },
          10 * 1000)
          this.setState({ animationTimer: timer })
          return
          */
          resolve()
        }
        default:
          reject()
      }
  }

  render() {
    const navbar = React.createElement(Navbar, {
      key: 'navbar',
      closeSearch: () => this.props.saveSearchResults(null, []),
      focusPerson: subjectId => this.focusPerson(subjectId),
      goHome: () => this.props.goHome(),
      toggleAbout: () => this.props.toggleAboutPage(),
      submitSearch: name => this.submitSearch(name),
      searchString: this.props.searchString,
    })

    const about = React.createElement(About, {
      key: 'about',
      goBack: () => this.props.toggleAboutPage(),
      focusPerson: n => this.focusPerson(n),
    })

    const influenceChart = React.createElement(InfluenceChart, {
      label: 'influencechart',
      selectPerson: (n: SubjectId): void => this.focusPerson(n),
    })
    const chartDiv = React.createElement(
      'div',
      {
        key: 'chartdiv',
        id: 'chartdiv',
        className: chartDivStateTag(this.props.wikiDivState),
      },
      influenceChart,
    )

    const wikiCollapse = React.createElement(WikiCollapse, {
      setWikiDivHidden: () => this.toggleWikiDiv(),
    })

    const wikiDiv = React.createElement(WikiDiv, {
      className: wikiDivStateTag(this.props.wikiDivState),
      key: 'wikidiv',
      subject: this.props.subjectId,
      url: this.props.wikiUri,
    })

    if (this.props.showAboutPage) {
      return React.createElement(
        'div',
        {},
        about,
      )
    }

    const errorBox = this.props.errorMessage
      ? React.createElement(
        'div',
        { id: 'main-errors' },
        ErrorBox({ msg: this.props.errorMessage }),
      )
      : null

    return React.createElement(
      'div',
      {},
      navbar,
      React.createElement(
        'div',
        { id: 'main-content' },
        chartDiv,
        wikiCollapse,
        wikiDiv,
        errorBox,
      ),
    )
  }
}

const App = connect(
  state => ({
    errorMessage: store.errorMessage(state),
    focusedSubject: store.focusedSubject(state),
    loadInProgress: store.loadInProgress(state),
    showAboutPage: store.showAboutPage(state),
    wikiDivState: store.wikiDivState(state),
    wikiUri: store.wikiUri(state),
  }),
  dispatch => ({
    cachePerson: (subjectId, person) => dispatch(store.cachePerson(subjectId, person)),
    focusOnPerson: subjectId => dispatch(store.focusOnPerson(subjectId)),
    goHome: () => dispatch(store.setAboutPage(false)),
    setLoadInProgress: (subject: ?SubjectId) => dispatch(store.setLoadInProgress(subject)),
    saveSearchResults: (str: ?string, results: Array<PersonDetail>): void =>
      dispatch(store.saveSearchResults(str, results)),
    setErrorMessage: (msg: ?string) => dispatch(store.setErrorMessage(msg)),
    setSearchInProgress: (status: bool) => dispatch(store.setSearchInProgress(status)),
    setAccordionState: (status: AccordionState) => dispatch(store.setAccordionState(status)),
    setWikiUri: uri => dispatch(store.setWikiUri(uri)),
    toggleAboutPage: () => dispatch(store.toggleAboutPage()),
  }),
)(App_)

export default App

