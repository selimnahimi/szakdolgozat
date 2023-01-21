const Syntax = require("./syntax");

class InstrumentUtils {
    static allowedNodeTypes = [
        Syntax.ExpressionStatement,
        Syntax.VariableDeclaration
    ]

    static shouldCollect(node) {
        return this.allowedNodeTypes.includes(node.type);
    }

    static collectStatements(node, collection) {
        if (!this.shouldCollect(node)) return;

        if (node.type in collection) {
            collection[node.type].push(node)
        } else {
            collection[node.type] = [node];
        }
    }
}

module.exports = InstrumentUtils;