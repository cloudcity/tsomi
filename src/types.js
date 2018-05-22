// @flow

import moment from 'moment'

export type Uri = string

export type SubjectId = string
export const mkSubjectId = (s: string): SubjectId => s.trim()
export const mkSubjectFromDBpediaUri = (url: Uri): SubjectId => url.trim().split('/').reverse()[0]
export const dbpediaSubjectId = (s: SubjectId): string => `dbpedia:${s}`

export type PersonAbstract = {|
  type: 'PersonAbstract',
  id: SubjectId,
  uri: Uri,
  name: string,
  abstract?: string,
  birthPlace?: string,
  birthDate?: moment,
  deathDate?: moment,
  influencedByCount: number,
  influencedCount: number,
|}

export type PersonDetail = {|
  type: 'PersonDetail',
  id: SubjectId,
  thumbnail: ?string,
  uri: Uri,
  name: string,
  abstract?: string,
  birthPlace?: string,
  birthDate: ?moment,
  deathDate: ?moment,
  influencedBy: Array<SubjectId>,
  influenced: Array<SubjectId>,
|}

