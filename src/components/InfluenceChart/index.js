// @flow

import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { type SubjectId, type PersonAbstract, type PersonDetail } from '../../types'
import { type PeopleCache } from '../../store'
import { difference, union } from '../../utils/Set'

const store = require('../../store')

const d3 = require('d3')
const $ = require('jquery')
const _ = require('lodash')
const fp = require('lodash/fp')

/*
const { 
  createSpecialData, 
  subjects, 
  lengthen, 
  getPerson, 
  searchForPeople 
} = require('../../tsomi-rdf')
*/

const {
  angleRadians,
  convertSpaces,
  getURLParameter,
  getURLElement,
  largest, 
  //parseDate,
  populate_path,
  radial,
  smallest
} = require('../../util')

const {
  ARROW_WIDTH,
  BACK_BUTTON,
  BANNER_X,
  BANNER_Y,
  BANNER_SIZE,
  CHARGE_BASE,
  CHARGE_HIDDEN,
  CHARGE_RANDOM,
  DEFAULT_DURATION,
  FB_BUTTON_SIZE,
  FB_BUTTON_X_OFF,
  FB_BUTTON_X,
  FB_BUTTON_Y,
  FORWARD_BUTTON,
  GRAVITY,
  HEAD_ANGLE,
  IMAGE_SIZE,
  LINK_BASE,
  LINK_MIN_OFFSET,
  LINK_RANDOM,
  LINK_STRENGTH,
  MAX_SCREEN_NODES,
  MARGIN,
  NODE_SIZE,
  PRINTABLE,
  PRINTABLE_PARAM,
  RIM_SIZE,
  STOCK_EASE,
  TIMELINE_OPACITY,
  TIMELINE_HIGHLIGHT_OPACITY,
  TIMELINE_MARGIN,
  TIMELINE_Y,
  UNKNOWN_PERSON,
  WIKI_LOGO,
  WIKI_ICON_WIDTH
} = require('../../constants')

const DEFAULT_ANIMATION_DURATION = 2000

// defining a buncha variables that sadly need to be in
// global scope for now. TODO: refactor this!!
//let svg
//let force
//let timelineScale
//let timelineAxis
//let nextMidId = 0
//let linkGroup
//let timelinesGroup
//let nodeGroup
//let axiesGroup
//let CHART_WIDTH
//let CHART_HEIGHT

// utility functions
/*
const establishInitialSubject = () => {
  const urlSubject = getURLParameter('subject')
  return urlSubject
    ? `dbpedia:${urlSubject}`
    : subjects.oats
}
*/

type LinkSegment = {
  source: any,
  target: any,
}


type Selection = {
  append: any => Selection,
  attr: (string, ?string | ?number | ?Function) => Selection,
  call: (Function | Selection) => Selection,
  classed: (string, bool | Function) => Selection,
  data: (Array<any>, ?(any => any)) => Selection,
  duration: number => Selection,
  ease: number => Selection,
  enter: () => Selection,
  exit: () => Selection,
  filter: Function => Selection,
  remove: () => Selection,
  select: string => Selection,
  selectAll: string => Selection,
  style: (string, string) => Selection,
  text: (string | Function) => Selection,
  transition: () => Selection,
}

type D3Scale<D, R> = {|
  (D): D,
  domain: Array<D> => void,
  range: R => void,
|}

type ForceSimulation = {|
  alpha: (?number) => number,
  force: (string, any) => ForceSimulation,
  nodes: Array<InvisibleNode | PersonNode> => ForceSimulation,
  restart: () => void,
  on: (string, () => void) => ForceSimulation,
|}

type LinkForces = {
  links: Array<LinkSegment> => LinkForces,
  strength: number => LinkForces,
}


type InvisibleNode = {
  type: 'InvisibleNode',
  x: number,
  y: number,
  vx: number,
  vy: number,
  getId: () => string,
}

type PersonNode = {
  type: 'PersonNode',
  x: number,
  y: number,
  vx: number,
  vy: number,
  person: PersonAbstract | PersonDetail,
  getId: () => string,
}


