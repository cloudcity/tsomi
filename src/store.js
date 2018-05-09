// @flow

import type { PersonAbstract, PersonDetail, SubjectId, Uri } from './types'

export type Store = {
  influencers: number,
  influenced: number,
  showAboutPage: bool,
  subjectId: string,
  wikiDivHidden: bool,
  people: { [SubjectId]: PersonAbstract | PersonDetail },
  currentWikiPageUri: Uri,
}

export const initialState = (): Store => ({
  influencers: 10,
  influenced: 20,
  showAboutPage: false,
  subjectId: 'Joyce_Carol_Oates',
  wikiDivHidden: false,
  people: {},
  currentWikiPageUri: '',
})

export type Action = {
  type: string,
  [string]: any
}

export const cachePerson = (s: SubjectId, p: PersonAbstract | PersonDetail): Action =>
  ({ type: 'CACHE_PERSON', subjectId: s, person: p })
export const setAboutPage = (state: bool): Action =>
  ({ type: 'SET_ABOUT_PAGE', state })
export const setWikiUri = (uri: Uri): Action =>
  ({ type: 'SET_WIKI_URI', uri })
export const toggleAboutPage = (): Action =>
  ({ type: 'TOGGLE_ABOUT_PAGE' })
export const updateInfluencerCount = (i: number): Action =>
  ({ type: 'UPDATE_INFLUENCER_COUNT', cnt: i })
export const updateInfluencedCount = (i: number): Action =>
  ({ type: 'UPDATE_INFLUENCED_COUNT', cnt: i })

export const influencers = (store: Store): number => store.influencers
export const influenced = (store: Store): number => store.influenced
export const lookupPerson = (s: SubjectId) =>
  (store: Store): PersonAbstract | PersonDetail | void => store.people[s]
export const showAboutPage = (store: Store): bool => store.showAboutPage
export const wikiUri = (store: Store): Uri => store.currentWikiPageUri

export const runState = (state?: Store = initialState(), action: any): Store => {
  switch (action.type) {
    case 'CACHE_PERSON':
      return {
        ...state,
        people: {
          ...state.people,
          [action.subjectId]: action.person,
        },
      }
    case 'SET_ABOUT_PAGE':
      return {
        ...state,
        showAboutPage: action.state,
      }

    case 'SET_WIKI_URI':
      return {
        ...state,
        currentWikiPageUri: action.uri,
      }

    case 'TOGGLE_ABOUT_PAGE':
      return {
        ...state,
        showAboutPage: !state.showAboutPage,
      }

    case 'UPDATE_INFLUENCER_COUNT':
      return {
        ...state,
        influencers: action.cnt,
      }

    case 'UPDATE_INFLUENCED_COUNT':
      return {
        ...state,
        influenced: action.cnt,
      }

    default:
      return state
  }
}

