class TreeNode
    #parent is a system
    #children is an object of systems
    #value is a system
    constructor: (@id, @subsystem) ->
        @parent = null
        @children = new Object()
        #split the data for the next children
        #call that function in subSystem and then create the children here
        #to allow recrusion


module.exports = TreeNode
