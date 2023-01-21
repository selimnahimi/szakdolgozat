const Syntax = require("./syntax");

class InstrumentUtils {
    static allowedNodeTypes = [
        Syntax.ExpressionStatement,
        Syntax.VariableDeclaration
    ]

    static functionNodeTypes = [
        Syntax.FunctionDeclaration,
        Syntax.FunctionExpression,
        Syntax.ArrowFunctionExpression
    ]

    static shouldCollect(node) {
        return this.allowedNodeTypes.includes(node.type);
    }

    static collectNode(node, collection) {
        if (!this.shouldCollect(node)) return;

        if (node.type in collection) {
            collection[node.type].push(node)
        } else {
            collection[node.type] = [node];
        }
    }

    static getFunctionName(node) {
        if (!this.isFunctionNode(node)) return;
        if (node.id) return node.id;
        if (node.type === Syntax.FunctionDeclaration) return '';

        let parent = node.parent;
        switch (parent.type) {
            case Syntax.AssignmentExpression:
                if (this.#hasLeftRange(parent)) {
                    return this.#getLeftNodeName(parent);
                }
                break;

            case Syntax.VariableDeclarator:
                return this.#getNameFromId(parent);

            case Syntax.CallExpression:
                return this.#getNameFromId(parent.callee);

            default:
                if (this.#isLengthANumber(parent)) {
                    return this.#getNameFromId(parent);
                }

                if (this.#isParentKeyIdentifier(node)) {
                    return parent.key.name;
                }
        }

        return '[Unknown]';
    }

    static isFunctionNode(node) {
        return (node.type in this.functionNodeTypes) && node.range;
    }

    static #isParentKeyIdentifier(node) {
        let parent = node.parent;
        return parent.key && parent.key.type === 'Identifier'
            && parent.value === node && parent.key.name;
    }

    static #hasLeftRange(node) {
        return node.left.range;
    }

    static #getLeftNodeName(node) {
        return node.left.source().replace(/"/g, '\\"');
    }

    static #getNameFromId(node) {
        return node.id ? node.id.name : '[Unknown]';
    }

    static #isLengthANumber(node) {
        return typeof node.length === 'number';
    }
}

module.exports = InstrumentUtils;