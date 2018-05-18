export var TNode = function(id, properties) {
  this.id = id;
  this.properties = properties || {};
}

TNode.prototype = {
  getId: function() {return this.id;},

  getProperties: function() {
    return this.properties;
  },

  getProperty: function(property) {
    return this.properties[property];
  },

  setProperty: function(property, value) {
    var old = this.properties[property];
    this.properties[property] = value;
    return old;
  },

  clone: function() {
    var other = new TNode(this.getId());
    var self = this;
    Object.keys(this.getProperties()).forEach(function(property) {
      other.setProperty(property, self.getProperty(property));
    });
    return other;
  },

  toString: function() {
    return "Nd[" + this.id + "]";
  },
}

TNode.instanceOf = function(thing) {
  return TNode.prototype.isPrototypeOf(thing);
}

export var TLink = function(source, target, properties) {
  this.source = source;
  this.target = target;
  this.properties = properties || {};
}

TLink.prototype = {
  getSource: function() {return this.source;},

  getTarget: function() {return this.target;},

  getProperties: function() {
    return this.properties;
  },

  getProperty: function(property) {
    return this.properties[property];
  },

  setProperty: function(property, value) {
    var old = this.properties[property];
    this.properties[property] = value;
    return old;
  },

  toString: function() {
    return "Ln[" + this.getSource().getId() + ", " + this.getTarget().getId() + "]";
  },

  instanceOf: function(thing) {
    return TLink.prototype.isPrototypeOf(thing);
  },
}

TLink.instanceOf = function(thing) {
  return TLink.prototype.isPrototypeOf(thing);
}

export var TGraph = function() {
  this.nodesById = {};
  this.nodes = [];
  this.links = [];
}

