# Canvas
class ViewController
    # **Constructor**
    constructor: (@id, @width, @height, @BG, system) ->
        # Create our `<canvas>` DOM element

        @c = document.createElement("canvas")
        @activeGraph = system
        @network = system
        # Set some attributes
        @c.id     = @id
        @c.width  = @width
        @c.height = @height
        @currentActiveNode = null
        @isDraggingNode = false
        #current mouse position
        @clientX = 0
        @clientY = 0
        # Add event listeners. Bind so we preserve `this`.
        # @c.addEventListener("mousewheel", mousewheelHandler.bind(this), false)
        # @c.addEventListener("mousedown", mousedownHandler.bind(this), false)
        # @c.addEventListener("mouseup", mouseupHandler.bind(this), false)
        # @c.addEventListener("mousemove", mousemoveHandler.bind(this), false)

        # Append it to the DOM
        #tried to disable select, failed misribly.
        document.body.appendChild(@c)
        # Get 2d context
        @ctx = document.getElementById(@id).getContext("2d")
        @nodetext =  $('#nodetext')


    startCanvas:(graph) ->
        @activeGraph = graph
        $(@id).css({
            "-moz-user-select": "none",
            "-webkit-user-select": "none",
            "-ms-user-select" : "none",
            "user-select": "none",
            "-o-user-select": "none",
            "unselectable": "on"
        })

        #temporary
        that = this


        $('#addMetabolite').click(->
            that.activeGraph.nodes.push(
                that.activeGraph.createMetabolite($('#metab_name').val().trim(), $('#metab_id').val().trim(),
                                                    true, that.ctx)
            )
        )
        $("#addReaction").click(->
            source =
                id : $('#source').val().trim()
                name : $('#source :selected').text()
            target =
                id:  $('#target').val().trim()
                name: $('#target :selected').text()
            that.activeGraph.addLink(source, target, $("#reaction_name").val(), 0, that.ctx)
        )



        # SVG Matrix for zooming/panning
        @svg = document.createElementNS("http://www.w3.org/2000/svg","svg")
        @xform = @svg.createSVGMatrix()
        @dragStart = null
        @dragScaleFactor = 1.5
        @lastX = @width // 2
        @lastY = @width // 2
        @activeGraph.force.start()
        @c.addEventListener("mousewheel", mousewheelHandler.bind(this), false)
        @c.addEventListener("mousedown", mousedownHandler.bind(this), false)
        @c.addEventListener("mouseup", mouseupHandler.bind(this), false)
        @c.addEventListener("mousemove", mousemoveHandler.bind(this), false)
        @startAnimate()

    populateOptions: (nodes) ->
        $("#source").html("")
        $("#target").html("")
        source = d3.select("#source")
        target = d3.select("#target")
        for node in nodes
            source.append("option").attr("value", node.id).text(node.name)
            target.append("option").attr("value", node.id).text(node.name)

    updateOptions: (name, id) ->
        d3.select("#source").append("option").attr("value", id).text(name)
        d3.select("#target").append("option").attr("value", id).text(name)

    removeOption: (node) ->
        d3.select("#source").selectAll("option")[0].forEach((d)->
                if  $(d).val() is node.id and $(d).text() is node.name
                    $(d).remove()
            )
        d3.select("#target").selectAll("option")[0].forEach((d)->
                if  $(d).val() is node.id and $(d).text() is node.name
                    $(d).remove()
            )
        $('#nodetext').removeClass('showing');

    transformedPoint: (x, y) ->
        pt = @svg.createSVGPoint()
        pt.x = x
        pt.y = y
        return pt.matrixTransform(@xform.inverse())

    mousedownHandler = (e) ->
        @clientX = e.clientX
        @clientY = e.clientY
        @lastX = e.clientX - @c.offsetLeft
        @lastY = e.clientY - @c.offsetTop

        tPt = @transformedPoint(e.clientX, e.clientY)

        @activeGraph.checkCollisions(tPt.x, tPt.y)
        #pan screen if not dragging node
        if not @currentActiveNode?
            @dragStart = @transformedPoint(@lastX, @lastY)
        else
            $('#nodetext').removeClass('showing');
            @isDraggingNode = true

    # **mousemove**
    mousemoveHandler = (e) ->
        e.preventDefault()
        clientX = e.clientX
        clientY = e.clientY
        # Dragging
        @lastX = e.clientX - @c.offsetLeft
        @lastY = e.clientY - @c.offsetTop
        tPt = @transformedPoint(@lastX, @lastY)
        #pan screen
        if @dragStart? and not @isDraggingNode
            dX = (tPt.x - @dragStart.x) * @dragScaleFactor
            dY = (tPt.y - @dragStart.y) * @dragScaleFactor
            @xform = @xform.translate(dX, dY)
            @ctx.translate(dX, dY)
        #drag node if isDraggingNode
        else if @isDraggingNode
            @currentActiveNode.x = tPt.x
            @currentActiveNode.y = tPt.y
        #Collision detection for non-active nodes
        else
            @currentActiveNode = @activeGraph.checkCollisions(tPt.x, tPt.y)
            if @currentActiveNode?
                @appendText(@currentActiveNode, e)
            else
                $('#nodetext').removeClass('showing');


    # **mouseup**
    mouseupHandler = (e) ->
        e.preventDefault()
        @clientX = e.clientX
        @clientY = e.clientY
        @dragStart = null
        @isDraggingNode = false
        @currentActiveNode = null

    mousewheelHandler = (e) ->
        @clientX = e.clientX
        @clientY = e.clientY

        e.preventDefault()
        # `n` or `-n`
        wheel = e.wheelDelta / 120
        zoom = 1 + wheel / 2

        delta = 0
        if e.wheelDelta?
            delta = e.wheelDelta / 120
        else
            if e.detail?
                delta = -e.detail

        factor = zoom
        pt = @transformedPoint(@lastX, @lastY)

        # Translate,
        @ctx.translate(pt.x, pt.y)
        @xform = @xform.translate(pt.x, pt.y)
        # scale,
        @ctx.scale(factor, factor)
        @xform = @xform.scaleNonUniform(factor, factor)
        if @activeGraph is @network
            for specie in @network.species
                if specie.checkCollision(pt.x, pt.y)
                    #a or d works doesnt matter since we're not doing complicated transofmrations
                    if specie.r*@xform.a >= @c.width and specie.r*@xform.a >=@c.height
                        @network.enterSpecie(specie)
        else
            if @xform.a <= 0.02
                @network.exitSpecie()
        # and translate again.
        @ctx.translate(-pt.x, -pt.y)
        @xform = @xform.translate(-pt.x, -pt.y)

    tick: () ->
        if @currentActiveNode? and @isDraggingNode
            tPt = @canvas.transformedPoint(@clientX, @clientY)
            @currentActiveNode.x = tPt.x
            @currentActiveNode.y = tPt.y

    appendText : (node, e) ->
        @nodetext.addClass('showing')
        @nodetext.css({
            'left': e.clientX,
            'top': e.clientY

        })
        that = this
        if node.type is 'r'
            substrates = (substrate for substrate in node.inNeighbours)
            products = (product for product in node.outNeighbours)
            @nodetext.html("#{substrates} --- (#{node.name}) ---> #{products}<br>")
            @nodetext.append("<button id='delete'>Delete Reaction</button><br>")
        else
            @nodetext.html("#{node.name}<br>")
            @nodetext.append("<button id='delete'>Delete Node</button><br>")
            if node.type is 's'
                @nodetext.append("<button id='enter'>Enter Specie</button><br>")
                $("#enter").click(->
                    that.network.enterSpecie(node)
                )
        if @network isnt @activeGraph
            @nodetext.append("<button id='network'>Return to network</button><br>")
            $("#network").click(->
                that.network.exitSpecie()
            )
        $("#delete").click(->
            that.system.deleteNode(node)
        )

    setActiveGraph: (graph) ->
        @activeGraph.force.stop()
        @activeGraph = graph
        @nodes = @activeGraph.nodes
        @links = @activeGraph.links
        #reset Matrix
        @xform = @svg.createSVGMatrix()
        scale = 0.25 #zoomed out 4x for reset

        if @network is @activeGraph
            @ctx.setTransform(1,0,0,1,0,0)
        else
            @ctx.setTransform(scale,0,0,scale,0,0)
            @xform.a = scale
            @xform.d = scale
            # @xform.translate(-@c.width/2, -@c.height/2)
            # @ctx.translate(-@c.width/2, -@c.height/2)
        @populateOptions(@activeGraph.nodes)

        #we can check later if the force is not null so we dont re-initalize
        @activeGraph.initalizeForce()

        @activeGraph.force.on("tick", @tick.bind(this)).start()
        @activeGraph.force.resume()

    startAnimate: () ->
        # Setup [AnimationFrame](https://github.com/kof/animation-frame)
        AnimationFrame = window.AnimationFrame
        AnimationFrame.shim()
        # Render: to cause to be or become
        @render()
    clear: ->
        @ctx.fillStyle = @BG
        p1 = @transformedPoint(0,0)
        p2 = @transformedPoint(@width, @height)
        @ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
        @ctx.fill()

    draw: ->
        link.draw() for link in @activeGraph.links
        node.draw() for node in @activeGraph.nodes

    render: ->
        stats.begin()
        @clear()
        @draw()
        stats.end()
        # Request next frame
        requestAnimationFrame(@render.bind(this))

module.exports = ViewController