type TLink = {
  source: PersonNode,
  middle: InvisibleNode,
  target: PersonNode,
}


class TGraph {
  nodes: { [SubjectId]: InvisibleNode | PersonNode }
  links: Array<TLink>
  focus: PersonNode

  constructor(focus: PersonDetail) {
    this.nodes = {}
    this.links = []

    this.setFocus(focus)
  }

  setFocus(person: PersonDetail): PersonNode {
    const node = this.addPerson(person)
    this.focus = node && node.type === 'PersonNode' ? node : this.focus
    return node
  }

  addNode(pn: PersonNode): void {
    this.nodes[pn.getId()] = pn
  }

  addPerson(person: PersonAbstract | PersonDetail): PersonNode {
    const p = this.nodes[person.id]
    if (p != null && p.type === 'PersonNode' && p.person.type === person.type) {
      return p
    }

    const node = {
      type: 'PersonNode',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      person,
      getId: () => person.id,
    }
    this.addNode(node)
    return node
  }

  removeNode(person: SubjectId | PersonAbstract | PersonDetail | PersonNode): void {
  }

  createLink(source: PersonAbstract | PersonDetail, target: PersonAbstract | PersonDetail): TLink {
    const sourceNode = this.addPerson(source)
    const targetNode = this.addPerson(target)
    const middle = {
      type: 'InvisibleNode',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      getId: () => `${source.id} - ${target.id}`
    }
    const link = { source: sourceNode, middle: middle, target: targetNode }

    this.nodes[middle.getId()] = middle
    this.links.push(link)
    return link
  }

  getNodes(): Array<InvisibleNode | PersonNode> {
    return fp.values(this.nodes)
  }

  getVisibleNodes(): Array<PersonNode> {
    return fp.filter(n => n.type === 'PersonNode')(fp.values(this.nodes))
  }

  getLinks(): Array<TLink> {
    return this.links
  }

  getLinkSegments(): Array<LinkSegment> {
    return fp.flatten(fp.map(link => [
      { source: link.source, target: link.middle },
      { source: link.middle, target: link.target },
    ])(this.links))
  }
}


/*
class TNode {
  id: SubjectId
  x: number
  y: number
  vx: number
  vy: number
  middle: bool

  constructor(id: string, middle: bool, location: ?Location) {
    this.id = id
    this.x = location != null ? location.x : 0
    this.y = location != null ? location.y : 0
    this.vx = 0
    this.vy = 0
    this.middle = middle
  }

  getId(): SubjectId {
    return this.id
  }

  isMiddle(): bool {
    return this.middle
  }

  attach(contents: Selection) {
    this.contents = contents
  }

  remove() {
    if (this.contents) {
      this.contents.remove()
    }
  }
}


class TLink {
  source: TNode
  middle: TNode
  target: TNode

  path: ?Selection

  constructor(source: TNode, middle: TNode, target: TNode, path: ?Selection) {
    this.source = source
    this.middle = middle
    this.target = target
    this.path = path
  }

  attach(path: Selection) {
    this.path = path
  }

  remove() {
    if (this.path != null) {
      this.path.remove()
    }
  }
}


class TGraph {
  nodes: { [string]: TNode }
  links: Array<TLink>

  constructor() {
    this.nodes = {}
    this.links = []
  }

  getNodes(): Array<TNode> {
    return (((Object.values(this.nodes)): any): Array<TNode>)
  }

  getLinkSegments(): Array<D3Link> {
    return fp.flatten(
      fp.map(
        l => [{source: l.source, target: l.middle}, {source: l.middle, target: l.target}])
      (this.links)
    )
  }

  getLinks(): Array<TLink> {
    return this.links
  }

  addNode(node: TNode): TNode {
    this.nodes[node.getId()] = node
    return node
  }

  removeNode(node: TNode): void {
    delete this.nodes[node.getId()]
    node.remove()
    for (let i = 0; i < this.links.length; i += 1) {
      const elem = this.links[i]
      if (elem.source === node) {
        this.links[i].remove()
        elem.source.remove()
        delete this.nodes[elem.source.getId()]
        delete this.nodes[elem.middle.getId()]
        delete this.links[i]
      } else if (elem.target === node) {
        this.links[i].remove()
        elem.target.remove()
        delete this.nodes[elem.target.getId()]
        delete this.nodes[elem.middle.getId()]
        delete this.links[i]
      }
    }
  }

  createNode(id: string, contents: ?Selection, middle: bool, location: Location): TNode {
    return this.addNode(new TNode(id, contents, middle, location))
  }

  createLink(source: TNode, target: TNode): TLink {
    const midNode = this.createNode(
      `${source.getId()}-${target.getId()}`,
      null,
      true,
      { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 },
    )

    this.addNode(source)
    this.addNode(midNode)
    this.addNode(target)
    const link = new TLink(source, midNode, target)
    this.links.push(link)
    return link
  }
}
*/


