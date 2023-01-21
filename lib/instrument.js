const esparse = require('./esparse');
const Syntax = require('./syntax');
const InstrumentUtils = require('./instrument_utils');
const Code = require('./code');

class Instrument {
    static inject(filename, code) {
        let statements = {};

        let result = esparse(code.source, {range: true, loc: true, ecmaVersion: 10}, function processNode(node) {
            let lineStart = code.wrapped ? node.loc.start.line - 1 : node.loc.start.line;
            let lineEnd = code.wrapped ? node.loc.end.line - 1 : node.loc.end.line;

            console.log(node.type);
            console.log(node.source());

            InstrumentUtils.collectNode(node, statements);

            let functionName = InstrumentUtils.getFunctionName(node);
            if (functionName) {
                console.log("FUNCTION NAME: " + functionName);
                Instrument.#injectToFunction(node);
            }

            console.log();
        });

        console.log(statements);

        return result.toString();
    }

    static #injectToFunction(node) {
        let functionDec = InstrumentUtils.getFunctionDeclaration(node);
        let functionBody = InstrumentUtils.getFunctionBody(node);

        if (InstrumentUtils.isBlockStatement(node)) {
            functionBody = this.#injectToBlockFunction(functionBody);
        } else {
            functionBody = this.#injectToNonBlockFunction(node, functionDec, functionBody);
        }
    }

    static #injectToBlockFunction(functionBody) {
        return functionBody.slice(1, functionBody.length - 1);
    }

    static #injectToNonBlockFunction(node, functionDec, functionBody) {
        let arrowIndex = functionDec.indexOf('=>');
        if (arrowIndex > 0) {
            functionDec = functionDec.substring(0, arrowIndex + 2);
        }

        let returnLine = InstrumentUtils.getReturnLine(node);
        let tempVar = InstrumentUtils.generateTempVariable();

        return '';
    }
}

module.exports = Instrument;