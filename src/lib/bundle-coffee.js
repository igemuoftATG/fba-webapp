(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Compartment, Node, stringToColour,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Node = require("./Node");

stringToColour = require('./utilities').stringToColour;

Compartment = (function(superClass) {
  extend(Compartment, superClass);

  function Compartment(attr, ctx) {
    this.attr = attr;
    this.ctx = ctx;
    Compartment.__super__.constructor.call(this, this.attr, this.ctx);
    this.type = "Compartment";
  }

  Compartment.prototype.draw = function() {
    if (!this.deleted) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.fillStyle = stringToColour(this.name);
      if (this.hover) {
        this.ctx.fillStyle = "green";
      }
      return this.ctx.fill();
    }
  };

  return Compartment;

})(Node);

module.exports = Compartment;


},{"./Node":5,"./utilities":19}],2:[function(require,module,exports){
var Graph, Link, Metabolite, Reaction, utilities;

utilities = require("./utilities");

Metabolite = require("./Metabolite");

Reaction = require("./Reaction");

Link = require("./Link");

Graph = (function() {
  function Graph(id, name) {
    this.id = id;
    this.name = name;
    this.outNeighbours = new Object();
    this.inNeighbours = new Object();
    this.value = null;
  }

  return Graph;

})();

module.exports = Graph;


},{"./Link":3,"./Metabolite":4,"./Reaction":6,"./utilities":19}],3:[function(require,module,exports){
var Link;

Link = (function() {
  var y;

  function Link(attr, ctx) {
    this.attr = attr;
    this.ctx = ctx;
    this.id = this.attr.id;
    this.r = this.attr.r;
    this.source = this.attr.source;
    this.target = this.attr.target;
    this.fluxValue = this.attr.fluxValue;
    this.linkScale = this.attr.linkScale;
    this.thickness = this.linkScale(this.fluxValue);
    this.appendSubstratesAndProducts();
  }

  Link.prototype.appendSubstratesAndProducts = function() {
    if (this.source.type === 'm' && this.target.type === 'r') {
      this.source.outNeighbours.push(this.target);
      return this.target.substrates.push(this.source);
    } else if (this.source.type === 'r' && this.target.type === 'm') {
      this.target.inNeighbours.push(this.source);
      return this.source.products.push(this.target);
    } else if (this.target.type === 'r' && this.source.type === 'Compartment') {
      return this.source.products.push(this.target);
    } else if (this.source.type === 'r' && this.target.type === 'Compartment') {
      this.target.inNeighbours.push(this.source);
      return this.r = this.target.r;
    }
  };

  y = function(x1, y1, m) {
    return function(x) {
      return m * (x - x1) + y1;
    };
  };

  Link.prototype.setM = function() {
    return this.m = (this.target.y - this.source.y) / (this.target.x - this.source.x);
  };

  Link.prototype.draw = function() {
    var h, lineAngle, targetx, targety, theta;
    if (!this.target.deleted && !this.source.deleted) {
      lineAngle = Math.atan2(this.target.y - this.source.y, this.target.x - this.source.x) + Math.PI;
      h = 10;
      theta = Math.PI / 8;
      this.ctx.beginPath();
      targetx = this.target.x + this.r * Math.cos(lineAngle);
      targety = this.target.y + this.r * Math.sin(lineAngle);
      this.ctx.moveTo(this.source.x, this.source.y);
      this.ctx.lineTo(targetx, targety);
      this.ctx.lineTo(targetx + h * Math.cos(theta + lineAngle), targety + h * Math.sin(theta + lineAngle));
      this.ctx.moveTo(targetx, targety);
      this.ctx.lineTo(targetx + h * Math.cos(-theta + lineAngle), targety + h * Math.sin(-theta + lineAngle));
      this.ctx.lineWidth = this.thickness;
      this.ctx.closePath();
      this.ctx.strokeStyle = "black";
      return this.ctx.stroke();
    }
  };

  return Link;

})();

module.exports = Link;


},{}],4:[function(require,module,exports){
var Metabolite, Node,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Node = require("./Node");

Metabolite = (function(superClass) {
  extend(Metabolite, superClass);

  function Metabolite(attr, ctx) {
    this.ctx = ctx;
    Metabolite.__super__.constructor.call(this, attr, this.ctx);
    this.specie = attr.specie;
  }

  Metabolite.prototype.draw = function() {
    if (!this.deleted) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.fillStyle = "black";
      if (this.hover) {
        this.ctx.fillStyle = "green";
      }
      return this.ctx.fill();
    }
  };

  return Metabolite;

})(Node);

module.exports = Metabolite;


},{"./Node":5}],5:[function(require,module,exports){
var Node, rand;

rand = function(range) {
  return Math.floor(Math.random() * range);
};

Node = (function() {
  function Node(attr, ctx) {
    this.ctx = ctx;
    if (attr == null) {
      console.log(attr);
    }
    this.x = attr.x;
    this.y = attr.y;
    this.r = attr.r;
    this.hover = false;
    this.id = attr.id;
    this.name = attr.name;
    this.type = attr.type;
    this.colour = attr.colour;
    this.keepStatic = false;
    if (this.type === "m") {
      this.compartment = this.id.split('_')[this.id.split('_').length - 1];
    }
    this.substrates = this.inNeighbours = new Array();
    this.products = this.outNeighbours = new Array();
    this.deleted = false;
    this.flux_value = attr.flux_value;
  }

  Node.prototype.checkCollision = function(x, y) {
    var inside;
    inside = false;
    if (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) <= Math.pow(this.r, 2)) {
      inside = true;
    }
    return inside;
  };

  return Node;

})();

module.exports = Node;


},{}],6:[function(require,module,exports){
var Node, Reaction,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Node = require("./Node");

Reaction = (function(superClass) {
  extend(Reaction, superClass);

  function Reaction(attr) {
    Reaction.__super__.constructor.call(this, attr);
    this.substrateCompartments = new Array();
    this.productCompartments = new Array();
    this.links = new Array();
  }

  Reaction.prototype.addLink = function(link) {
    this.links.push(link);
    if (link.source.type === 'r') {
      if (this.productCompartments.indexOf(link.target.compartment) === -1) {
        return this.productCompartments.push(link.target.compartment);
      }
    } else if (link.target.type === 'r') {
      if (this.substrateCompartments.indexOf(link.source.compartment) === -1) {
        return this.substrateCompartments.push(link.source.compartment);
      }
    }
  };

  return Reaction;

})(Node);

module.exports = Reaction;


},{"./Node":5}],7:[function(require,module,exports){
var Node, ReactionNode, stringToColour,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Node = require("./Node");

stringToColour = require('./utilities').stringToColour;

ReactionNode = (function(superClass) {
  extend(ReactionNode, superClass);

  function ReactionNode(attr, ctx) {
    this.ctx = ctx;
    ReactionNode.__super__.constructor.call(this, attr, this.ctx);
  }

  ReactionNode.prototype.draw = function() {
    var factor, i, j, k, nos, ref, ref1, size;
    if (!this.deleted) {
      nos = 6;
      size = this.r;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x + this.r * Math.cos(0), this.y + this.r * Math.sin(0));
      for (i = j = 0, ref = nos; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.ctx.lineTo(this.x + this.r * Math.cos(i * 2 * Math.PI / nos), this.y + this.r * Math.sin(i * (2 * Math.PI / nos)));
      }
      this.ctx.lineTo(this.x + this.r * Math.cos(0), this.y + this.r * Math.sin(0));
      this.ctx.lineTo(this.x + this.r * Math.cos(1 * 2 * Math.PI / nos), this.y + this.r * Math.sin(1 * (2 * Math.PI / nos)));
      this.ctx.fillStyle = stringToColour(this.name);
      this.ctx.closePath();
      this.ctx.fill();
      factor = 1.2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x + factor * this.r * Math.cos(0), this.y + factor * this.r * Math.sin(0));
      for (i = k = 0, ref1 = nos; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        this.ctx.lineTo(this.x + factor * this.r * Math.cos(i * 2 * Math.PI / nos), this.y + factor * this.r * Math.sin(i * (2 * Math.PI / nos)));
      }
      this.ctx.lineTo(this.x + factor * this.r * Math.cos(0), this.y + factor * this.r * Math.sin(0));
      this.ctx.lineTo(this.x + factor * this.r * Math.cos(1 * 2 * Math.PI / nos), this.y + factor * this.r * Math.sin(1 * (2 * Math.PI / nos)));
      this.ctx.closePath();
      this.ctx.strokeStyle = stringToColour(this.name);
      return this.ctx.stroke();
    }
  };

  return ReactionNode;

})(Node);

