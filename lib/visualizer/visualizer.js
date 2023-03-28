const Graphviz = require('graphviz');

class Visualizer {
    pigeon;

    constructor(pigeon) {
        this.pigeon = pigeon;
    }

    visualize() {
        let g = Graphviz.digraph("G");
        let n1 = g.addNode( "Hello", {"color" : "blue"} );
        n1.set( "style", "filled" );
        g.addNode( "World" );

        let e = g.addEdge( n1, "World" );
        e.set( "color", "red" );

        g.output( "png", "test01.png" );
    }
}

module.exports = Visualizer;