const Syntax = require("./syntax");

class InstrumentUtils {
    static allowedNodeTypes = [
        Syntax.ExpressionStatement,
        Syntax.VariableDeclaration
    ]

    static shouldCover(node) {
        return this.allowedNodeTypes.includes(node.type);
    }

    static countStatement(node, collection) {
        if (!this.shouldCover(node)) return;

        if (node.type in collection) {
            collection[node.type].push(node)
        } else {
            collection[node.type] = [node];
        }
    }
}

module.exports = InstrumentUtils;