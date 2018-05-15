// @flow

import React from 'react'
import { connect } from 'react-redux'
import { type SubjectId, type PersonAbstract, type PersonDetail } from '../../types'
import { type PeopleCache } from '../../store'

const { TGraph, TLink, TNode } = require('../../tgraph')

const d3 = require('d3')
const $ = require('jquery')
const _ = require('lodash')

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
  LINK_STRENGHT,
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
let nextMidId = 0
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


type Dimensions = { width: number, height: number }


/* A timeline class represents the time-based axis that appears somewhere
 * towards the bottom of the page.
 */
type Timeline = { scale: any, axis: any }

const createTimeline = (width: number, startDate: Date, endDate: Date): Timeline => {
  const scale = d3.scaleTime()
    .range([0, width - 1])
    .domain([startDate, endDate])

  const axis = d3.axisBottom(scale)
    .ticks(10)

  return { scale, axis }
}


type PersonIcon = { circle: any }

const createPersonIcon = (container: any, person: string): PersonIcon => {
  const circle = container
    .append('svg:circle')
    .attr('r', IMAGE_SIZE / 2 + 10)
    .append('svg:clipPath')
    .append('svg:circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', IMAGE_SIZE / 2)

  return { circle }
}


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

const renderChart = (svg: HTMLElement, d3elem: any, dimensions: { width: number, height: number }, centerNode: TNode, graph: TGraph) => {
  console.log('[renderChart svg]', svg)
  console.log('[renderChart d3elem]', d3elem)
  console.log('[renderChart centerNode]', JSON.stringify(centerNode))
  console.log('[renderChart centerNode]', centerNode)
  console.log('[renderChart graph]', graph)
  console.log('[renderChart dimensions]', dimensions)
  const defs = d3elem.append('defs')


  defs.append('svg:linearGradient')
    .attr('id', 'loading-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .call(function(gradient) {
      gradient.append('svg:stop')
        .attr('offset', '0%')
        .style('stop-color', 'white')
        .style('stop-opacity', '1');
      gradient.append('svg:stop')
        .attr('offset', '50%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
      gradient.append('svg:stop')
        .attr('offset', '100%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
    });

  defs.append('svg:linearGradient')
    .attr('id', 'image-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .call(function(gradient) {
      gradient.append('svg:stop')
        .attr('offset', '0%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
      gradient.append('svg:stop')
        .attr('offset', '10%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
      gradient.append('svg:stop')
        .attr('offset', '15%')
        .style('stop-color', 'white')
        .style('stop-opacity', '1');
      gradient.append('svg:stop')
        .attr('offset', '85%')
        .style('stop-color', 'white')
        .style('stop-opacity', '1');
      gradient.append('svg:stop')
        .attr('offset', '90%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
      gradient.append('svg:stop')
        .attr('offset', '100%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
    });

  defs.append('mask')
    .attr('id', 'image-mask')
    .append('rect')
    .attr('x', IMAGE_SIZE / -2)
    .attr('y', IMAGE_SIZE / -2)
    .attr('width', IMAGE_SIZE)
    .attr('height', IMAGE_SIZE)
    .style('fill', 'url(#image-gradient)');

  defs.append('svg:clipPath')
    .attr('id', 'loading-clip')
    .append('svg:circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', IMAGE_SIZE / 2 + 10);

  // create path for names
  defs.append('path')
    .attr('id', 'namepath')
    .attr('d', function() {
      var r = (NODE_SIZE - BANNER_SIZE) / 2;
      return 'M 0 ' + (-r) + ' a ' + r + ' ' + r + ' 0 1 0 0.01 0 Z';
    });

  defs.append('path')
    .attr('id', 'bannerpath')
    .attr('d', populate_path(
      'M X0 Y0 L X1 Y1',
      [{x: -BANNER_X, y: BANNER_Y},
       {x: +BANNER_X, y: BANNER_Y}]));

  // create path for titles
  defs.append('path')
    .attr('id', 'titlepath')
    .attr('d', function() {
      var inset = 60;
      var len = 550;
      var curve = 130;
      return populate_path(
        'M X0 Y0 L X1 Y1 A X2 Y2 0 0 1 X3 Y3 L X4 Y4', [
          {x: inset, y: len},
          {x: inset, y: inset + curve},
          {x: curve, y: curve},
          {x: inset + curve, y: inset},
          {x: len, y: inset},
        ]);
    });

  d3elem.append('text')
    .classed('loading', true)
    .attr('x', dimensions.width / 2)
    .attr('y', dimensions.height / 2)
    .attr('text-anchor', 'middle')
    .text('Loading...');

  d3elem.append('text')
    .classed('nodata', true)
    .attr('visibility', 'hidden')
    .attr('x', dimensions.width / 2)
    .attr('y', dimensions.height / 2)
    .attr('text-anchor', 'middle')
    .text('No Data.');

  // add groups for links and nodes
  const timelinesGroup = d3elem.append('g').classed('timelines', true);
  const linkGroup = d3elem.append('g').classed('links', true);
  const nodeGroup = d3elem
    .append('g')
    .classed('nodes', true)
    .attr('height', dimensions.height)
    .attr('width', dimensions.width)
    
  const axiesGroup = d3elem
    .append('g')
    .attr('transform', 'translate(0, ' + TIMELINE_Y(dimensions.height) + ')')
    .classed('axies', true)
    .attr('class', 'axis');

  // setup the axes
  const timeline = createTimeline(dimensions.width,
    new Date(1900, 12, 15),
    new Date())

  axiesGroup.call(timeline.axis);

  // create the fdl instance
  const force = d3.layout.force()
    .gravity(GRAVITY)
    .linkStrength(LINK_STRENGHT)
    .charge(function(d) {
      return d.getProperty('hidden')
        ? -CHARGE_HIDDEN
        : -(Math.random() * CHARGE_RANDOM + CHARGE_BASE);})
    .linkDistance(function(link) {
      var base = LINK_BASE;

      if (link.source == centerNode || link.target == centerNode)
        base = NODE_SIZE / 2 + LINK_MIN_OFFSET;
      else
        base = NODE_SIZE / 4 + LINK_MIN_OFFSET;

      return Math.random() * LINK_RANDOM + base;})
    .size([dimensions.width, dimensions.height]);

  /* TODO: hopefully remove, trying to see if this can be handled at the react level
  // handle window resize
  d3.select(window)
    .on('resize', _.debounce(function() {
      const { width, height } = getViewportDimensions()

      d3elem.attr('height', height)
        .attr('width', width)
      
      nodeGroup
        .attr('height', height)
        .attr('width', width)
     
      timelineScale.range([ 0, width - 1 ])

      timelineAxis = d3.svg.axis()
        .scale(timelineScale)
        .tickSize(-20, -10, 0)
        .tickSubdivide(true)
      
      force
        .size([ width, height ])
        .start()

      axiesGroup
        .attr('transform', 'translate(0, ' + TIMELINE_Y() + ')')
        .call(timelineAxis)
    }), 400)
    */

  return [force, timeline, linkGroup, timelinesGroup, nodeGroup]
}

const drawInfluence = (svg: HTMLElement, d3elem: any, dimensions: { width: number, height: number }, centerNode: TNode, graph: TGraph, people: PeopleCache) => {
  console.log('[drawInfluence]')
  
  d3elem.attr('height', dimensions.height)
      .attr('width', dimensions.width)
  const [force, timeline, linkGroup, timelinesGroup, nodeGroup] =
    renderChart(svg, d3elem, dimensions, centerNode, graph)
  d3elem.selectAll('text.static-text').transition().duration(2000).style('fill', '#bbb')
  d3elem.selectAll('text.loading').transition().style('fill', 'white').remove()

   updateChart(dimensions, graph, centerNode)

  function updateChart(dimensions: { width: number, height: number }, graph: TGraph, centerNode: TNode) {
    var physicalNodes = []
    var minDate = null
    var maxDate = null

    console.log('[updateChart]')

    var sampleDate = function(date) {
      if (minDate == null || date < minDate)
        minDate = date;
      if (maxDate == null || date > maxDate)
        maxDate = date;
    };

    /*
    graph.getNodes().forEach(function(physicalNode) {
      physicalNodes.push(physicalNode);
      const person = people[physicalNode.getId()]
      if (person === null || person === undefined) return

      // establish date of birth

      const dobStr = person.birthDate
      let dob = undefined
      if (dobStr !== undefined) {
        dob = parseDate(dobStr)
        physicalNode.setProperty('birthDate', dob);
      }

      // establish date of death

      const dodStr = person.deathDate
      let dod = undefined
      if (dodStr !== undefined) {
        dod = parseDate(dodStr)
        physicalNode.setProperty('deathDate', dod)
      }
      else if (dob != undefined) {
        dod = new Date()
        physicalNode.setProperty('deathDate', dod)
      }

      // establish min max dates

      if (dob !== undefined && dod !== undefined) {
        sampleDate(dod)
        sampleDate(dob)
      }

      force.nodes().forEach(function(oldNode) {
        if (centerNode.getId() == oldNode.getId()) {
          centerNode.px = centerNode.x = oldNode.x
          centerNode.py = centerNode.y = oldNode.y
          centerNode.weight = 0;
        }
        if (physicalNode.getId() == oldNode.getId()) {
          physicalNode.px = physicalNode.x = oldNode.x
          physicalNode.py = physicalNode.y = oldNode.y
        }
      })
    })
    */

    // adjust scale

    if (minDate == null || minDate == undefined) {
      minDate = new Date(1900, 12, 15)
    }
    if (maxDate == null || maxDate == undefined) {
      maxDate = new Date()
    }
    if (minDate > maxDate) {
      const tmp = minDate
      minDate = maxDate
      maxDate = tmp
    }
    // timeline.update(dimensions.width, minDate, maxDate)
    const timeline_ = createTimeline(dimensions.width, minDate, maxDate)
    d3elem.transition()
      .duration(2000)
      .select('.axis')
      .call(timeline.axis)

    /*
    var physicalLinks = [];
    var renderedLinks = [];

    // creat the virtual nodes which are used to create the arrow bend

    graph.getLinks().forEach(function(link) {
      var src = link.getSource();
      var mid = new TNode('mid' + nextMidId++, {isMiddel: true, hidden: true});
      var trg = link.getTarget();

      debugger

      // place the virtual node right between the source and the the target

      mid.px = mid.x = (src.x + trg.x) / 2;
      mid.py = mid.y = (src.y + trg.y) / 2;

      physicalNodes.push(mid);
      physicalLinks.push({source: src, target: mid});
      physicalLinks.push({source: mid, target: trg});
      link.mid = mid;
      renderedLinks.push(link);
    });

    // filter out hidden nodes so they are not rendered

    var renderedNodes = physicalNodes.filter(function(d) {return !d.getProperty('hidden');});

    // create the force directed layout

    force
      .nodes(physicalNodes)
      .links(physicalLinks)
      .start();

    // remove all links, they will all be created from scratch

    linkGroup.selectAll('.link').remove();

    var allLink = linkGroup.selectAll('.link')
      .data(renderedLinks);

    var enterLinks = allLink
      .enter();

    enterLinks
      .append('path')
      .attr('visibility', 'hidden')
      .classed('link', true)
      .classed('to', function(d) {return d.target.getId() == centerNode.getId();})
      .classed('from', function(d) {return d.source.getId() == centerNode.getId();})
      .style('stroke-width', ARROW_WIDTH);
      // .append('title')
      // .text(function(d) {return d.getProperty('type')});

    d3elem.selectAll('path.link')
      .transition()
      .duration(0)
      .delay(DEFAULT_DURATION)
      .attr('visibility', 'visibile');

    // add timeline paths for each node

    timelinesGroup.selectAll('path.timeline')
      .remove();

    timelinesGroup.selectAll('path.timeline')
      .data(renderedNodes)
      .enter()
      .append('path')
      .filter(function(d) {return d.getProperty('birthDate') !== undefined;})
      .classed('timeline', true)
      .style('opacity', 0)
      .transition()
      .duration(2000)
      .style('opacity', function(d) {return d.getId() == centerNode.getId() ? TIMELINE_HIGHLIGHT_OPACITY : TIMELINE_OPACITY;});

    //var exitLinks = allLink.exit().remove();

    var allNodes = nodeGroup.selectAll('.node')
      .data(renderedNodes, function(d) {return d.id;});

    var enterNodes = allNodes.enter();
    var exitNodes = allNodes.exit();

    exitNodes
      .selectAll('.scale')
      .transition()
      .duration(DEFAULT_DURATION)
      .attr('transform', 'scale(0)');

    exitNodes
      .transition()
      .duration(DEFAULT_DURATION)
      .remove();

    console.log('0')
    var nodeGroups = enterNodes
      .append('g')
      .classed('node', true)
      .on('click', onNodeClick)
      .on('mouseover', onNodeMouseOver)
      .on('mouseout', onNodeMouseOut)
      .call(force.drag);
    console.log('1')

    allNodes
      .selectAll('.scale')
      .attr('transform', function(d) {return 'scale(' + computeNodeScale(d, centerNode, false) + ')';});

    var scaleGroups = nodeGroups
      .append('g')
      .attr('clip-path', 'url(#image-clip)')
      .attr('transform', 'scale(0)')
      .classed('scale', true);

    scaleGroups
      .transition()
      .duration(DEFAULT_DURATION)
      .attr('transform', function(d) {return 'scale(' + computeNodeScale(d, centerNode, false) + ')';});

    scaleGroups
      .append('circle')
      .classed('backdrop', true)
      .attr('r', IMAGE_SIZE / 2);

    scaleGroups
      .append('image')
      .attr('pointer-events', 'none')
      .attr('xlink:href', function(d) {

        // create the list of all plausible images in preference order

        var thumbnail = d.getProperty('thumbnail');
        var altThumbnail = thumbnail !== undefined
          ? thumbnail.replace('wikipedia/commons', 'wikipedia/en')
          : undefined;

        var depiction = d.getProperty('depiction');
        var altDepiction = depiction !== undefined
          ? depiction.replace('wikipedia/commons', 'wikipedia/en')
          : undefined;

        d.images = [
          thumbnail,
          altThumbnail,
          depiction,
          altDepiction,
          UNKNOWN_PERSON].filter(function(d) {return d !== undefined;});

        // return first of those images

        return d.images.shift();
      })
      .on('error', function(d) {this.setAttribute('href', d.images.shift());})
      .attr('x', -IMAGE_SIZE / 2)
      .attr('y', -IMAGE_SIZE / 2)
      .attr('preserveAspectRatio', 'xMidYMin slice')
      .attr('width', IMAGE_SIZE)
      .attr('height', IMAGE_SIZE);

    scaleGroups
      .append('path')
      .classed('banner', true)
      .style('stroke-width', BANNER_SIZE)
      .attr('d', populate_path(
        'M X0 Y0 L X1 Y1',
        [{x: -BANNER_X, y: BANNER_Y},
         {x: +BANNER_X, y: BANNER_Y}]));

    scaleGroups
      .append('text')
      .classed('name', true)
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('y', BANNER_Y)
      .attr('dy', '0.3em')
      .text(function(d) { return d.getProperty('name');});

    scaleGroups
      .append('circle')
      .classed('loading-ring', true)
      .attr('fill', 'none')
      .attr('visibility', 'hidden')
      .attr('stroke', 'url(#loading-gradient)')
      .attr('stroke-width', RIM_SIZE)
      .attr('r', (IMAGE_SIZE - RIM_SIZE) / 2 - RIM_SIZE / 2);

    scaleGroups
      .append('g')
      .attr('transform', 'translate(' +
            (IMAGE_SIZE - 2 * WIKI_ICON_WIDTH) / 2 + ', ' +
            WIKI_ICON_WIDTH + ')')
      .append('image')
      .classed('wikibutton', true)
      .attr('xlink:href', WIKI_LOGO)
      .attr('x', -WIKI_ICON_WIDTH / 2)
      .attr('y', -WIKI_ICON_WIDTH / 2)
      .attr('width', WIKI_ICON_WIDTH)
      .attr('height', WIKI_ICON_WIDTH)
      .attr('transform', 'scale(0)')
      .on('mouseover', onWikipediaMouseOver)
      .on('mouseout', onWikipediaMouseOut)
      .on('click', onWikipediaClick)
      .append('title')
      .text('Show Wiki Text');

    force.on('tick', function(event) {
      const { width, height } = dimensions

      var k2 = 15 * event.alpha;
      var k = .5 * event.alpha;
      centerNode.x += (width / 2 - centerNode.x) * k;
      centerNode.y += (height / 2 - centerNode.y) * k;

      d3.selectAll('path.link')
        .each(function(link) {
          if (link.source.getId() == centerNode.getId()) {
            link.target.x += k2;
          }
          if (link.target.getId() == centerNode.getId()) {
            link.source.x -= k2;
          }
        })
        .attr('d', (link) => arrowPath(link, centerNode));
      
      timelinesGroup.selectAll('.timeline')
        .classed('highlight', function(d) {return d.getId() == centerNode.getId();})
        .attr('d', timelinePath);

      var nodes = nodeGroup.selectAll('g.node');

      // Make sure that all nodes remain within the top and bottom edges
      // of the display area
      var min_x = MARGIN;
      var max_x = width - MARGIN;
      var min_y = MARGIN;
      var max_y = height - MARGIN;
      // TODO: max_y should be adjusted to end _above_ the timeline

      nodes.each(function(d) {
        d.x = largest(min_x, smallest(max_x, d.x))
        d.y = largest(min_y, smallest(max_y, d.y))
     });

      // update transform

      nodes.attr('transform', function(d) {
        return populate_path('translate(X0, Y0)', [d]);
      });
    });
    */
  }

  function timelinePath(node) {
    var TIMELINE_UPSET = 50;

    var birth = {x: timeline.scale(node.getProperty('birthDate')), y: TIMELINE_Y(dimensions.height)};
    var bc1 = {x: node.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET};
    var bc2 = {x: birth.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET};
    var death = {x: timeline.scale(node.getProperty('deathDate')), y: TIMELINE_Y(dimensions.height)};
    var dc1 = {x: death.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET};
    var dc2 = {x: node.x, y: TIMELINE_Y(dimensions.height) - TIMELINE_UPSET};

    return populate_path(
      'M X0 Y0 C X1 Y1 X2 Y2 X3 Y3 L X4 Y4 C X5 Y5 X6 Y6 X7 Y7', [node, bc1, bc2, birth, death, dc1, dc2, node]);
  }

  function arrowPath(link: TLink, centerNode: TNode) {
    var s = link.source;
    var m = link.mid;
    var t = link.target;

    var angle = angleRadians(t, m);
    var nodeRadius = (IMAGE_SIZE / 2) * computeNodeScale(t, centerNode, false) + ARROW_WIDTH;

    var tip = radial(t, nodeRadius, angle);
    var left = radial(tip, 20, angle + HEAD_ANGLE);
    var right = radial(tip, 20, angle - HEAD_ANGLE);

    return populate_path('M X0 Y0 Q X1 Y1 X2 Y2 M X3 Y3 L X4 Y4 L X5 Y5',
                         [s, m, tip, left, tip, right]);
  }

  function computeNodeScale(node: TNode, centerNode: TNode, isMouseOver: bool) {
    isMouseOver = isMouseOver || false;
    var scale = 1;

    if (node.getId() == centerNode.getId())
      scale = 1.0;
    else
      scale = 0.5;

    return scale * (isMouseOver ? 2 : 1);
  }

  function scaleNode(node: TNode, centerNode: TNode, isMouseOver: bool) {
    scaleNodeThing(node, 'g.scale', computeNodeScale(node, centerNode, isMouseOver));
  }

  function onNodeMouseOut(node, centerNode) {
    if (d3.event.target.tagName != 'image')
      scaleNodeThing(node, '.wikibutton', 0);

    scaleNode(node, centerNode, false);
    timelinesGroup.selectAll('.timeline')
      .filter(function(d) {
        return d.getId() == node.getId() && d.getId() != centerNode.getId();
      })
      .classed('highlight', false)
      .transition()
      .duration(DEFAULT_DURATION)
      .ease(STOCK_EASE)
      .style('opacity', TIMELINE_OPACITY);
  }

  function onNodeMouseOver(node: TNode, centerNode: TNode) {
    if (d3.event.target.tagName != 'image')
      scaleNodeThing(node, '.wikibutton', 1);

    // move node to top of the stack

    $('g.node').each(function(i, e) {
      if (e.__data__ == node) {
        var $e = $(e);
        var parent = $e.parent();
        $e.remove();
        parent.append($e);
      }
    });

    // scale node

    scaleNode(node, centerNode, true);

    timelinesGroup.selectAll('.timeline')
      .filter(function(d) {return d.getId() == node.getId() && d.getId() != centerNode.getId();})
      .classed('highlight', true)
      .transition()
      .duration(DEFAULT_DURATION)
      .ease(STOCK_EASE)
      .style('opacity', TIMELINE_HIGHLIGHT_OPACITY);
  }

  function onImageClick(node) {
    node.open = !node.open || false;
    if (node.open)
      $('#wikidiv').animate({left: '100px'});
    else
      $('#wikidiv').animate({right: '100px'});
  }

  function onWikipediaMouseOver(node) {
    scaleNodeThing(node, '.wikibutton', 1.5);
  }

  function onWikipediaMouseOut(node) {
    scaleNodeThing(node, '.wikibutton', 1);
  }

  function scaleNodeThing(node, selector, scale) {
    d3elem.selectAll(selector)
      .filter(function(d) {return d.getId() == node.getId();})
      .transition()
      .duration(DEFAULT_DURATION)
      .ease(STOCK_EASE)
      .attr('transform', 'scale(' + scale + ')');
  }

  function onWikipediaClick(node) {
    d3.select(d3.event.target)
      .transition()
      .duration(DEFAULT_DURATION)
      .ease(STOCK_EASE)
      .attr('transform', 'scale(1)');

    var event = d3.event;
    event.stopPropagation();

    window.mediator.getEntry('react', 'setWikiPage')(node);
  }

  function onNodeClick(node) {
    /* TODO: set a command up to redux to change the center */
    /*
    var stopSinner = startSpinner(node);
    querySubject(node.getId(), stopSinner);
    */
  }

  function startSpinner(node) {
    var loadingDuration = 500;
    var stop = false;

    var ring = d3.selectAll('.loading-ring')
      .filter(function(d) {return d.getId() == node.getId();});

    ring
      .attr('visibility', 'visibile')
      .attr('transform', function(d) {return 'rotate(0)';})
      .transition()
      .duration(loadingDuration)
      .ease('linear')
      .attr('transform', function(d) {return 'rotate(120)';})
      .transition()
      .duration(loadingDuration)
      .ease('linear')
      .attr('transform', function(d) {return 'rotate(240)';})
      .transition()
      .duration(loadingDuration)
      .ease('linear')
      .attr('transform', function(d) {return 'rotate(360)';})
      .each('end', function() {
        if (ring.attr('visibility') == 'visibile')
          startSpinner(node);
      });

    // return the function to stop the spinner

    return function() {
      ring.attr('visibility', 'hidden');
    };
  }

}

const createInfluenceGraph = (
  subjectId: SubjectId,
  person: PersonAbstract | PersonDetail
): [TNode, TGraph] => {
  const graph = new TGraph()
  const subjectNode = graph.addNode(subjectId)

  if (person == null) {
    console.log('cannot handle a null person')
  } else if (person.type === 'PersonAbstract') {
    console.log('cannot generate a graph for an abstract person: ', person)
  } else {
    for (let i = 0; i < person.influencedBy.length; i++) {
      let targetNode = graph.addNode(person.influencedBy[i])
      graph.addLink(targetNode, subjectNode)
    }
  }
  return [subjectNode, graph]
}


class InfluenceCanvas {
  topElem: any
  timelineAxis: any
  initialRenderComplete: bool
  centerPerson: string
  center: any

  constructor(topElem, centerPerson: string) {
    this.topElem = topElem
    this.centerPerson = centerPerson

    this.timelineAxis = topElem
      .append('g')
      .classed('axies', true)
      .attr('class', 'axis')

    // create clip path for image
    this.topElem.append('svg:clipPath')
      .attr('id', 'image-clip')
      .append('svg:circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', IMAGE_SIZE / 2);

    this.initialRenderComplete = false
  }

  initialRender(dimensions: Dimensions) {
    const timeline = createTimeline(dimensions.width, new Date(1900, 1, 1), new Date(2000, 1, 1))
    this.timelineAxis
      .attr('transform', `translate(0, ${TIMELINE_Y(dimensions.height)})`)
      .call(timeline.axis)

    this.center = createPersonIcon(this.topElem, this.centerPerson)

    this.initialRenderComplete = true
  }

  render(dimensions: Dimensions) {
    if (!this.initialRenderComplete) {
      this.initialRender(dimensions)
    } else {
      const timeline = createTimeline(dimensions.width, new Date(1900, 1, 1), new Date(2000, 1, 1))
      this.timelineAxis.transition()
        .duration(DEFAULT_ANIMATION_DURATION)
        .attr('transform', `translate(0, ${TIMELINE_Y(dimensions.height)})`)
        .call(timeline.axis)
    }
  }
}


type InfluenceChartProps = {
  label: string,
  subjectId: SubjectId,
  people: PeopleCache
}

type InfluenceChartState = {
  domElem: ?HTMLElement,
  d3Elem: any,
  canvas: ?InfluenceCanvas,
  centerNode: TNode,
  graph: TGraph,
}

class InfluenceChart extends React.Component<InfluenceChartProps, InfluenceChartState> {
  constructor(props: InfluenceChartProps) {
    super(props)

    const [centerNode, graph] = createInfluenceGraph(
      this.props.subjectId,
      this.props.people[this.props.subjectId],
    )

    this.state = {
      domElem: null,
      d3Elem: null,
      canvas: null,
      centerNode: centerNode,
      graph: graph,
    }
  }

  componentDidMount() {
    this.state.domElem = document.getElementById(this.props.label)
    this.state.d3Elem = d3.select(`#${this.props.label}`)

    if (this.state.domElem != null) {
      const dimensions = this.state.domElem.getBoundingClientRect()
      this.state.canvas = new InfluenceCanvas(this.state.d3Elem, 'Joyce_Carol_Oates')
      this.state.canvas.render(dimensions)
    } // TODO: what should I do if the nodes aren't found?

    window.addEventListener('resize', () => {
      if (this.state.domElem != null && this.state.canvas != null) {
        const canvas = this.state.canvas
        const dimensions_ = this.state.domElem.getBoundingClientRect()
        canvas.render(dimensions_)
      }
    })
  }

  render() {
    return React.createElement('svg', { id: `${this.props.label}`, style: { height: '100%', width: '100%' } }, [])
  }
}

export default InfluenceChart