type Dimensions = { width: number, height: number }


/*
const translateSelection = (n: Selection, destination: Location): void => {
  n.attr('transform', `translate(${destination.x}, ${destination.y})`)
}

const scaleSelection = (n: Selection, scale: number): void => {
  n.select('.scale')
    .attr('transform', `scale(${scale})`)
}
*/


/* A timeline class represents the time-based axis that appears somewhere
 * towards the bottom of the page.
 */
type Timeline = { scale: D3Scale<moment, number>, axis: Selection }

const createTimeline = (width: number, startDate: moment, endDate: moment): Timeline => {
  const scale = d3.scaleTime()
    .range([0, width - 1])
    .domain([startDate, endDate])

  const axis = d3.axisBottom(scale)
    .ticks(10)

  return { scale, axis }
}


d3.selectAll('p').attr('href', 'abcd')


const renderPeople = (sel: Selection) => {
  const circle = sel.append('g')
  const canvas = circle.classed('translate', true)
    .attr('id', node => node.person.id)
    .append('g')
    .classed('scale', true)
    .attr('clip-path', 'url(#image-clip)')

  canvas.append('image')
    .attr('href', node => (node.person.thumbnail ? node.person.thumbnail : ''))
    .attr('preserveAspectRatio', 'xMidYMin slice')
    .attr('height', IMAGE_SIZE)
    .attr('width', IMAGE_SIZE)
    .attr('x', -IMAGE_SIZE / 2)
    .attr('y', -IMAGE_SIZE / 2)

  canvas.append('path')
    .attr('class', 'banner')
    .attr('style', 'stroke-width: 25;')
    .attr('d', populate_path(
      'M X0 Y0 L X1 Y1',
      [{ x: -BANNER_X, y: BANNER_Y },
        { x: +BANNER_X, y: BANNER_Y }],
    ))

  canvas.append('text')
    .attr('class', 'name')
    .attr('text-anchor', 'middle')
    .attr('y', BANNER_Y)
    .attr('dy', '0.3em')
    .text(node => node.person.id)

  return circle
}


const calculateNodeScale = (node: PersonNode, centerNode: PersonNode, isMouseOver: bool): number =>
  (node.getId() === centerNode.getId() || isMouseOver ? 1.0 : 0.5)

const calculateLinkPath = (link: TLink, center: PersonNode): string => {
  const s = link.source
  const m = link.middle
  const t = link.target

  const angle = angleRadians(t, m)
  const nodeRadius = ((IMAGE_SIZE / 2) * calculateNodeScale(t, center, false)) + ARROW_WIDTH

  const tip = radial(t, nodeRadius, angle)
  const left = radial(tip, 20, angle + HEAD_ANGLE)
  const right = radial(tip, 20, angle - HEAD_ANGLE)

  return populate_path(
    'M X0 Y0 Q X1 Y1 X2 Y2 M X3 Y3 L X4 Y4 L X5 Y5',
    [s, m, tip, left, tip, right],
  )
}


