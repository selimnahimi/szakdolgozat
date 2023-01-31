const esparse = require('./esparse');
const Syntax = require('./syntax');
const InstrumentUtils = require('./instrument_utils');
const util = require('util');

class Instrument {
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

                if (code.isWrapped && node.loc.start.line === 1) {
                    return;
                }

                let args = InstrumentUtils.generateArgList(node);
                let returnLine = InstrumentUtils.getReturnLine(node);

                let traceEntry = InstrumentUtils.traceEntry(
                    JSON.stringify(filename),
                    JSON.stringify(functionName),
                    lineStart, args);

                let traceExit = InstrumentUtils.traceExit(
                    'false',
                    returnLine,
                    'null');

                let newFunctionBody = util.format('\n%s\n%s\n%s\n',
                    traceEntry, functionBody, traceExit);

                node.update(functionDeclaration + '{' + newFunctionBody + '}');
            } else if (node.type === Syntax.ReturnStatement && (!code.isWrapped || InstrumentUtils.isOnWrapperFunction(node))) {
                if (node.argument) {
                    let tempVar = InstrumentUtils.generateTempVariable();
                    let traceExit = InstrumentUtils.traceExit('false', lineStart, tempVar);

                    node.update('{\nlet ' + tempVar + ' = (' + node.argument.source() + ');\n' + traceExit + '\nreturn ' + tempVar + ';\n}');
                } else {
                    let traceExit = InstrumentUtils.traceExit('false', lineStart, 'null');

                    node.update('{' + traceExit + node.source() + '}');
                }
            }

            console.log();
        });

        console.log(statements);

        return result.toString();
    }

    static #splitFunction(node) {
        let functionDeclaration = InstrumentUtils.getFunctionDeclaration(node);
        let functionBody = InstrumentUtils.getFunctionBody(node);

        if (InstrumentUtils.isBlockStatement(node)) {
            return this.#splitBlockFunction(functionDeclaration, functionBody);
        } else {
            return this.#splitNonBlockFunction(node, functionDeclaration, functionBody);
        }
    }

    static #splitBlockFunction(functionDeclaration, functionBody) {
        functionBody = functionBody.slice(1, functionBody.length - 1);
        return {functionDeclaration, functionBody};
    }

    static #splitNonBlockFunction(node, functionDeclaration, functionBody) {
        let arrowIndex = functionDeclaration.indexOf('=>');
        if (arrowIndex > 0) {
            functionDeclaration = functionDeclaration.substring(0, arrowIndex + 2);
        }

        functionBody = this.#instrumentNonBlockFunction(node, functionBody);

        return {functionDeclaration, functionBody};
    }

    static #instrumentNonBlockFunction(node, functionBody) {
        let returnLine = InstrumentUtils.getReturnLine(node);
        let tempVar = InstrumentUtils.generateTempVariable();

        let traceExit = InstrumentUtils.traceExit('false', returnLine, tempVar);

        return  '\nlet ' + tempVar + ' = (' + functionBody + ');\n' + traceExit + '\nreturn ' + tempVar + ';\n';
    }
}

module.exports = Instrument;