const Syntax = require("./syntax");
const Code = require("./code");

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
        if (node.id) return node.id.name;
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
        return (this.functionNodeTypes.includes(node.type)) && node.range;
    }

    static isBlockStatement(node) {
        return node.body.type === Syntax.BlockStatement;
    }

    static getFunctionDeclaration(node) {
        return node.source().slice(0, node.body.range[0] - node.range[0]);
    }

    static getFunctionBody(node) {
        return node.body.source();
    }

    static getReturnLine(node) {
        if (this.#isFileWrapped(node)) {
            return node.body.loc.start.line - 1;
        } else {
            return node.body.loc.start.line;
        }
    }

    static #getTopNodeAsCode(node) {
        let currentNode = node;
        while (currentNode.parent) {
            currentNode = currentNode.parent;
        }

        return new Code(currentNode.source());
    }

    static #isFileWrapped(node) {
        return InstrumentUtils.getTopNodeAsCode(node).wrapped;
    }

    static generateTempVariable() {
        return '__traceTmpVar' + Math.floor(Math.random() * 10000) + '__';
    }

    static #isParentKeyIdentifier(node) {
        let parent = node.parent;

        return parent.key &&
            parent.key.type === 'Identifier' &&
            parent.value === node &&
            parent.key.name;
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