const renderLinks = (container: Selection, graph: TGraph): Selection => {
  const path = container.append('path')

  path.classed('link', true)
    .classed('from', (link: TLink): bool => link.source.getId() === graph.focus.getId())
    .classed('to', (link: TLink): bool => link.target.getId() === graph.focus.getId())
    .style('stroke-width', ARROW_WIDTH)
    .attr('visibity', 'visible')
    .attr('d', (link: TLink): string => calculateLinkPath(link, graph.focus))
    .attr('id', (link: TLink): string => `${link.source.getId()}-${link.target.getId()}`)

  return path
}


const calculateLifelinePath = (dimensions: Dimensions, timeline: Timeline, node: PersonNode): string => {
  const TIMELINE_UPSET = 50

  const death = node.person.deathDate ? node.person.deathDate : moment()

  const birthPx = { x: timeline.scale(node.person.birthDate), y: TIMELINE_Y(dimensions.height) }
  const bc1 = { x: node.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }
  const bc2 = { x: birthPx.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }

  const deathPx = { x: timeline.scale(death), y: TIMELINE_Y(dimensions.height) }
  const dc1 = { x: deathPx.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }
  const dc2 = { x: node.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }

  return populate_path(
    'M X0 Y0 C X1 Y1 X2 Y2 X3 Y3 L X4 Y4 C X5 Y5 X6 Y6 X7 Y7', [node, bc1, bc2, birthPx, deathPx, dc1, dc2, node])
}


const renderLifelines = (container: Selection, dimensions: Dimensions, timeline: Timeline): Selection => {
  const path = container.append('path')

  path.classed('timeline', true)
    .attr('style', 'opacity: 0.03;')
    .attr('d', (node: PersonNode): string => calculateLifelinePath(dimensions, timeline, node))

  return path
}


const listOfPeopleInGraph = (
  graph: TGraph,
  people: PeopleCache,
): Array<PersonAbstract | PersonDetail> => {
  return fp.filter(p => p != null)(fp.map(node => people[node.getId()])(graph.nodes))
}


const calculateTimeRange = (people: Array<PersonAbstract | PersonDetail>): [moment, moment] => {
  let minDate = null
  let maxDate = null

  people.forEach((p) => {
    const dob = p.birthDate ? p.birthDate : null
    if (dob != null) {
      if (minDate === null || dob < minDate) {
        minDate = dob
      }
      if (maxDate === null || dob > maxDate) {
        maxDate = dob
      }
    }

    const dod = p.deathDate ? p.deathDate : null
    if (dod != null) {
      if (minDate === null || dod < minDate) {
        minDate = dod
      }
      if (maxDate === null || dod > maxDate) {
        maxDate = dod
      }
    }
  })

  if (minDate != null && maxDate != null) {
    return [minDate, maxDate]
  } else if (minDate === null && maxDate != null) {
    minDate = moment.clone(maxDate).year(maxDate.year() - 100)
    return [minDate, maxDate]
  } else if (minDate != null && maxDate === null) {
    maxDate = moment.clone(minDate).year(minDate.year() + 100)
    return [minDate, maxDate]
  }

  minDate = moment('1900-01-01')
  maxDate = moment()
  return [minDate, maxDate]
}


/*
const timelinePath = (
  dimensions: Dimensions,
  timeline: Timeline,
  person: PersonDetail,
  node: { x: number, y: number },
) => {
  const TIMELINE_UPSET = 50

  const birth = { x: timeline.scale(person.birthDate), y: TIMELINE_Y(dimensions.height) }
  const bc1 = { x: node.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }
  const bc2 = { x: birth.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }
  const death = { x: timeline.scale(person.deathDate), y: TIMELINE_Y(dimensions.height) }
  const dc1 = { x: death.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }
  const dc2 = { x: node.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET }

  return populate_path(
    'M X0 Y0 C X1 Y1 X2 Y2 X3 Y3 L X4 Y4 C X5 Y5 X6 Y6 X7 Y7', [node, bc1, bc2, birth, death, dc1, dc2, node])
}
*/


