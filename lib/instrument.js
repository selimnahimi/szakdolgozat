const esparse = require('./esparse');
const Syntax = require('./syntax');
const InstrumentUtils = require('./instrument_utils');
const Code = require('./code');
const util = require('util');

class Instrument {
    static TRACE_EXIT = '__pigeonTraceExit__({entryData: __pigeonEntryData__, exception: %s, line: %s, returnValue: %s});';

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
                let func, dec = Instrument.#splitFunction(node);

                if (InstrumentUtils.isFileWrapped(node)
                    && node.loc.start.line === 1) {
                    return;
                }

                let args = InstrumentUtils.generateArgList(node);

                let traceEntry = util.format(TRACE_ENTRY, JSON.stringify(filename), JSON.stringify(functionName), lineStart, args);
            }

            console.log();
        });

        console.log(statements);

        return result.toString();
    }

    static #splitFunction(node) {
        let functionDec = InstrumentUtils.getFunctionDeclaration(node);
        let functionBody = InstrumentUtils.getFunctionBody(node);

        if (InstrumentUtils.isBlockStatement(node)) {
            return this.#splitBlockFunction(functionDec, functionBody);
        } else {
            return this.#splitNonBlockFunction(node, functionDec, functionBody);
        }
    }

    static #splitBlockFunction(functionDec, functionBody) {
        functionBody = functionBody.slice(1, functionBody.length - 1);
        return {declaration: functionDec, body: functionBody};
    }

    static #splitNonBlockFunction(node, functionDec, functionBody) {
        let arrowIndex = functionDec.indexOf('=>');
        if (arrowIndex > 0) {
            functionDec = functionDec.substring(0, arrowIndex + 2);
        }

        let returnLine = InstrumentUtils.getReturnLine(node);
        let tempVar = InstrumentUtils.generateTempVariable();

        let exitTrace = util.format(Instrument.TRACE_EXIT, 'false', returnLine, tmpVar);

        return {declaration: functionDec, body: functionBody};
    }
}

module.exports = Instrument;