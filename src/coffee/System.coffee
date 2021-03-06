# **Classes**
SubSystem      = require "./SubSystem"
ViewController = require "./ViewController"
Compartment    = require "./Compartment"
Graph          = require './Graph'
TreeNode       = require './TreeNode'

creators = require './creators'
deletors = require './deletors'
addors   = require './addors'

builders = require './builders'

class System
    constructor: (@attr, data, sortables) ->
        sortables.index+= 1

        @id = @attr.id
        @name = @attr.name
        @type = @attr.type
        # Setting up ViewController
        @viewController = new ViewController("canvas", @attr.width, @attr.height, @attr.backgroundColour, null)

        # Settings for hiding certain Reactions
        @everything = @attr.everything
        @hideObjective = @attr.hideObjective
        @metaboliteRadius = @attr.metaboliteRadius
        # console.log(data)

        # The "full resolution" set of Metabolites and Reactions for this System
        [@metabolites, @reactions] = @buildMetabolitesAndReactions(data.metabolites, data.reactions)

        @graph = new Graph(@id, @name)

        compartmentor = builders[@type].compartmentor.bind(this)
        sortor = builders[@type].sortor.bind(this)

        # Mutates @graph
        @buildGraph(compartmentor, sortor)

        @graph.value = new SubSystem(@graph, @metaboliteRadius, @attr.width, @attr.height, @viewController.ctx)

        if @type is sortables.start
            @graph.value.initalizeForce()
            @viewController.startCanvas(@graph.value)

        if @type is sortables.sortables[sortables.index]
            for system of @graph.outNeighbours
                if system isnt 'e' and not sortables.index + 1 is sortables.sortables.length
                    attr = JSON.parse(JSON.stringify(@attr))
                    attr.id = sortables.sortables[sortables.index+1]
                    attr.name =  sortables.sortables[sortables.index+1]
                    attr.type = sortables.sortables[sortables.index+1]
                    @graph.outNeighbours[system].value = new System(attr, data, sortables)
        else
            console.log('reached end')


        if @type is sortables.sortables[0]
            console.log(this)


    buildMetabolitesAndReactions: (metaboliteData, reactionData) ->
        metabolites = new Object()
        reactions = new Object()

        # Loop through each metabolites in the metabolic model provided
        for metabolite in metaboliteData
            # Create a new Metabolite object using the current metabolite
            m = @createMetabolite(metabolite.name, metabolite.id, @metaboliteRadius, false, @viewController.ctx)
            # Store current Metabolite in metabolites dictionary
            m.species = metabolite.species
            metabolites[metabolite.id] = m

        # Loop through each reaction
        for reaction in reactionData
            # Create 'filters' later
            # Skip if flux is 0 or if reaction name containes 'objective function'
            if (not @everything and reaction.flux_value is 0)
                continue
            if (@hideObjective and reaction.name.indexOf('objective function') isnt -1 )
                continue

            # Create fresh Reaction object
            # Push links into Reaction object
            reactions[reaction.id] = @createReaction(reaction.name, reaction.id, 20, 0,@viewController.ctx)
            r = reactions[reaction.id]
            r.species = reaction.species
            for metaboliteId of reaction.metabolites
                if reaction.metabolites[metaboliteId] > 0
                    source = reaction.id
                    target = metaboliteId
                    r.addLink(@createLink(reactions[source], metabolites[target], reaction.name, reaction.flux_value, @metaboliteRadius, @viewController.ctx))
                else
                    source = metaboliteId
                    target = reaction.id
                    r.addLink(@createLink(metabolites[source], reactions[target], reaction.name, reaction.flux_value, @metaboliteRadius, @viewController.ctx))

        return [metabolites, reactions]

    buildGraph: (compartmentor, sortor) ->
        compartmentor()
        sortor()

    createReaction: creators.createReaction

    createMetabolite: creators.createMetabolite

    createLink: creators.createLink

    deleteNode : deletors.deleteNode

module.exports = System

# Expose API to global namespace
window.FBA =
    System: System