function limitScreenNodes(graph, centerPerson) {
  var nodes = graph.getNodes();
  if (nodes.length > MAX_SCREEN_NODES) {

    // this overly simple algorithm sorts nodes by influence score and keeps
    // only those with the highest scores.  it would probably be better to represent
    // influencers and influencies proportionally.

    nodes.sort(function(a, b) {return b.getProperty('score') - a.getProperty('score');});
    nodes.forEach(function(node, i) {
      if (i >= MAX_SCREEN_NODES && node != centerPerson) {
        graph.removeNode(node);
      }
    });
  }
}

function scaleElement(element, scale, duration, ease) {
  var te = element
    .transition()
    .style('transform', 'scale(' + scale + ')')
    .style('-o-transform', 'scale(' + scale + ')')
    .style('-ms-transform', 'scale(' + scale + ')')
    .style('-moz-transform', 'scale(' + scale + ')')
    .style('-webkit-transform', 'scale(' + scale + ')');

  if (ease !== undefined) te.ease(ease);
  if (duration !== undefined) te.duration(duration);
}

function setWikiConnectButtonVisibility(visible) {
  var wc = d3.select('#wikiconnect');
  if (visible) {
    scaleElement(wc, 1, DEFAULT_DURATION, STOCK_EASE);
  } else {
    scaleElement(wc, 0, DEFAULT_DURATION);
  }
}

function wcMouseEvent(over) {
  var wc = d3.select('#wikiconnect');
  scaleElement(wc, over ? 1.2 : 1, DEFAULT_DURATION, STOCK_EASE);
}


/*
function updateTimeline(timelineScale: any, timelineAxis: any, width: number, startDate: Date, endDate: Date) {
  timelineScale.domain([minDate, maxDate]);
  timelineScale.domain([
    timelineScale.invert(timelineScale.range()[0] - TIMELINE_MARGIN),
    timelineScale.invert(timelineScale.range()[1] + TIMELINE_MARGIN)
  ]);

  // transition in the new scale

  d3elem.transition()
    .duration(2000)
    .select('.axis')
    .call(timelineAxis);
}
*/

/*
const createNodeFromPerson = (container: Selection, graph: TGraph, person: PersonAbstract | PersonDetail, location: Location): TNode =>
  graph.createNode(person.id, renderPersonIcon(container, person).circle, false, location)

const createNodes = (
  container: Selection,
  location: Location,
  graph: TGraph,
  people: PeopleCache,
): (Array<SubjectId> => Array<TNode>) => fp.compose([
  fp.map(person => createNodeFromPerson(container, graph, person, location)),
  fp.filter(person => person != null),
  fp.map(name => people[name]),
])

const createInfluenceGraph = (
  linksContainer: Selection,
  nodesContainer: Selection,
  dimensions: Dimensions,
  subjectId: SubjectId,
  people: PeopleCache,
): { centerNode: ?TNode, graph: TGraph } => {
  const graph = new TGraph()

  const person = people[subjectId]
  if (person != null && person.type === 'PersonDetail') {
    const subjectNode = createNodeFromPerson(nodesContainer, graph, person, { x: dimensions.width / 2, y: dimensions.height / 2 })

    createNodes(nodesContainer, { x: 0, y: dimensions.height / 2 }, graph, people)(person.influencedBy).forEach(n => graph.createLink(n, subjectNode))
    createNodes(nodesContainer, { x: dimensions.width, y: dimensions.height / 2 }, graph, people)(person.influenced).forEach(n => graph.createLink(subjectNode, n))

    graph.links.forEach((l) => {
      //const path = renderLink(linksContainer, subjectNode, l)
      //l.attach(path)
    })
    return { centerNode: subjectNode, graph }
  }


  return { centerNode: null, graph }
}
*/


const createInfluenceGraph = (focus: PersonDetail, people: PeopleCache): TGraph => {
  const graph = new TGraph(focus)
  return graph
  /*
  const createNodes = (): (Array<SubjectId> => Array<PersonAbstract | PersonDetail>) => fp.compose([
    fp.filter(person => person != null),
    fp.map(name => people[name]),
  ])

  const graph = new TGraph(focus)
  fp.map(p => graph.createLink(p, focus))(createNodes()(focus.influencedBy))
  fp.map(p => graph.createLink(focus, p))(createNodes()(focus.influenced))
  return graph
  */
}


