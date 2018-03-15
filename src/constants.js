const $ = require('jquery')

const ARROW_WIDTH = 6
const BACK_BUTTON = 'static/images/backbutton.png'
const BANNER_SIZE = 25
const BANNER_X = 180
const BANNER_Y = 52
const CHART_HEIGHT = $('#chart').height()
const CHART_WIDTH = $('#chart').width()
const CHARGE_BASE = 200
const CHARGE_HIDDEN = 50
const CHARGE_RANDOM = 0
const DEFAULT_DURATION = 1000
const FB_BUTTON_SIZE = 34
const FB_BUTTON_X_OFF = (80 - FB_BUTTON_SIZE) / 2
const FB_BUTTON_X = CHART_WIDTH - 60
const FB_BUTTON_Y = 125
const FORWARD_BUTTON = 'static/images/forwardbutton.png'
const GRAVITY = 0
const HEAD_ANGLE = Math.PI / 6
const IMAGE_SIZE = 180
const LINK_BASE = 40
const LINK_MIN_OFFSET = 25
const LINK_RANDOM = 100
const LINK_STRENGHT = 0.3
const MAX_SCREEN_NODES = 25
const MARGIN = 37
const NODE_SIZE = 150
const PRINTABLE = true
const PRINTABLE_PARAM = '?printable=yes'
const RIM_SIZE = 15
const STOCK_EASE = 'elastic'
const TIMELINE_OPACITY = 0.03
const TIMELINE_HIGHLIGHT_OPACITY = 0.4
const TIMELINE_MARGIN = 50
const TIMELINE_Y = (CHART_HEIGHT - 20)
const UNKNOWN_PERSON = 'static/images/unknown.png'
const WIKI_LOGO = 'static/images/Wikipedia-logo.png'
const WIKI_ICON_WIDTH = 30

module.exports = {
  ARROW_WIDTH,
  BACK_BUTTON,
  BANNER_X,
  BANNER_Y,
  BANNER_SIZE,
  CHART_HEIGHT,
  CHART_WIDTH,
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
}

