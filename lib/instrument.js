const esparse = require('./esparse');
const Syntax = require('./syntax');
const InstrumentUtils = require('./instrument_utils');
const Code = require('./code');
const util = require('util');

class Instrument {
    static TRACE_EXIT = '__pigeonTraceExit__({entryData: __pigeonEntryData__, exception: %s, line: %s, returnValue: %s});';
    static TRACE_ENTRY = 'let __pigeonEntryData__ = __pigeonTraceEntry__({file: %s, name: %s, line: %s, args: %s});';

    static inject(filename, code) {
        let statements = {};

        let result = esparse(code.source, {range: true, loc: true, ecmaVersion: 10}, function processNode(node) {
            let lineStart = code.isWrapped ? node.loc.start.line - 1 : node.loc.start.line;
            let lineEnd = code.isWrapped ? node.loc.end.line - 1 : node.loc.end.line;

            console.log(node.type);
            console.log(node.source());

            InstrumentUtils.collectNode(node, statements);

            let functionName = InstrumentUtils.getFunctionName(node);
            if (functionName) {
                console.log("FUNCTION NAME: " + functionName);
                let {functionDeclaration, functionBody} = Instrument.#splitFunction(node);

                if (InstrumentUtils.isFileWrapped(node)
                    && node.loc.start.line === 1) {
                    return;
                }

                let args = InstrumentUtils.generateArgList(node);
                let returnLine = InstrumentUtils.getReturnLine(node);

                let traceEntry = util.format(Instrument.TRACE_ENTRY, JSON.stringify(filename), JSON.stringify(functionName), lineStart, args);
                let traceExit = util.format(Instrument.TRACE_EXIT, 'false', returnLine, 'null');

                let newFunctionBody = util.format('\n%s\n%s\n%s\n',
                    traceEntry, functionBody, traceExit);

                node.update(functionDeclaration + '{' + newFunctionBody + '}');
            } else if (node.type === Syntax.ReturnStatement && (!code.isWrapped || InstrumentUtils.isOnWrapperFunction(node))) {
                if (node.argument) {
                    let tempVar = InstrumentUtils.generateTempVariable();

                    let traceExit = util.format(Instrument.TRACE_EXIT, 'false', lineStart, tempVar);
                    node.update('{\nlet ' + tempVar + ' = (' + node.argument.source() + ');\n' + traceExit + '\nreturn ' + tempVar + ';\n}');
                } else {
                    let traceExit = util.format(Instrument.TRACE_EXIT, 'false', lineStart, 'null');
                    node.update('{' + traceExit + node.source() + '}');
                }
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
        return {functionDeclaration: functionDec, functionBody: functionBody};
    }

    static #splitNonBlockFunction(node, functionDec, functionBody) {
        let arrowIndex = functionDec.indexOf('=>');
        if (arrowIndex > 0) {
            functionDec = functionDec.substring(0, arrowIndex + 2);
        }

        let returnLine = InstrumentUtils.getReturnLine(node);
        let tempVar = InstrumentUtils.generateTempVariable();

        let exitTrace = util.format(Instrument.TRACE_EXIT, 'false', returnLine, tempVar);

        functionBody = '\nlet ' + tempVar + ' = (' + functionBody + ');\n' + exitTrace + '\nreturn ' + tempVar + ';\n';

        return {functionDeclaration: functionDec, functionBody: functionBody};
    }
}

module.exports = Instrument;