const updateInfluenceGraph = (graph: TGraph, focus: PersonDetail, people: PeopleCache) => {
  const influencedBy = new Set(focus.influencedBy)
  const influenced = new Set(focus.influenced)
  const currentIds = union(new Set([focus.id]), influencedBy, influenced)
  const currentPeople = new Set(fp.compose(
    fp.filter(p => p != null),
    fp.map(id => people[id]),
  )(Array.from(currentIds.values())))
  const oldPeople = new Set(fp.map(n => n.person)(graph.getVisibleNodes()))

  const incomingPeople = difference(currentPeople, oldPeople)
  const outgoingPeople = difference(oldPeople, currentPeople)

  graph.setFocus(focus)
  incomingPeople.forEach((p) => {
    graph.addPerson(p)
    if (influencedBy.has(p.id)) {
      graph.createLink(p, focus)
    } else {
      graph.createLink(focus, p)
    }
  })
}


/*
const updateInfluenceGraph = (
  linksContainer: Selection,
  nodesContainer: Selection,
  dimensions: Dimensions,
  graph: TGraph,
  subjectId: SubjectId,
  people: PeopleCache,
): ?TNode => {
  const subject = people[subjectId]

  if (subject != null && subject.type === 'PersonDetail') {
    let subjectNode = graph.nodes[subjectId]
    const necessaryNodeIds = [subjectId].concat(subject.influencedBy, subject.influenced)
    const presentNodeIds = fp.map(n => n.getId())(graph.getNodes())
    const nodeIds = presentNodeIds.concat(necessaryNodeIds)

    if (!subjectNode) {
      subjectNode = graph.createNode(subjectId, renderPersonIcon(nodesContainer, subject).circle, false, { x: dimensions.width / 2, y: dimensions.height / 2 })
    }

    nodeIds.forEach((nid) => {
      const person = people[nid]
      let personNode = graph.nodes[nid]

      if (person != null) {
        if (necessaryNodeIds.includes(nid) && personNode != null) {
        } else if (necessaryNodeIds.includes(nid) && !personNode) {
          if (subject.influencedBy.includes(nid)) {
            personNode = createNodeFromPerson(nodesContainer, graph, person, { x: 0, y: dimensions.height / 2 })
            const link = graph.createLink(personNode, subjectNode)
          } else {
            personNode = createNodeFromPerson(nodesContainer, graph, person, { x: dimensions.width, y: dimensions.height / 2 })
            const link = graph.createLink(subjectNode, personNode)
            link.attach(renderLink(linksContainer, subjectNode, link))
          }
        } else if (!necessaryNodeIds.includes(nid) && personNode != null) {
          graph.removeNode(personNode)
        } else {
        }
      }
    })
  }

  return graph.nodes[subjectId]
}
*/


class InfluenceCanvas {
  topElem: Selection
  definitions: Selection
  nodesElem: Selection
  linksElem: Selection
  lifelinesElem: Selection
  dimensions: Dimensions

  focusedId: ?SubjectId
  people: PeopleCache
  timeline: Timeline

  graph: ?TGraph

  timelineAxis: Selection
  fdl: ForceSimulation
  fdlLinks: LinkForces

