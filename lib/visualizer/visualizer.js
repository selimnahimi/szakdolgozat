const Graphviz = require('graphviz');
const VisGraph = require("./vis_graph");

class Visualizer {
    pigeon;
    graph = new VisGraph();

    constructor(pigeon) {
        this.pigeon = pigeon;
    }

    visualize() {
        let g = Graphviz.digraph("G");

        console.log(this.graph.edges.length);

        for (const edge of this.graph.edges) {
            console.log("Adding nodes: " + edge.node1 + ", " + edge.node2)
            let node1 = g.addNode(edge.node1.funcName);
            let node2 = g.addNode(edge.node2.funcName);

            g.addEdge(node1, node2);
        }

        // let n1 = g.addNode( "Hello", {"color" : "blue"} );
        // n1.set( "style", "filled" );
        // g.addNode( "World" );
        //
        // let e = g.addEdge( n1, "World" );
        // e.set( "color", "red" );

        g.output( "png", "test01.png" );
    }
}

module.exports = Visualizer;