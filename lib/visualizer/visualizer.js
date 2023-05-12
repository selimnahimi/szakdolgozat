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

            let node1Name = visedge.node1.funcName.replaceAll('\\', '/');
            let node2Name = visedge.node2.funcName.replaceAll('\\', '/');

            let node1 = new Graphviz.Node(node1Name);
            let node2 = new Graphviz.Node(node2Name);

            let edge = new Graphviz.Edge([node1, node2]);

            g.addNode(node1);
            g.addNode(node2);

            if (!Visualizer.existEdge(g, node1Name, node2Name)) {
                g.addEdge(edge);
            }

        }

        GraphvizAdapter.toFile(Graphviz.toDot(g), './result.png', { format: 'png' });
    }

    static existEdge(digraph, node1, node2) {
        for (const edge of digraph.edges) {
            let edgeNode1 = edge.targets[0];
            let edgeNode2 = edge.targets[1];

            console.log("Edge1: " + edgeNode1.id);
            console.log("Edge2: " + edgeNode2.id);

            if (edgeNode1.id === node1 && edgeNode2.id === node2) {
                return true;
            }
        }

        return false;
    }
}

module.exports = Visualizer;