  constructor(
    topElem: Selection,
    dimensions: Dimensions,
    focusedId: SubjectId,
    people: PeopleCache,
  ) {
    this.topElem = topElem
    this.dimensions = dimensions
    this.focusedId = focusedId
    this.people = people

    const focus = this.people[focusedId]
    if (focus != null && focus.type === 'PersonDetail') {
      this.setup(focus)
    }

    // create clip path for image
    this.definitions = this.topElem.append('defs')
    
    this.definitions.append('svg:clipPath')
      .attr('id', 'image-clip')
      .append('svg:circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', IMAGE_SIZE / 2)

    /* I've put these here so that I can force them to be rendered in a
     * particular order. If all of the links appear in one container, and all
     * of the nodes appear in another container, and the nodes container comes
     * after the links container, this makes the nodes render atop the links.
     */
    this.lifelinesElem = this.topElem.append('g').classed('timelines', true)
    this.linksElem = this.topElem.append('g').classed('links', true)
    this.nodesElem = this.topElem.append('g').classed('nodes', true)

    if (! this.graph) {
      this.timeline = createTimeline(dimensions.width, moment('1900-01-01'), moment())

      this.timelineAxis = topElem
        .append('g')
        .classed('axies', true)
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${TIMELINE_Y(dimensions.height)})`)
        .call(this.timeline.axis)
    }
  }

  setup(focus: PersonDetail): void {
    const graph = createInfluenceGraph(focus, this.people)
    const [minYear, maxYear] = calculateTimeRange(listOfPeopleInGraph(graph, this.people))

    this.timeline = createTimeline(this.dimensions.width, minYear, maxYear)
    this.graph = graph
    this.timelineAxis.call(this.timeline.axis)
    this.fdl = d3.forceSimulation()
    this.fdlLinks = d3.forceLink()
      .strength(LINK_STRENGTH)
      .distance(() => (Math.random() * LINK_RANDOM) + ((NODE_SIZE / 2) + LINK_MIN_OFFSET))

    this.fdl
      .force('center', d3.forceCenter(this.dimensions.width / 2, this.dimensions.height / 2))
      .force('gravity', d3.forceManyBody().strength(GRAVITY))
      .force('charge', d3.forceManyBody().strength((d: InvisibleNode | PersonNode): number => {
        return d.type === 'InvisibleNode'
          ? -CHARGE_HIDDEN
          : -((Math.random() * CHARGE_RANDOM) + CHARGE_BASE)
      }))
      .force('links', this.fdlLinks)

    this.fdl.on('tick', () => {
        if (this.graph != null) this.animate(this.graph)
      })
  }

  animate(graph: TGraph): void {
    const { width, height } = this.dimensions
    const k = 0.5 * this.fdl.alpha()
    const k2 = 15 * this.fdl.alpha()

    graph.focus.x = width / 2
    graph.focus.y = height / 2

    graph.getLinks().forEach((link) => {
      if (link.source === graph.focus) {
        link.target.x += k2
      } else if (link.target === graph.focus) {
        link.source.x -= k2
      }
    })

    const [minX, minY] = [MARGIN, MARGIN]
    const [maxX, maxY] = [width - MARGIN, height - MARGIN]

    this.nodesElem
      .selectAll('.translate')
      .attr('transform', n => {
        n.x = largest(minX, smallest(maxX, n.x))
        n.y = largest(minY, smallest(maxY, n.y))
        return `translate(${n.x}, ${n.y})`
      })

    this.linksElem.selectAll('path')
      .attr('d', (link: TLink): string => calculateLinkPath(link, graph.focus))

    this.lifelinesElem.selectAll('path')
      .attr('d', (node: PersonNode): string => calculateLifelinePath(this.dimensions, this.timeline,  node))
  }

  setDimensions(dimensions: Dimensions) {
    this.dimensions = dimensions

    // calculateTimeRange here
    this.timeline.scale.range(dimensions.width)
    this.timelineAxis.transition()
      .duration(DEFAULT_ANIMATION_DURATION)
      .attr('transform', `translate(0, ${TIMELINE_Y(dimensions.height)})`)
      .call(this.timeline.axis)

    this.fdl.alpha(2)
    this.fdl.restart()
  }

  setFocused(focusedId: SubjectId, people: PeopleCache) {
    this.focusedId = focusedId
    this.people = people

    const newFocus = people[focusedId]

    /* trigger animations to update the center */
    if (newFocus != null && newFocus.type === 'PersonDetail') {
      if (!this.graph) {
        this.setup(newFocus)
      } else {
        updateInfluenceGraph(this.graph, newFocus, people)
      }
    }

    if (this.graph != null && this.fdl != null) {
      this.updateCanvas(this.graph, this.fdl, this.fdlLinks)
    }
  }

  updateCanvas(graph: TGraph, fdl: ForceSimulation, fdlLinks: LinkForces) {
    const [minYear, maxYear] = calculateTimeRange(listOfPeopleInGraph(graph, this.people))
    this.timeline.scale.domain([minYear, maxYear])
    this.timelineAxis.transition()
      .duration(DEFAULT_ANIMATION_DURATION)
      .attr('transform', `translate(0, ${TIMELINE_Y(this.dimensions.height)})`)
      .call(this.timeline.axis)

    fdl.nodes(graph.getNodes())
    fdlLinks.links(graph.getLinkSegments())

    const nodeSel = this.nodesElem
      .selectAll('.translate')
      .data(graph.getVisibleNodes(), n => (n ? n.getId() : null))
    renderPeople(nodeSel.enter())
    nodeSel.exit().remove()

    this.nodesElem
      .selectAll('.scale')
      .attr('transform', d => (d.getId() === graph.focus.getId() ? 'scale(1.0)' : 'scale(0.5)'))

    const linkSel = this.linksElem.selectAll('path')
      .data(graph.getLinks())
    renderLinks(linkSel.enter(), graph)
    linkSel.exit().remove()

    const lifespanSel = this.lifelinesElem.selectAll('path')
      .data(graph.getVisibleNodes(), n => (n ? n.getId() : null))
    renderLifelines(lifespanSel.enter(), this.dimensions, this.timeline)
    lifespanSel.exit().remove()
  }
}


type InfluenceChartProps = {
  label: string,
  focusedId: SubjectId,
  people: PeopleCache,
}

type InfluenceChartState = {
  domElem: ?HTMLElement,
  d3Elem: ?Selection,
  canvas: ?InfluenceCanvas,
  focusedId: ?SubjectId,
}

class InfluenceChart_ extends React.Component<InfluenceChartProps, InfluenceChartState> {
  static getDerivedStateFromProps(
    newProps: InfluenceChartProps,
    prevState: InfluenceChartState,
  ): InfluenceChartState {
    const { focusedId } = newProps
    if (focusedId != null) {
      if (prevState.canvas != null) {
        prevState.canvas.setFocused(focusedId, newProps.people)
      }
      return { ...prevState, focusedId }
    }
    return prevState
  }

  constructor(props: InfluenceChartProps) {
    super(props)

    /*
    this.state = InfluenceChart_.getDerivedStateFromProps(props, {
      domElem: null,
      d3Elem: null,
      canvas: null,
    })
    */
    this.state = {
      domElem: null,
      d3Elem: null,
      canvas: null,
      focusedId: null
    }
  }

  componentDidMount() {
    this.state.domElem = document.getElementById(this.props.label)
    this.state.d3Elem = d3.select(`#${this.props.label}`)

    if (this.state.domElem != null && this.state.d3Elem != null) {
      this.state.canvas = new InfluenceCanvas(
        this.state.d3Elem,
        this.state.domElem.getBoundingClientRect(),
        this.props.focusedId,
        this.props.people,
      )
    }

    window.addEventListener('resize', () => {
      if (this.state.domElem != null && this.state.canvas != null) {
        const { domElem } = this.state
        this.state.canvas.setDimensions(domElem.getBoundingClientRect())
        this.forceUpdate()
      }
    })
  }

  /*
  renderCanvas() {
    if (this.state.domElem != null && this.state.d3Elem != null && this.state.canvas != null) {
      const { domElem, d3Elem, canvas } = this.state
      console.log('[InfluenceChart_.renderCanvas] rendering')

      const dimensions = domElem.getBoundingClientRect()
      const person = this.props.people[this.props.focusedId]
      if (person != null && person.type === 'PersonDetail') {
        canvas.render(dimensions, person, this.props.people, this.state.graph)
      }
    } // TODO: what should I do if the nodes aren't found?
  }
  */

  render() {
    //this.renderCanvas()
    return React.createElement('svg', { id: `${this.props.label}`, style: { height: '100%', width: '100%' } }, [])
  }
}

const InfluenceChart = connect(
  state => ({
    focusedId: store.focusedSubject(state),
    people: store.people(state),
  }),
  dispatch => ({}),
)(InfluenceChart_)


export default InfluenceChart

