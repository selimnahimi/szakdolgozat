// const Graphviz = require('graphviz');
const Graphviz = require('ts-graphviz');
const GraphvizAdapter = require('ts-graphviz/adapter');
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

        for (const visedge of this.graph.edges) {
            console.log("Adding nodes: " + visedge.node1.funcName + ", " + visedge.node2.funcName)

            let node1 = new Graphviz.Node(visedge.node1.funcName);
            let node2 = new Graphviz.Node(visedge.node2.funcName);

            let edge = new Graphviz.Edge([node1, node2]);

            g.addNode(node1);
            g.addNode(node2);

            g.addEdge(edge);
        }

        GraphvizAdapter.toFile(Graphviz.toDot(g), './result.png', { format: 'png' });

        // let n1 = g.addNode( "Hello", {"color" : "blue"} );
        // n1.set( "style", "filled" );
        // g.addNode( "World" );
        //
        // let e = g.addEdge( n1, "World" );
        // e.set( "color", "red" );
    }
}

module.exports = Visualizer;