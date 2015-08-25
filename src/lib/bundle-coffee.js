(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
      if (this.target.type === "r") {
        targetx = this.target.x;
        targety = this.target.y;
      } else {
        targetx = this.target.x + this.r * Math.cos(lineAngle);
        targety = this.target.y + this.r * Math.sin(lineAngle);
      }
      this.ctx.moveTo(this.source.x, this.source.y);
      this.ctx.lineTo(targetx, targety);
      if (this.source.type === "r") {
        this.ctx.lineTo(targetx + h * Math.cos(theta + lineAngle), targety + h * Math.sin(theta + lineAngle));
        this.ctx.moveTo(targetx, targety);
        this.ctx.lineTo(targetx + h * Math.cos(-theta + lineAngle), targety + h * Math.sin(-theta + lineAngle));
      }
      this.ctx.lineWidth = this.thickness;
      this.ctx.closePath();
      this.ctx.strokeStyle = "black";
      return this.ctx.stroke();
    }
  };

  return Link;

})();

module.exports = Link;


},{}],2:[function(require,module,exports){
var Metabolite, Node,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Node = require("./Node");

Metabolite = (function(superClass) {
  extend(Metabolite, superClass);

  function Metabolite() {
    return Metabolite.__super__.constructor.apply(this, arguments);
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


},{"./Node":3}],3:[function(require,module,exports){
var Node, rand;

rand = function(range) {
  return Math.floor(Math.random() * range);
};

Node = (function() {
  function Node(attr, ctx) {
    this.ctx = ctx;
    this.x = attr.x;
    this.y = attr.y;
    this.r = attr.r;
    this.hover = false;
    this.id = attr.id;
    this.name = attr.name;
    this.type = attr.type;
    this.colour = attr.colour;
    this.keepStatic = false;
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


},{}],4:[function(require,module,exports){
var Node, Reaction,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Node = require("./Node");

Reaction = (function(superClass) {
  extend(Reaction, superClass);

  function Reaction() {
    return Reaction.__super__.constructor.apply(this, arguments);
  }

  Reaction.prototype.draw = function() {
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
      this.ctx.fillStyle = this.colour;
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
      this.ctx.strokeStyle = this.colour;
      return this.ctx.stroke();
    }
  };

  return Reaction;

})(Node);

module.exports = Reaction;


},{"./Node":3}],5:[function(require,module,exports){
var Link, Metabolite, Node, Reaction, System, ViewController, utilities;

ViewController = require("./ViewController");

Node = require("./Node");

Metabolite = require("./Metabolite");

Reaction = require("./Reaction");

Link = require("./Link");

utilities = require("./utilities");

System = (function() {
  var mousedownHandler, mousemoveHandler, mouseupHandler;

  function System(attr, data) {
    var that;
    this.data = data;
    this.W = attr.width;
    this.H = attr.height;
    this.BG = attr.backgroundColour;
    this.metaboliteRadius = attr.metaboliteRadius;
    this.useStatic = attr.useStatic;
    this.everything = attr.everything;
    this.hideObjective = attr.hideObjective;
    this.currentActiveNode = null;
    this.nodes = new Array();
    this.links = new Array();
    this.clientX = 0;
    this.clientY = 0;
    this.exclusions = new Array();
    this.force = null;
    that = this;
    this.viewController = new ViewController("canvas", this.W, this.H, this.BG, this);
    if (this.data != null) {
      this.buildMetabolites(this.data);
      this.buildReactions(this.data);
      this.populateOptions(this.nodes);
    }
    this.initalizeForce();
  }

  System.prototype.populateOptions = function(nodes) {
    var j, len, node, results, source, target;
    source = d3.select("#source");
    target = d3.select("#target");
    results = [];
    for (j = 0, len = nodes.length; j < len; j++) {
      node = nodes[j];
      source.append("option").attr("value", node.id).text(node.name);
      results.push(target.append("option").attr("value", node.id).text(node.name));
    }
    return results;
  };

  System.prototype.addMetabolite = function(id, name, type) {
    var metabolite, nodeAttributes;
    nodeAttributes = {
      x: utilities.rand(this.W),
      y: utilities.rand(this.H),
      r: this.metaboliteRadius,
      name: name,
      id: id,
      type: type
    };
    metabolite = new Metabolite(nodeAttributes, this.viewController.ctx);
    d3.select("#sou rce").append("option").attr("value", id).text(name);
    d3.select("#target").append("option").attr("value", id).text(name);
    this.nodes.push(metabolite);
    return this.force.start();
  };

  System.prototype.addReaction = function(source, target, name) {
    var j, len, linkAttr, node, reaction, reactionAttributes, ref, src, tgt;
    ref = this.nodes;
    for (j = 0, len = ref.length; j < len; j++) {
      node = ref[j];
      if (node.id === source.id && node.name === node.name) {
        src = node;
      } else if (node.id === target.id && node.name === node.name) {
        tgt = node;
      }
    }
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
      return this.links.push(new Link(linkAttr, this.viewController.ctx));
    } else if (src.type === "m" && tgt.type === "m") {
      reactionAttributes = {
        x: utilities.rand(this.W),
        y: utilities.rand(this.H),
        r: 5,
        name: name,
        id: name,
        type: "r",
        flux_value: 0,
        colour: "rgb(" + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ")"
      };
      reaction = new Reaction(reactionAttributes, this.viewController.ctx);
      this.nodes.push(reaction);
      linkAttr = {
        id: source.id + "-" + reaction.id,
        source: src,
        target: reaction,
        fluxValue: 0,
        r: this.metaboliteRadius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      this.links.push(new Link(linkAttr, this.viewController.ctx));
      linkAttr = {
        id: reaction.id + "-" + target.id,
        source: reaction,
        target: tgt,
        fluxValue: 0,
        r: this.metaboliteRadius,
        linkScale: utilities.scaleRadius(null, 1, 5)
      };
      return this.links.push(new Link(linkAttr, this.viewController.ctx));
    } else {
      return alert("Invalid linkage");
    }
  };

  System.prototype.initalizeForce = function() {
    var j, len, n, ref;
    this.force = d3.layout.force().nodes(this.nodes).links(this.links).size([this.W, this.H]).linkStrength(2).friction(0.9).linkDistance(this.linkDistanceHandler).charge(this.chargeHandler).gravity(0.1).theta(0.8).alpha(0.1).on("tick", this.viewController.tick.bind(this)).start();
    if (this.useStatic) {
      ref = this.nodes;
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        this.force.tick();
      }
      return this.force.stop();
    }
  };

  System.prototype.linkDistanceHandler = function(link, i) {
    var factor;
    factor = 0;
    if (link.target.type === 'r') {
      factor = link.target.substrates.length;
    } else if (link.source.type === 'r') {
      factor = link.source.products.length;
    }
    return factor * 100;
  };

  System.prototype.chargeHandler = function(node, i) {
    var factor;
    factor = node.inNeighbours.length + node.outNeighbours.length + 1;
    return factor * -100;
  };

  System.prototype.tick = function() {};

  System.prototype.checkCollisions = function(x, y) {
    var j, len, node, nodeReturn, ref;
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

  System.prototype.deleteNode = function(node) {
    var inNeighbour, j, k, len, len1, nodeIndex, outNeighbour, ref, ref1;
    this.exclusions.push(node);
    node.deleted = true;
    ref = node.inNeighbours;
    for (j = 0, len = ref.length; j < len; j++) {
      inNeighbour = ref[j];
      nodeIndex = inNeighbour.outNeighbours.indexOf(node);
      inNeighbour.outNeighbours.splice(nodeIndex, 1);
    }
    ref1 = node.outNeighbours;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      outNeighbour = ref1[k];
      nodeIndex = outNeighbour.inNeighbours.indexOf(node);
      outNeighbour.inNeighbours.splice(nodeIndex, 1);
    }
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

  mousedownHandler = function(e) {
    var tPt;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    tPt = this.viewController.transformedPoint(e.clientX, e.clientY);
    this.checkCollisions(tPt.x, tPt.y, e);
    if (this.currentActiveNode != null) {
      $('#nodetext').removeClass('showing');
      return window.fba.isDraggingNode = true;
    }
  };

  mouseupHandler = function(e) {
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    window.fba.isDraggingNode = false;
    return this.currentActiveNode = null;
  };

  mousemoveHandler = function(e) {
    var tPt;
    e.preventDefault();
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    tPt = this.viewController.transformedPoint(e.clientX, e.clientY);
    if (window.fba.isDraggingNode) {
      this.currentActiveNode.x = tPt.x;
      this.currentActiveNode.y = tPt.y;
      return this.nodetext.css({
        'left': e.clientX,
        'top': e.clientY
      });
    } else {
      return this.checkCollisions(tPt.x, tPt.y, e);
    }
  };

  System.prototype.buildMetabolites = function(model) {
    var exclusion, j, k, len, len1, metabolite, nodeAttributes, ref, ref1, results;
    ref = model.metabolites;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      metabolite = ref[j];
      if (metabolite.id.toString() === "Zn2tex") {
        console.log("heress");
      }
      ref1 = this.exclusions;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        exclusion = ref1[k];
        if (metabolite.id.toString() === exclusion.id.toString()) {
          console.log("here");
        }
      }
      nodeAttributes = {
        x: utilities.rand(this.W),
        y: utilities.rand(this.H),
        r: this.metaboliteRadius,
        name: metabolite.name,
        id: metabolite.id,
        type: "m"
      };
      results.push(this.nodes.push(new Metabolite(nodeAttributes, this.viewController.ctx)));
    }
    return results;
  };

  System.prototype.buildReactions = function(model) {
    var j, k, l, len, len1, len2, link, linkAttr, metabolite, nodesMap, radiusScale, reaction, reactionAttributes, ref, ref1, results, source, target, tempLinks;
    radiusScale = utilities.scaleRadius(model, 5, 15);
    tempLinks = new Array();
    ref = model.reactions;
    for (j = 0, len = ref.length; j < len; j++) {
      reaction = ref[j];
      if (this.everything || reaction.flux_value > 0) {
        reactionAttributes = {
          x: utilities.rand(this.W),
          y: utilities.rand(this.H),
          r: radiusScale(reaction.flux_value),
          name: reaction.name,
          id: reaction.id,
          type: "r",
          flux_value: reaction.flux_value,
          colour: "rgb(" + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ", " + (utilities.rand(255)) + ")"
        };
        if (this.hideObjective) {
          if (reactionAttributes.name.indexOf('objective function') !== -1) {
            continue;
          }
        }
        this.nodes.push(new Reaction(reactionAttributes, this.viewController.ctx));
        ref1 = Object.keys(reaction.metabolites);
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          metabolite = ref1[k];
          source = null;
          target = null;
          if (reaction.metabolites[metabolite] > 0) {
            source = reaction.id;
            target = metabolite;
          } else {
            source = metabolite;
            target = reaction.id;
          }
          link = {
            id: source + "-" + target,
            source: source,
            target: target,
            flux_value: reaction.flux_value
          };
          tempLinks.push(link);
        }
      }
    }
    nodesMap = utilities.nodeMap(this.nodes);
    results = [];
    for (l = 0, len2 = tempLinks.length; l < len2; l++) {
      link = tempLinks[l];
      linkAttr = {
        id: link.id,
        source: this.nodes[nodesMap[link.source]],
        target: this.nodes[nodesMap[link.target]],
        fluxValue: link.flux_value,
        r: this.metaboliteRadius,
        linkScale: utilities.scaleRadius(model, 1, 5)
      };
      results.push(this.links.push(new Link(linkAttr, this.viewController.ctx)));
    }
    return results;
  };

  return System;

})();

window.FBA = {
  System: System
};

module.exports = System;


},{"./Link":1,"./Metabolite":2,"./Node":3,"./Reaction":4,"./ViewController":6,"./utilities":8}],6:[function(require,module,exports){
var ViewController;

ViewController = (function() {
  var mousedownHandler, mousemoveHandler, mouseupHandler, mousewheelHandler;

  function ViewController(id, width, height, BG, system) {
    var that;
    this.id = id;
    this.width = width;
    this.height = height;
    this.BG = BG;
    this.system = system;
    this.c = document.createElement("canvas");
    this.c.id = this.id;
    this.c.width = this.width;
    this.c.height = this.height;
    this.currentActiveNode = null;
    this.isDraggingNode = false;
    this.clientX = 0;
    this.clientY = 0;
    this.c.addEventListener("mousewheel", mousewheelHandler.bind(this), false);
    this.c.addEventListener("mousedown", mousedownHandler.bind(this), false);
    this.c.addEventListener("mouseup", mouseupHandler.bind(this), false);
    this.c.addEventListener("mousemove", mousemoveHandler.bind(this), false);
    document.body.appendChild(this.c);
    this.nodetext = $('#nodetext');
    $(this.id).css({
      "-moz-user-select": "none",
      "-webkit-user-select": "none",
      "-ms-user-select": "none",
      "user-select": "none",
      "-o-user-select": "none",
      "unselectable": "on"
    });
    that = this;
    $('#nodetext').click(function() {
      return this.system.deleteNode(that.currentActiveNode);
    });
    $('#addMetabolite').click(function() {
      return this.system.addMetabolite($('#metab_id').val().trim(), $('#metab_name').val().trim(), "m");
    });
    $("#addReaction").click(function() {
      var source, target;
      source = {
        id: $('#source').val().trim(),
        name: $('#source :selected').text()
      };
      target = {
        id: $('#target').val().trim(),
        name: $('#target :selected').text()
      };
      return this.system.addReaction(source, target, $("#reaction_name").val());
    });
    this.ctx = document.getElementById(this.id).getContext("2d");
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.xform = this.svg.createSVGMatrix();
    this.dragStart = null;
    this.dragScaleFactor = 1.5;
    this.lastX = Math.floor(this.width / 2);
    this.lastY = Math.floor(this.width / 2);
    this.startAnimate();
  }

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
    this.system.checkCollisions(tPt.x, tPt.y);
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
      return this.currentActiveNode = this.system.checkCollisions(tPt.x, tPt.y);
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
    var delta, factor, pt, wheel, zoom;
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

  ViewController.prototype.appendText = function(node) {
    var product, products, substrate, substrates;
    this.nodetext.addClass('showing');
    this.nodetext.css({
      'left': e.clientX,
      'top': e.clientY
    });
    if (node.type === 'r') {
      substrates = (function() {
        var i, len, ref, results;
        ref = node.substrates;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          substrate = ref[i];
          results.push(substrate.name);
        }
        return results;
      })();
      products = (function() {
        var i, len, ref, results;
        ref = node.products;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          product = ref[i];
          results.push(product.name);
        }
        return results;
      })();
      this.nodetext.html(substrates + " --- (" + node.name + ") ---> " + products + "<br>");
    } else {
      this.nodetext.html(node.name + "<br>");
    }
    return this.nodetext.append("Click above text to delete node (WIP)");
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
    ref = this.system.links;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      link.draw();
    }
    ref1 = this.system.nodes;
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


},{}],7:[function(require,module,exports){
var System, system, systemAttributes;

System = require("./System");

systemAttributes = {
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColour: "white",
  metaboliteRadius: 10,
  useStatic: false,
  everything: false,
  hideObjective: true
};

system = new System(systemAttributes, data);


},{"./System":5}],8:[function(require,module,exports){
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

module.exports = {
  rand: rand,
  scaleRadius: scaleRadius,
  nodeMap: nodeMap
};


},{}]},{},[1,2,3,4,5,6,7,8])


//# sourceMappingURL=maps/bundle-coffee.js.map