Compartment = require './Compartment'
utilities   = require './utilities'
creators    = require './creators'
force       = require './force'
creators    = require './creators'
Metabolite = require './Metabolite'
ReactionNode = require './ReactionNode'
Link = require './Link'


class SubSystem
    constructor: (data, @W, @H, @ctx) ->
        @nodes = new Array()
        @links = new Array()
        @force = null
        @metaboliteRadius = 10


        @radiusScale = utilities.scaleRadius(null, 5, 15)

        @graph = new Graph()

        @compartments = new Object()


        #step 1
        #split the data for the next children
        #Well create the function here to split the data, but it will be called
        #In treeNode.  Only problem is piecing it back together to send back to
        #back end to 're-optimize' but I dont think that should be a problem, we
        #can have a variable for the added nodes for each subsystem and parse it from there

        #step 2
        #build the graph depending on how you are sorting it by
        #Ill start with step 2
        #@buildGraph()
        #[@metabolites, @reactions] = @buildMetabolitesAndReactions(data.metabolites, data.reactions)
        @buildUnsortedGraph(data.metabolites, data.reactions)

        #for some reason it wont let me do this in CS
        #add all metabolites (being vertices)
        # `
        # for (var it = this.graph.vertices(), kv; !(kv = it.next()).done;) {
        #     value = kv.value[1];
        #     // iterates over all vertices of the graph
        #
        #     this.nodes.push(value)
        # }
        # `
        # #finish off with links
        # `
        # for (var it = this.graph.edges(), kv; !(kv = it.next()).done;) {
        #     var from  = kv.value[0],
        #         to    = kv.value[1],
        #         value = kv.value[2];
        #
        #     this.links.push(this.createLink(this.graph.vertexValue(from), this.graph.vertexValue(to), value, 10, 10, this.ctx))
        #  }
        # `

        #add metabolites
        it = @graph.vertices()

        #add all metabolites and reactions *Sigh*
        while not (kv = it.next()).done
            value = kv.value[1]
            @nodes.push(value)

        #create links

        it = @graph.edges()
        while not (kv = it.next()).done
            from = kv.value[0]
            to = kv.value[1]
            value = kv.value[2]
            @links.push(@createLink(@graph.vertexValue(from), @graph.vertexValue(to), value, 1, 1, @ctx))


        #@intializeForce()






        #QUICK TEST ON Graph



        #
        #
        # # Inject System into utility functions
        # # todo: remove need for injecting
        # creators.createReactionNode = creators.createReactionNode.bind(this)
        # creators.createLeaf = creators.createLeaf.bind(this)
        # creators.createLinks = creators.createLinks.bind(this)
        #force.initalizeForce = force.initalizeForce.bind(this)
        #
        # # Build a compartment for each immidiate outNeighbour
        # for compartment of graph.outNeighbours
        #     @buildCompartments(graph.outNeighbours[compartment])
        # for compartment of graph.outNeighbours
        #     @buildNodesAndLinks(graph.outNeighbours[compartment])

        # delete @compartments
        # delete @reactions
        # delete @radiusScale

        # @initalizeForce()


    #initalizeForce: () ->
        # console.log(@links.length)
        @force = d3.layout.force()
            # The nodes: index,x,y,px,py,fixed bool, weight (# of associated links)
            .nodes(@nodes)
            # The links: mutates source, target
            .links(@links)
            # Affects gravitational center and initial random position
            .size([@W, @H])
            # Sets "rigidity" of links in range [0,1]; func(link, index), this -> force; evaluated at start()
            .linkStrength(2)
            # At each tick of the simulation, the particle velocity is scaled by the specified friction
            .friction(0.9)
            # Target distance b/w nodes; func(link, index), this -> force; evaluated at start()
            .linkDistance(100)
            # Charges to be used in calculation for quadtree BH traversal; func(node,index), this -> force; evaluated at start()
            .charge(100)
            # Sets the maximum distance over which charge forces are applied; \infty if not specified
            #.chargeDistance()
            # Weak geometric constraint similar to a virtual spring connecting each node to the center of the layout's size
            .gravity(0.1)
            # Barnes-Hut theta: (area of quadrant) / (distance b/w node and quadrants COM) < theta => treat quadrant as single large node
            .theta(0.8)
            # Force layout's cooling parameter from [0,1]; layout stops when this reaches 0
            .alpha(0.1)
            # Let's get this party start()ed

    createLink: (src, tgt, name, flux, radius, ctx) ->
        if src.type is "r" and tgt.type is "m"
            # console.log('here')
            linkAttr =
                id        : "#{src.id}-#{tgt.id}"
                source    : src
                target    : tgt
                fluxValue : flux
                r         : radius
                linkScale : utilities.scaleRadius(null, 1, 5)

            return new Link(linkAttr, ctx)
        else if src.type is "m" and tgt.type is "r"
            # console.log(src.type)
            linkAttr =
                id        : "#{src.id}-#{tgt.id}"
                source    : src
                target    : tgt
                fluxValue : flux
                r         : radius
                linkScale : utilities.scaleRadius(null, 1, 5)
            return new Link(linkAttr, ctx)
        else
            linkAttr =
                id        : "#{src.id}-#{tgt.id}"
                source    : src
                target    : tgt
                fluxValue : flux
                r         : radius
                linkScale : utilities.scaleRadius(null, 1, 5)
            return new Link(linkAttr, ctx)

    linkDistanceHandler = (link, i) ->
        # factor = 0
        # if link.target.type is 'r'
        #     factor = link.target.substrates.length
        # else if link.source.type is 'r'
        #     factor = link.source.products.length

        return 1000

    chargeHandler = (node, i) ->
        # factor = node.inNeighbours.length + node.outNeighbours.length + 1
        # factor = node.r*2
        return -8000



    buildUnsortedGraph: (metaboliteData, reactionData) ->

        # Loop through each metabolites in the metabolic model provided
        for metabolite in metaboliteData
            # Create a new Metabolite object using the current metabolite
            m = @createMetabolite(metabolite.name, metabolite.id, @metaboliteRadius, false, @ctx)
            # Store current Metabolite in metabolites dictionary
            m.species = metabolite.species

            @graph.addVertex(metabolite.id, m)

        # Loop through each reaction
        for reaction in reactionData
            # Create 'filters' later
            # Skip if flux is 0 or if reaction name containes 'objective function'
            if (not @everything and reaction.flux_value is 0)
                continue
            if (@hideObjective and reaction.name.indexOf('objective function') isnt -1 )
                continue


            if not @graph.hasVertex(reaction.id)
                #id, name, flux_value
                @graph.addVertex(reaction.id, @createReactionNode(reaction.id, reaction.name, reaction.flux_value, @ctx))
            # r.species = reaction.species
            for metaboliteId of reaction.metabolites
                if reaction.metabolites[metaboliteId] > 0
                    source = reaction.id
                    target = metaboliteId
                    @graph.createNewEdge(source, target, "#{source} -> #{target}")
                else
                    source = metaboliteId
                    target = reaction.id
                    @graph.createNewEdge(source, target, "#{source} -> #{target}")



    # buildCompartments: (graph)->
    #     # Reached a Leaf
    #     if graph.value? and graph.value.type is "r"
    #         return
    #     else
    #         nodeAttributes =
    #             x : utilities.rand(@W)
    #             y : utilities.rand(@H)
    #             r : 150
    #             name : graph.name
    #             id : graph.id
    #             type : "s"
    #             colour: "rgb(#{utilities.rand(255)}, #{utilities.rand(255)}, #{utilities.rand(255)})"
    #         c = new Compartment(nodeAttributes, @ctx)
    #         @compartments[graph.id] = c
    #         @nodes.push(c)
    #         for compartment of graph.outNeighbours
    #             @buildCompartments(graph.outNeighbours[compartment])
    #
    # buildNodesAndLinks: (graph) ->
    #     #reached leaf
    #     if graph.value? and graph.value.type is "r"
    #         #deal with leaf
    #         @createLeaf(graph)
    #     else
    #         for compartment of graph.outNeighbours
    #             @buildNodesAndLinks(graph.outNeighbours[compartment])
    #
    # createLeaf: creators.createLeaf
    #
    # createLinks: creators.createLinks
    #
    # createReactionNode: creators.createReactionNode
    #
    #
    # ## Do we want these here?
    # initalizeForce: force.initalizeForce

    createReactionNode: (id, name, flux_value, ctx) ->

        reactionAttributes =
            x : utilities.rand(@W)
            y : utilities.rand(@H)
            r : 10 #hardcoded like mad right now
            name : name
            id : id
            type : "r"
            flux_value : flux_value
            colour : "rgb(#{utilities.rand(255)}, #{utilities.rand(255)}, #{utilities.rand(255)})"

        r = new ReactionNode(reactionAttributes, ctx)

        return r

    # System injected
    createMetabolite: (name, id, radius, updateOption, ctx) ->
        nodeAttributes =
            x : utilities.rand(@W)
            y : utilities.rand(@H)
            r : radius
            name : name
            id : id
            type : "m"
        metabolite = new Metabolite(nodeAttributes, ctx)
        if updateOption
            @viewController.updateOptions(name, id)
        return metabolite

    createLink: creators.createLink

    checkCollisions: (x, y) ->
        nodeReturn = null

        for node in @nodes
            if node.checkCollision(x,y)
                nodeReturn = node
                node.hover = true
                break
            else
                node.hover = false
        return nodeReturn

module.exports = SubSystem