TGraph.prototype = {

  // addLink creates a link between two nodes in the graph. Both nodes will be created if they don't already exist. The 

  addLink: function(sourceNodeOrId, targetNodeOrId, link_properties) {
    var source = this.establishNode(sourceNodeOrId);
    var target = this.establishNode(targetNodeOrId);
    return this.establishLink(source, target, link_properties);
  },

  containsNode: function(nodeOrId) {
    return getNode(nodeOrId) !== undefined;
  },

  // addNode adds a node to the graph. `n = graph.addNode(nodeOrId)`.
  // `nodeOrId` can, as the name implies, be either a simple ID (in which case
  // a node will be created) or an extant node.
  addNode: function(nodeOrId) {
    return this.establishNode(nodeOrId);
  },

  // establish a node

  establishNode: function(nodeOrId) {

    var node = this.getNode(nodeOrId);

    // if node exists, return that

    if (node !== undefined)
      return node;

    // if passed in a node

    if (TNode.instanceOf(nodeOrId)) {

      // if node with same id name exits, return that

      node = this.nodesById[nodeOrId.getId()];
      if (node !== undefined)
        return node;
          
      // other wise clone it

      node = nodeOrId.clone();
    }

    // otherwise this nodes does not exits, make one

    else {
      node = new TNode(nodeOrId);
    }

    // add new node to graph

    this.nodes.push(node);
    this.nodesById[node.getId()] = node;
    return node;
  },

  // establish a link

  establishLink: function(source, target, link_properties) {
    var link;
    var self = this;

    this.getLinks().some(function(existingLink) {
      if (existingLink.getSource() == source 
          && existingLink.getTarget() == target 
          && self.tEquals.call(link_properties, existingLink.getProperties())) {
        link = existingLink;
        return true;
      }

      return false;
    });
    
    if (link === undefined) {
      var link = new TLink(source, target, link_properties);
      this.links.push(link);
    }
    return link;
  },

  // accepts a node or a node id and returns a node if and only if that
  // node is a member of this graph

  getNode: function(nodeOrId) {

    // if is a node...

    if (TNode.instanceOf(nodeOrId)) {
      return this.nodes.indexOf(nodeOrId) >= 0 ? nodeOrId : undefined;
    }

    // if is an id

    return this.nodesById[nodeOrId];
  },

  // accepts a link or a link id and returns a link if and only if that
  // link is a member of this graph

  getSomeLinks: function(test) {
    return getLinks.filter(test);
  },

  removeNode: function(nodeOrId) {
    var killNode = this.getNode(nodeOrId);
    if (killNode !== undefined) {
      var killLinks = this.getAllLinks(killNode);
      this.links = this.links.filter(function(link) {return killLinks.indexOf(link) < 0});
      this.nodes = this.nodes.filter(function(node) {return node != killNode;});
      this.nodesById[killNode.getId()] = undefined;
    }
    return killNode;
  },

  getNodes: function() {return this.nodes;},

  getLinks: function() {return this.links;},

  getConnectedNodeMap: function(nodeOrId) {
    var node = this.getNode(nodeOrId);
    var connected = {};

    this.getLinks().forEach(function(link) {
      if (link.source == node)
        connected[link.target.id] = link.target;
      else if (link.target == node)
        connected[link.source.id] = link.source;
    });

    return connected;
  },

  getConnectedNodes: function(nodeOrId) {
    var node = this.getNode(nodeOrId);
    var connected_map = this.getConnectedNodeMap(node);

    var connected = [];
    Object.keys(connected_map).forEach(function(key) {
      connected.push(connected_map[key]);
    });

    return connected;
  },

  getArrivingLinks: function(nodeOrId) {
    var node = this.getNode(nodeOrId);
    var arriving = [];

    this.getLinks().forEach(function(link) {
      if (link.target == node)
        arriving.push(link);
    });

    return arriving;
  },

  getDepartingLinks: function(nodeOrId) {
    var node = this.getNode(nodeOrId);
    var departing = [];

    this.getLinks().forEach(function(link) {
      if (link.source == node)
        departing.push(link);
    });

    return departing;
  },

  getAllLinks: function(nodeOrId) {
    var node = this.getNode(nodeOrId);
    var departing = [];

    this.getLinks().forEach(function(link) {
      if (link.source == node || link.target == node)
        departing.push(link);
    });

    return departing;
  },

  toString: function() {
    var result = "Graph[";
    this.getNodes().forEach(function(node, i) {
      result += "[" + node.getId() + "]";
    });
    this.getLinks().forEach(function(link, i) {
      result += "(" + link.getSource().getId() + "->" + link.getTarget().getId() + ")";
    });
    return result + "]";
  },

  tEquals: function(x)
  {
    var p;
    for(p in this) {
      if(typeof(x[p])=='undefined') {return false;}
    }

    for(p in this) {
      if (this[p]) {
        switch(typeof(this[p])) {
        case 'object':
          if (!this[p].equals(x[p])) { return false; } break;
        case 'function':
          if (typeof(x[p])=='undefined' ||
              (p != 'equals' && this[p].toString() != x[p].toString()))
            return false;
          break;
        default:
          if (this[p] != x[p]) { return false; }
        }
      } else {
        if (x[p])
          return false;
      }
    }

    for(p in x) {
      if(typeof(this[p])=='undefined') {return false;}
    }

    return true;
  }
}

// create the union of two graphs

TGraph.union = function(g1, g2) {
  var union = new TGraph();
  
  g1.getNodes().forEach(function(node) {
    union.addNode(node);
  });
  g2.getNodes().forEach(function(node) {
    union.addNode(node);
  });

  g1.getLinks().forEach(function(link) {
    union.addLink(link.getSource(), link.getTarget(), link.getProperties());
  });

  g2.getLinks().forEach(function(link) {
    union.addLink(link.getSource(), link.getTarget(), link.getProperties());
  });

  return union;
}

TGraph.instanceOf = function(thing) {
  return TGraph.prototype.isPrototypeOf(thing);
}

/*
var exports = exports || {};
exports.TGraph = TGraph;
exports.TNode = TNode;
exports.TLink = TLink;
*/