module.exports = ReactionNode;


},{"./Node":5,"./utilities":19}],8:[function(require,module,exports){
var Compartment, Link, Metabolite, ReactionNode, SubSystem, creators, force, utilities;

Compartment = require('./Compartment');

utilities = require('./utilities');

creators = require('./creators');

force = require('./force');

creators = require('./creators');

Metabolite = require('./Metabolite');

ReactionNode = require('./ReactionNode');

Link = require('./Link');

SubSystem = (function() {
  var chargeHandler, linkDistanceHandler;

  function SubSystem(data, W, H, ctx1) {
    var from, it, kv, to, value;
    this.W = W;
    this.H = H;
    this.ctx = ctx1;
    this.nodes = new Array();
    this.links = new Array();
    this.force = null;
    this.metaboliteRadius = 10;
    this.radiusScale = utilities.scaleRadius(null, 5, 15);
    this.graph = new Graph();
    this.compartments = new Object();
    this.buildUnsortedGraph(data.metabolites, data.reactions);
    it = this.graph.vertices();
    while (!(kv = it.next()).done) {
      value = kv.value[1];
      this.nodes.push(value);
    }
    it = this.graph.edges();
    while (!(kv = it.next()).done) {
      from = kv.value[0];
      to = kv.value[1];
      value = kv.value[2];
      this.links.push(this.createLink(this.graph.vertexValue(from), this.graph.vertexValue(to), value, 1, 1, this.ctx));
    }
    this.intializeForce();
  }

  SubSystem.prototype.initalizeForce = function() {
    return this.force = d3.layout.force().nodes(this.nodes).links(this.links).size([this.W, this.H]).linkStrength(2).friction(0.9).linkDistance(100).charge(100).gravity(0.1).theta(0.8).alpha(0.1);
  };

  SubSystem.prototype.createLink = function(src, tgt, name, flux, radius, ctx) {
    var linkAttr;
    if (src.type === "r" && tgt.type === "m") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    } else if (src.type === "m" && tgt.type === "r") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    } else {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    }
  };

  linkDistanceHandler = function(link, i) {
    return 1000;
  };

  chargeHandler = function(node, i) {
    return -8000;
  };

  SubSystem.prototype.buildUnsortedGraph = function(metaboliteData, reactionData) {
    var j, k, len, len1, m, metabolite, metaboliteId, reaction, results, source, target;
    for (j = 0, len = metaboliteData.length; j < len; j++) {
      metabolite = metaboliteData[j];
      m = this.createMetabolite(metabolite.name, metabolite.id, this.metaboliteRadius, false, this.ctx);
      m.species = metabolite.species;
      this.graph.addVertex(metabolite.id, m);
    }
    results = [];
    for (k = 0, len1 = reactionData.length; k < len1; k++) {
      reaction = reactionData[k];
      if (!this.everything && reaction.flux_value === 0) {
        continue;
      }
      if (this.hideObjective && reaction.name.indexOf('objective function') !== -1) {
        continue;
      }
      if (!this.graph.hasVertex(reaction.id)) {
        this.graph.addVertex(reaction.id, this.createReactionNode(reaction.id, reaction.name, reaction.flux_value, this.ctx));
      }
      results.push((function() {
        var results1;
        results1 = [];
        for (metaboliteId in reaction.metabolites) {
          if (reaction.metabolites[metaboliteId] > 0) {
            source = reaction.id;
            target = metaboliteId;
            results1.push(this.graph.createNewEdge(source, target, source + " -> " + target));
          } else {
            source = metaboliteId;
            target = reaction.id;
            results1.push(this.graph.createNewEdge(source, target, source + " -> " + target));
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  SubSystem.prototype.createReactionNode = function(id, name, flux_value, ctx) {
    var r, reactionAttributes;
    reactionAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: 10,
      name: name,
      id: id,
      type: "r",
      flux_value: flux_value,
      colour: "rgb(" + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ")"
    };
    r = new ReactionNode(reactionAttributes, ctx);
    return r;
  };

  SubSystem.prototype.createMetabolite = function(name, id, radius, updateOption, ctx) {
    var j, len, metabolite, node, nodeAttributes, nodeReturn, ref;
    nodeAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: radius,
      name: name,
      id: id,
      type: "m"
    };
    metabolite = new Metabolite(nodeAttributes, ctx);
    if (updateOption) {
      this.viewController.updateOptions(name, id);
    }
    return metabolite;
    ({
      createLink: creators.createLink,
      checkCollisions: function(x, y) {}
    });
    nodeReturn = null;
    ref = this.nodes;
    for (j = 0, len = ref.length; j < len; j++) {
      node = ref[j];
      if (node.checkCollision(x, y)) {
        nodeReturn = node;
        node.hover = true;
        break;
      } else {
        node.hover = false;
      }
    }
    return nodeReturn;
  };

  return SubSystem;

})();

module.exports = SubSystem;


},{"./Compartment":1,"./Link":3,"./Metabolite":4,"./ReactionNode":7,"./creators":15,"./force":17,"./utilities":19}],9:[function(require,module,exports){
var Compartment, Link, Metabolite, ReactionNode, SubSystem, creators, force, utilities;

Compartment = require('./Compartment');

utilities = require('./utilities');

creators = require('./creators');

force = require('./force');

creators = require('./creators');

Metabolite = require('./Metabolite');

ReactionNode = require('./ReactionNode');

Link = require('./Link');

SubSystem = (function() {
  var chargeHandler, linkDistanceHandler;

  function SubSystem(data, W, H, ctx1) {
    var from, it, kv, to, value;
    this.W = W;
    this.H = H;
    this.ctx = ctx1;
    this.nodes = new Array();
    this.links = new Array();
    this.force = null;
    this.metaboliteRadius = 10;
    this.radiusScale = utilities.scaleRadius(null, 5, 15);
    this.graph = new Graph();
    this.compartments = new Object();
    this.buildUnsortedGraph(data.metabolites, data.reactions);
    it = this.graph.vertices();
    while (!(kv = it.next()).done) {
      value = kv.value[1];
      this.nodes.push(value);
    }
    it = this.graph.edges();
    while (!(kv = it.next()).done) {
      from = kv.value[0];
      to = kv.value[1];
      value = kv.value[2];
      this.links.push(this.createLink(this.graph.vertexValue(from), this.graph.vertexValue(to), value, 1, 1, this.ctx));
    }
    this.intializeForce();
  }

  SubSystem.prototype.initalizeForce = function() {
    return this.force = d3.layout.force().nodes(this.nodes).links(this.links).size([this.W, this.H]).linkStrength(2).friction(0.9).linkDistance(100).charge(100).gravity(0.1).theta(0.8).alpha(0.1);
  };

  SubSystem.prototype.createLink = function(src, tgt, name, flux, radius, ctx) {
    var linkAttr;
    if (src.type === "r" && tgt.type === "m") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    } else if (src.type === "m" && tgt.type === "r") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    } else {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    }
  };

  linkDistanceHandler = function(link, i) {
    return 1000;
  };

  chargeHandler = function(node, i) {
    return -8000;
  };

  SubSystem.prototype.buildUnsortedGraph = function(metaboliteData, reactionData) {
    var j, k, len, len1, m, metabolite, metaboliteId, reaction, results, source, target;
    for (j = 0, len = metaboliteData.length; j < len; j++) {
      metabolite = metaboliteData[j];
      m = this.createMetabolite(metabolite.name, metabolite.id, this.metaboliteRadius, false, this.ctx);
      m.species = metabolite.species;
      this.graph.addVertex(metabolite.id, m);
    }
    results = [];
    for (k = 0, len1 = reactionData.length; k < len1; k++) {
      reaction = reactionData[k];
      if (!this.everything && reaction.flux_value === 0) {
        continue;
      }
      if (this.hideObjective && reaction.name.indexOf('objective function') !== -1) {
        continue;
      }
      if (!this.graph.hasVertex(reaction.id)) {
        this.graph.addVertex(reaction.id, this.createReactionNode(reaction.id, reaction.name, reaction.flux_value, this.ctx));
      }
      results.push((function() {
        var results1;
        results1 = [];
        for (metaboliteId in reaction.metabolites) {
          if (reaction.metabolites[metaboliteId] > 0) {
            source = reaction.id;
            target = metaboliteId;
            results1.push(this.graph.createNewEdge(source, target, source + " -> " + target));
          } else {
            source = metaboliteId;
            target = reaction.id;
            results1.push(this.graph.createNewEdge(source, target, source + " -> " + target));
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  SubSystem.prototype.createReactionNode = function(id, name, flux_value, ctx) {
    var r, reactionAttributes;
    reactionAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: 10,
      name: name,
      id: id,
      type: "r",
      flux_value: flux_value,
      colour: "rgb(" + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ")"
    };
    r = new ReactionNode(reactionAttributes, ctx);
    return r;
  };

  SubSystem.prototype.createMetabolite = function(name, id, radius, updateOption, ctx) {
    var j, len, metabolite, node, nodeAttributes, nodeReturn, ref;
    nodeAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: radius,
      name: name,
      id: id,
      type: "m"
    };
    metabolite = new Metabolite(nodeAttributes, ctx);
    if (updateOption) {
      this.viewController.updateOptions(name, id);
    }
    return metabolite;
    ({
      createLink: creators.createLink,
      checkCollisions: function(x, y) {}
    });
    nodeReturn = null;
    ref = this.nodes;
    for (j = 0, len = ref.length; j < len; j++) {
      node = ref[j];
      if (node.checkCollision(x, y)) {
        nodeReturn = node;
        node.hover = true;
        break;
      } else {
        node.hover = false;
      }
    }
    return nodeReturn;
  };

  return SubSystem;

})();

module.exports = SubSystem;


},{"./Compartment":1,"./Link":3,"./Metabolite":4,"./ReactionNode":7,"./creators":15,"./force":17,"./utilities":19}],10:[function(require,module,exports){
var Compartment, SubSystem, System, TreeNode, ViewController, addors, builders, creators, deletors;

SubSystem = require("./SubSystem");

ViewController = require("./ViewController");

Compartment = require("./Compartment");

TreeNode = require('./TreeNode');

creators = require('./creators');

deletors = require('./deletors');

addors = require('./addors');

builders = require('./builders');

System = (function() {
  function System(attr, data, sortables) {
    this.attr = attr;
    sortables.index += 1;
    this.id = this.attr.id;
    this.name = this.attr.name;
    this.type = this.attr.type;
    this.viewController = new ViewController("canvas", this.attr.width, this.attr.height, this.attr.backgroundColour, null);
    this.everything = this.attr.everything;
    this.hideObjective = this.attr.hideObjective;
    this.metaboliteRadius = this.attr.metaboliteRadius;
    this.root = new TreeNode("root", new SubSystem(data, this.attr.width, this.attr.height, this.viewController.ctx));
    this.viewController.startCanvas(this.root.subsystem);
  }

  System.prototype.createReaction = creators.createReaction;

  System.prototype.createMetabolite = creators.createMetabolite;

  System.prototype.createLink = creators.createLink;

  System.prototype.deleteNode = deletors.deleteNode;

  return System;

})();

module.exports = System;

window.FBA = {
  System: System
};


},{"./Compartment":1,"./SubSystem":8,"./TreeNode":11,"./ViewController":12,"./addors":13,"./builders":14,"./creators":15,"./deletors":16}],11:[function(require,module,exports){
var TreeNode;

TreeNode = (function() {
  function TreeNode(id, subsystem) {
    this.id = id;
    this.subsystem = subsystem;
    this.parent = null;
    this.children = new Object();
  }

  return TreeNode;

})();

module.exports = TreeNode;


},{}],12:[function(require,module,exports){
var ViewController;

ViewController = (function() {
  var mousedownHandler, mousemoveHandler, mouseupHandler, mousewheelHandler;

  function ViewController(id1, width, height, BG, system) {
    this.id = id1;
    this.width = width;
    this.height = height;
    this.BG = BG;
    this.c = document.createElement("canvas");
    this.activeGraph = null;
    this.c.id = this.id;
    this.c.width = this.width;
    this.c.height = this.height;
    this.currentActiveNode = null;
    this.isDraggingNode = false;
    this.clientX = 0;
    this.clientY = 0;
    document.body.appendChild(this.c);
    this.ctx = document.getElementById(this.id).getContext("2d");
    this.nodetext = $('#nodetext');
  }

  ViewController.prototype.startCanvas = function(subsystem) {
    var that;
    this.activeGraph = subsystem;
    $(this.id).css({
      "-moz-user-select": "none",
      "-webkit-user-select": "none",
      "-ms-user-select": "none",
      "user-select": "none",
      "-o-user-select": "none",
      "unselectable": "on"
    });
    that = this;
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.xform = this.svg.createSVGMatrix();
    this.dragStart = null;
    this.dragScaleFactor = 1.5;
    this.lastX = Math.floor(this.width / 2);
    this.lastY = Math.floor(this.width / 2);
    this.c.addEventListener("mousewheel", mousewheelHandler.bind(this), false);
    this.c.addEventListener("mousedown", mousedownHandler.bind(this), false);
    this.c.addEventListener("mouseup", mouseupHandler.bind(this), false);
    this.c.addEventListener("mousemove", mousemoveHandler.bind(this), false);
    return this.startAnimate();
  };

  ViewController.prototype.populateOptions = function(nodes) {
    var i, len, node, results, source, target;
    $("#source").html("");
    $("#target").html("");
    source = d3.select("#source");
    target = d3.select("#target");
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      source.append("option").attr("value", node.id).text(node.name);
      results.push(target.append("option").attr("value", node.id).text(node.name));
    }
    return results;
  };

  ViewController.prototype.updateOptions = function(name, id) {
    d3.select("#source").append("option").attr("value", id).text(name);
    return d3.select("#target").append("option").attr("value", id).text(name);
  };

  ViewController.prototype.removeOption = function(node) {
    d3.select("#source").selectAll("option")[0].forEach(function(d) {
      if ($(d).val() === node.id && $(d).text() === node.name) {
        return $(d).remove();
      }
    });
    d3.select("#target").selectAll("option")[0].forEach(function(d) {
      if ($(d).val() === node.id && $(d).text() === node.name) {
        return $(d).remove();
      }
    });
    return $('#nodetext').removeClass('showing');
  };

  ViewController.prototype.transformedPoint = function(x, y) {
    var pt;
    pt = this.svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(this.xform.inverse());
  };

  mousedownHandler = function(e) {
    var tPt;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    this.lastX = e.clientX - this.c.offsetLeft;
    this.lastY = e.clientY - this.c.offsetTop;
    tPt = this.transformedPoint(e.clientX, e.clientY);
    this.activeGraph.checkCollisions(tPt.x, tPt.y);
    if (this.currentActiveNode == null) {
      return this.dragStart = this.transformedPoint(this.lastX, this.lastY);
    } else {
      $('#nodetext').removeClass('showing');
      return this.isDraggingNode = true;
    }
  };

  mousemoveHandler = function(e) {
    var clientX, clientY, dX, dY, tPt;
    e.preventDefault();
    clientX = e.clientX;
    clientY = e.clientY;
    this.lastX = e.clientX - this.c.offsetLeft;
    this.lastY = e.clientY - this.c.offsetTop;
    tPt = this.transformedPoint(this.lastX, this.lastY);
    if ((this.dragStart != null) && !this.isDraggingNode) {
      dX = (tPt.x - this.dragStart.x) * this.dragScaleFactor;
      dY = (tPt.y - this.dragStart.y) * this.dragScaleFactor;
      this.xform = this.xform.translate(dX, dY);
      return this.ctx.translate(dX, dY);
    } else if (this.isDraggingNode) {
      this.currentActiveNode.x = tPt.x;
      return this.currentActiveNode.y = tPt.y;
    } else {
      this.currentActiveNode = this.activeGraph.checkCollisions(tPt.x, tPt.y);
      if (this.currentActiveNode != null) {
        return this.appendText(this.currentActiveNode, e);
      } else {
        return $('#nodetext').removeClass('showing');
      }
    }
  };

  mouseupHandler = function(e) {
    e.preventDefault();
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    this.dragStart = null;
    this.isDraggingNode = false;
    return this.currentActiveNode = null;
  };

  mousewheelHandler = function(e) {
    var delta, factor, i, len, pt, ref, specie, wheel, zoom;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    e.preventDefault();
    wheel = e.wheelDelta / 120;
    zoom = 1 + wheel / 2;
    delta = 0;
    if (e.wheelDelta != null) {
      delta = e.wheelDelta / 120;
    } else {
      if (e.detail != null) {
        delta = -e.detail;
      }
    }
    factor = zoom;
    pt = this.transformedPoint(this.lastX, this.lastY);
    this.ctx.translate(pt.x, pt.y);
    this.xform = this.xform.translate(pt.x, pt.y);
    this.ctx.scale(factor, factor);
    this.xform = this.xform.scaleNonUniform(factor, factor);
    if (this.activeGraph === this.network) {
      ref = this.network.species;
      for (i = 0, len = ref.length; i < len; i++) {
        specie = ref[i];
        if (specie.checkCollision(pt.x, pt.y)) {
          if (specie.r * this.xform.a >= this.c.width && specie.r * this.xform.a >= this.c.height) {
            this.network.enterSpecie(specie);
          }
        }
      }
    } else {
      if (this.xform.a <= 0.02) {
        this.network.exitSpecie();
      }
    }
    this.ctx.translate(-pt.x, -pt.y);
    return this.xform = this.xform.translate(-pt.x, -pt.y);
  };

  ViewController.prototype.tick = function() {
    var tPt;
    if ((this.currentActiveNode != null) && this.isDraggingNode) {
      tPt = this.canvas.transformedPoint(this.clientX, this.clientY);
      this.currentActiveNode.x = tPt.x;
      return this.currentActiveNode.y = tPt.y;
    }
  };

  ViewController.prototype.appendText = function(node, e) {
    var product, products, substrate, substrates, that;
    this.nodetext.addClass('showing');
    this.nodetext.css({
      'left': e.clientX,
      'top': e.clientY
    });
    that = this;
    if (node.type === 'r') {
      substrates = (function() {
        var i, len, ref, results;
        ref = node.inNeighbours;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          substrate = ref[i];
          results.push(substrate);
        }
        return results;
      })();
      products = (function() {
        var i, len, ref, results;
        ref = node.outNeighbours;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          product = ref[i];
          results.push(product);
        }
        return results;
      })();
      this.nodetext.html(substrates + " --- (" + node.name + ") ---> " + products + "<br>");
      this.nodetext.append("<button id='delete'>Delete Reaction</button><br>");
    } else {
      this.nodetext.html(node.name + "<br>");
      this.nodetext.append("<button id='delete'>Delete Node</button><br>");
      if (node.type === 's') {
        this.nodetext.append("<button id='enter'>Enter Specie</button><br>");
        $("#enter").click(function() {
          return that.network.enterSpecie(node);
        });
      }
    }
    if (this.network !== this.activeGraph) {
      this.nodetext.append("<button id='network'>Return to network</button><br>");
      $("#network").click(function() {
        return that.network.exitSpecie();
      });
    }
    return $("#delete").click(function() {
      return that.system.deleteNode(node);
    });
  };

  ViewController.prototype.setActiveGraph = function(graph) {
    var scale;
    this.activeGraph.force.stop();
    this.activeGraph = graph;
    this.nodes = this.activeGraph.nodes;
    this.links = this.activeGraph.links;
    this.xform = this.svg.createSVGMatrix();
    scale = 0.25;
    if (this.network === this.activeGraph) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
      this.xform.a = scale;
      this.xform.d = scale;
    }
    this.populateOptions(this.activeGraph.nodes);
    this.activeGraph.initalizeForce();
    this.activeGraph.force.on("tick", this.tick.bind(this)).start();
    return this.activeGraph.force.resume();
  };

  ViewController.prototype.startAnimate = function() {
    var AnimationFrame;
    AnimationFrame = window.AnimationFrame;
    AnimationFrame.shim();
    return this.render();
  };

  ViewController.prototype.clear = function() {
    var p1, p2;
    this.ctx.fillStyle = this.BG;
    p1 = this.transformedPoint(0, 0);
    p2 = this.transformedPoint(this.width, this.height);
    this.ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    return this.ctx.fill();
  };

  ViewController.prototype.draw = function() {
    var i, j, len, len1, link, node, ref, ref1, results;
    ref = this.activeGraph.links;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      link.draw();
    }
    ref1 = this.activeGraph.nodes;
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      node = ref1[j];
      results.push(node.draw());
    }
    return results;
  };

  ViewController.prototype.render = function() {
    stats.begin();
    this.clear();
    this.draw();
    stats.end();
    return requestAnimationFrame(this.render.bind(this));
  };

  return ViewController;

})();

module.exports = ViewController;


},{}],13:[function(require,module,exports){
module.exports = {
  addMetabolite: function(id, name, type, radius, ctx) {
    var metabolite, nodeAttributes;
    nodeAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: radius,
      name: name,
      id: id,
      type: type
    };
    metabolite = new Metabolite(nodeAttributes, ctx);
    this.viewController.updateOptions(name, id);
    return this.nodes.push(metabolite);
  },
  addLink: function(src, tgt, name, flux, radius, ctx) {
    var linkAttr, reaction, reactionAttributes;
    if ((src == null) || (tgt == null)) {
      return alert("No self linking!");
    } else if (src.type === "r" && tgt.type === "m" || src.type === "m" && tgt.type === "r") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return this.links.push(new Link(linkAttr, ctx));
    } else if (src.type === "m" && tgt.type === "m") {
      reactionAttributes = {
        x: utilities.rand(this.W),
        y: utilities.rand(this.H),
        r: radius,
        name: name,
        id: name,
        type: "r",
        flux_value: flux,
        colour: "rgb(" + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ")"
      };
      reaction = new Reaction(reactionAttributes, ctx);
      this.nodes.push(reaction);
      linkAttr = {
        id: source.id + "-" + reaction.id,
        source: src,
        target: reaction,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      this.links.push(new Link(linkAttr, ctx));
      linkAttr = {
        id: reaction.id + "-" + target.id,
        source: reaction,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return this.links.push(new Link(linkAttr, ctx));
    } else {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: this.metaboliteRadius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return this.links.push(new Link(linkAttr, ctx));
    }
  },
  addReaction: function(src, tgt, name, radius, W, H, ctx) {
    var linkAttr, reaction, reactionAttributes;
    if ((src == null) || (tgt == null)) {
      return alert("No self linking!");
    } else if (src.type === "r" && tgt.type === "m" || src.type === "m" && tgt.type === "r") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: 0,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return this.links.push(new Link(linkAttr, ctx));
    } else if (src.type === "m" && tgt.type === "m") {
      reactionAttributes = {
        x: utilities.rand(W),
        y: utilities.rand(H),
        r: 5,
        name: name,
        id: name,
        type: "r",
        flux_value: 0,
        colour: "rgb(" + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ")"
      };
      reaction = new Reaction(reactionAttributes, ctx);
      this.nodes.push(reaction);
      linkAttr = {
        id: source.id + "-" + reaction.id,
        source: src,
        target: reaction,
        fluxValue: 0,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      this.links.push(new Link(linkAttr, ctx));
      linkAttr = {
        id: reaction.id + "-" + target.id,
        source: reaction,
        target: tgt,
        fluxValue: 0,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return this.links.push(new Link(linkAttr, ctx));
    } else {
      return alert("Invalid linkage");
    }
  }
};


},{}],14:[function(require,module,exports){
var Graph;

Graph = require('./Graph');

module.exports = {
  species: {
    sortor: function() {
      var g, r, reaction, results, specie;
      results = [];
      for (reaction in this.reactions) {
        r = this.reactions[reaction];
        results.push((function() {
          var i, len, ref, results1;
          ref = r.species;
          results1 = [];
          for (i = 0, len = ref.length; i < len; i++) {
            specie = ref[i];
            if (r.productCompartments.indexOf('e') !== -1) {
              g = new Graph(r.id, r.name);
              g.outNeighbours['e'] = this.graph.outNeighbours['e'];
              g.inNeighbours[specie] = this.graph.outNeighbours[specie];
              g.value = r;
              results1.push(this.graph.outNeighbours[specie].outNeighbours[r.id] = g);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    },
    compartmentor: function() {
      var i, len, m, mappings, metabolite, ref, sorter, specie;
      sorter = 'species';
      mappings = {
        iJO1366: 'E. coli'
      };
      for (metabolite in this.metabolites) {
        m = this.metabolites[metabolite];
        ref = m[sorter];
        for (i = 0, len = ref.length; i < len; i++) {
          specie = ref[i];
          if (this.graph.outNeighbours[specie] == null) {
            this.graph.outNeighbours[specie] = new Graph(specie, mappings[specie]);
          }
        }
      }
      return this.graph.outNeighbours['e'] = new Graph('e', 'extracellular');
    }
  },
  compartments: {
    compartmentor: function() {
      var m, mappings, metabolite, results, sorter;
      sorter = 'compartment';
      mappings = {
        c: 'cytosol',
        p: 'periplasm',
        e: 'extracellular'
      };
      results = [];
      for (metabolite in this.metabolites) {
        m = this.metabolites[metabolite];
        if (this.graph.outNeighbours[m[sorter]] == null) {
          results.push(this.graph.outNeighbours[m[sorter]] = new Graph(this.metabolites[metabolite][sorter], mappings[m[sorter]]));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    sortor: function() {
      var _cpt, cpt, i, j, k, l, leaf, len, len1, len2, len3, potentialLeaf, r, reaction, ref, ref1, ref2, ref3, results;
      results = [];
      for (reaction in this.reactions) {
        r = this.reactions[reaction];
        ref = r.substrateCompartments;
        for (i = 0, len = ref.length; i < len; i++) {
          cpt = ref[i];
          leaf = null;
          ref1 = r.substrateCompartments;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            _cpt = ref1[j];
            potentialLeaf = this.graph.outNeighbours[_cpt].outNeighbours[r.id];
            if (potentialLeaf != null) {
              leaf = potentialLeaf;
            }
          }
          if (leaf == null) {
            leaf = new Graph(r.id);
            leaf.value = r;
          }
          leaf.inNeighbours[cpt] = this.graph.outNeighbours[cpt];
          this.graph.outNeighbours[cpt].outNeighbours[r.id] = leaf;
        }
        ref2 = r.productCompartments;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          cpt = ref2[k];
          leaf = null;
          ref3 = r.substrateCompartments;
          for (l = 0, len3 = ref3.length; l < len3; l++) {
            _cpt = ref3[l];
            potentialLeaf = this.graph.outNeighbours[_cpt].outNeighbours[r.id];
            if (potentialLeaf != null) {
              leaf = potentialLeaf;
            }
          }
          if (leaf == null) {
            leaf = new Graph(r.id);
            leaf.value = r;
          }
          leaf.outNeighbours[cpt] = this.graph.outNeighbours[cpt];
          this.graph.outNeighbours[cpt].inNeighbours[leaf.id] = leaf;
        }
        if (r.outNeighbours.length === 0) {
          leaf.outNeighbours["e"] = this.graph.outNeighbours["e"];
          results.push(this.graph.outNeighbours["e"].inNeighbours[leaf.id] = leaf);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  }
};


},{"./Graph":2}],15:[function(require,module,exports){
var Link, Metabolite, Reaction, ReactionNode, utilities;

Reaction = require('./Reaction');

ReactionNode = require('./ReactionNode');

Metabolite = require('./Metabolite');

Link = require('./Link');

utilities = require('./utilities');

module.exports = {
  createReaction: function(name, id, flux, ctx) {
    var reactionAttributes;
    reactionAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: 10,
      name: name,
      id: id,
      type: "r",
      flux_value: flux
    };
    return new Reaction(reactionAttributes, ctx);
  },
  createReactionNode: function(id, name, flux_value, ctx) {
    var r, reactionAttributes;
    reactionAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: 10,
      name: name,
      id: id,
      type: "r",
      flux_value: flux_value,
      colour: "rgb(" + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ")"
    };
    r = new ReactionNode(reactionAttributes, ctx);
    return r;
  },
  createMetabolite: function(name, id, radius, updateOption, ctx) {
    var metabolite, nodeAttributes;
    nodeAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: radius,
      name: name,
      id: id,
      type: "m"
    };
    metabolite = new Metabolite(nodeAttributes, ctx);
    if (updateOption) {
      this.viewController.updateOptions(name, id);
    }
    return metabolite;
  },
  createLink: function(src, tgt, name, flux, radius, ctx) {
    var linkAttr;
    if (src.type === "r" && tgt.type === "m") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    } else if (src.type === "m" && tgt.type === "r") {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    } else {
      linkAttr = {
        id: src.id + "-" + tgt.id,
        source: src,
        target: tgt,
        fluxValue: flux,
        r: radius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return new Link(linkAttr, ctx);
    }
  },
  createLinks: function(s1, reactionNode, s2) {
    var link, source, target;
    source = this.compartments[s1];
    target = reactionNode;
    link = {
      id: source.name + "-" + target.name,
      source: source,
      target: target,
      flux_value: reactionNode.flux_value,
      r: this.metaboliteRadius,
      linkScale: utilities.scaleRadius(null, 1, 5)
    };
    this.links.push(new Link(link, this.ctx));
    source = reactionNode;
    target = this.compartments[s2];
    link = {
      id: source.name + "-" + target.name,
      source: source,
      target: target,
      flux_value: reactionNode.flux_value,
      r: this.metaboliteRadius,
      linkScale: utilities.scaleRadius(null, 1, 5)
    };
    return this.links.push(new Link(link, this.ctx));
  },
  createLeaf: function(graph) {
    var inNeighbour, outNeighbour, reactionNode, results;
    results = [];
    for (inNeighbour in graph.inNeighbours) {
      results.push((function() {
        var results1;
        results1 = [];
        for (outNeighbour in graph.outNeighbours) {
          if (inNeighbour !== outNeighbour) {
            reactionNode = this.createReactionNode(graph.value);
            results1.push(this.createLinks(inNeighbour, reactionNode, outNeighbour));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  }
};


},{"./Link":3,"./Metabolite":4,"./Reaction":6,"./ReactionNode":7,"./utilities":19}],16:[function(require,module,exports){
module.exports = {
  deleteNode: function(node) {
    var i, inNeighbour, j, len, len1, nodeIndex, outNeighbour, ref, ref1;
    this.exclusions.push(node);
    node.deleted = true;
    ref = node.inNeighbours;
    for (i = 0, len = ref.length; i < len; i++) {
      inNeighbour = ref[i];
      nodeIndex = inNeighbour.outNeighbours.indexOf(node);
      inNeighbour.outNeighbours.splice(nodeIndex, 1);
    }
    ref1 = node.outNeighbours;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      outNeighbour = ref1[j];
      nodeIndex = outNeighbour.inNeighbours.indexOf(node);
      outNeighbour.inNeighbours.splice(nodeIndex, 1);
    }
    return this.viewController.removeOption(node);
  }
};


},{}],17:[function(require,module,exports){
var chargeHandler, linkDistanceHandler;

linkDistanceHandler = function(link, i) {
  var factor;
  factor = 0;
  if (link.target.type === 'r') {
    factor = link.target.substrates.length;
  } else if (link.source.type === 'r') {
    factor = link.source.products.length;
  }
  return factor * 100;
};

chargeHandler = function(node, i) {
  var factor;
  factor = node.inNeighbours.length + node.outNeighbours.length + 1;
  factor = node.r * 2;
  return factor * -800;
};

module.exports = {
  initalizeForce: function() {
    var j, len, n, ref;
    this.force = d3.layout.force().nodes(this.nodes).links(this.links).size([this.W, this.H]).linkStrength(2).friction(0.9).linkDistance(linkDistanceHandler).charge(chargeHandler).gravity(0.1).theta(0.8).alpha(0.1);
    if (this.useStatic) {
      ref = this.nodes;
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        this.force.tick();
      }
      return this.force.stop();
    }
  }
};


},{}],18:[function(require,module,exports){
var System, TreeNode, counter, i, j, k, l, len, len1, metabolite, metaboliteDict, model, network, reaction, ref, ref1, ref2, sortables, subsystems, systemAttributes;

System = require("./System");

TreeNode = require("./TreeNode");

systemAttributes = {
  id: 'root',
  name: 'root',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColour: "white",
  metaboliteRadius: 10,
  useStatic: false,
  everything: false,
  hideObjective: true,
  type: 'species'
};

model = JSON.parse(JSON.stringify(data));

subsystems = new Object();

metaboliteDict = new Object();

ref = model.metabolites;
for (j = 0, len = ref.length; j < len; j++) {
  metabolite = ref[j];
  metabolite.subsystems = new Array();
  metaboliteDict[metabolite.id] = metabolite;
}

ref1 = model.reactions;
for (k = 0, len1 = ref1.length; k < len1; k++) {
  reaction = ref1[k];
  if (reaction.subsystem === '') {
    reaction.subsystem = 'Unassigned';
  }
  if (subsystems[reaction.subsystem] == null) {
    subsystems[reaction.subsystem] = [reaction];
  } else {
    subsystems[reaction.subsystem].push(reaction);
  }
  for (metabolite in reaction.metabolites) {
    if (metaboliteDict[metabolite].subsystems.indexOf(reaction.subsystem) === -1) {
      metaboliteDict[metabolite].subsystems.push(reaction.subsystem);
    }
  }
}

for (i = l = 0, ref2 = Object.keys(subsystems).length; 0 <= ref2 ? l <= ref2 : l >= ref2; i = 0 <= ref2 ? ++l : --l) {
  counter = 0;
  for (metabolite in metaboliteDict) {
    if (metaboliteDict[metabolite].subsystems.length > i) {
      counter++;
    }
  }
}

sortables = {
  index: -1,
  sortables: ['species', 'compartments'],
  start: 'species'
};

network = new System(systemAttributes, networkData, sortables);


},{"./System":10,"./TreeNode":11}],19:[function(require,module,exports){
var nodeMap, rand, scaleRadius;

rand = function(range) {
  return Math.floor(Math.random() * (range + 1));
};

scaleRadius = function(model, minRadius, maxRadius) {
  var fluxes, largest, reaction;
  largest = 1;
  if (model) {
    fluxes = (function() {
      var j, len, ref, results;
      ref = model.reactions;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        reaction = ref[j];
        results.push(reaction.flux_value);
      }
      return results;
    })();
    largest = Math.max.apply(Math, fluxes);
  }
  return d3.scale.linear().domain([0, largest]).range([minRadius, maxRadius]);
};

nodeMap = function(nodes) {
  var i, j, len, map, node;
  map = new Object();
  for (i = j = 0, len = nodes.length; j < len; i = ++j) {
    node = nodes[i];
    map[node.id] = i;
  }
  return map;
};


var stringToColour = function(str) {
    
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    //return colour;

}
;

module.exports = {
  rand: rand,
  scaleRadius: scaleRadius,
  nodeMap: nodeMap,
  stringToColour: stringToColour
};


},{}]},{},[1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19])


//# sourceMappingURL=maps/bundle-coffee.js.map