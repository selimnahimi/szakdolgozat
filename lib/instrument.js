const esparse = require('./esparse');
const Syntax = require('./syntax');
const InstrumentUtils = require('./instrument_utils');
const util = require('util');
const JSONHandler = require("./jsonhandler");
const path = require("path");

/**
 * Instrumentálásért felelős osztály
 */
class Instrument {
    pigeon;

    constructor(pigeon) {
        this.pigeon = pigeon;
    }

    /**
     * Instrumentáló eszközök injektálása
     * @param filename Fájl, ahonnan a forráskód származik
     * @param code Kódrészlet
     * @returns string Instrumentált forráskód
     */
    inject(filename, code) {
        let self = this;

        let result = esparse(code.source, {range: true, loc: true, ecmaVersion: 10}, function processNode(node) {
            let lineStart = code.isWrapped ? node.loc.start.line - 1 : node.loc.start.line;
            let lineEnd = code.isWrapped ? node.loc.end.line - 1 : node.loc.end.line;
            let colStart = node.loc.start.column;
            let colEnd = node.loc.end.column;

            let functionName = InstrumentUtils.getFunctionName(node);
            if (functionName) {
                let {functionDeclaration, functionBody} = self.#splitFunction(node);

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
            } else if (node.type === Syntax.ReturnStatement && (!code.isWrapped || !InstrumentUtils.isOnWrapperFunction(node))) {
                if (node.argument) {
                    let tempVar = InstrumentUtils.generateTempVariable();
                    let traceExit = InstrumentUtils.traceExit('false', lineStart, tempVar);

                    node.update('{\nlet ' + tempVar + ' = (' + node.argument.source() + ');\n' + traceExit + '\nreturn ' + tempVar + ';\n}');
                } else {
                    let traceExit = InstrumentUtils.traceExit('false', lineStart, 'null');

                    node.update('{' + traceExit + node.source() + '}');
                }
            } else {
                if(lineStart !== 0 && InstrumentUtils.shouldTraceStatement(node)) {
                    let parentFunctionId = InstrumentUtils.getFunctionParentId(node, filename, code.isWrapped);
                    let statementId = InstrumentUtils.generateStatementId(node, filename, lineStart);

                    let traceStatement = InstrumentUtils.traceStatement(node, filename, parentFunctionId, lineStart, lineEnd, colStart, colEnd);
                    node.update(traceStatement + node.source());

                    let object = JSONHandler.loadStaticJSON();
                    let statementObject = InstrumentUtils.generateStatementTraceObject(node, filename, parentFunctionId, lineStart, lineEnd, colStart, colEnd);

                    if (object.functions[parentFunctionId] === undefined) {
                        object.functions[parentFunctionId] = {};
                    }

                    object.functions[parentFunctionId][statementId] = statementObject;

                    JSONHandler.saveStaticJSON(object);
                }
            }
        });

        return result.toString();
    }

    /**
     * Függvény szelése deklarációra és testre
     * @param node A szintaxis fa egy olyan csúcsa, amely biztosan egy függvényt tartalmaz
     * @returns {{functionDeclaration: string, functionBody: string}} Függvény deklaráció és test, különszedve
     * @private
     */
    #splitFunction(node) {
        let functionDeclaration = InstrumentUtils.getFunctionDeclaration(node);
        let functionBody = InstrumentUtils.getFunctionBody(node);

        if (InstrumentUtils.isBlockStatement(node)) {
            return this.#splitBlockFunction(functionDeclaration, functionBody);
        } else {
            return this.#splitNonBlockFunction(node, functionDeclaration, functionBody);
        }
    }

    /**
     * Olyan függvény szelése, amelynek a teste blokkban található
     * @param functionDeclaration Függvény deklaráció
     * @param functionBody Függvény test
     * @returns {{functionDeclaration: string, functionBody: string}} Függvény deklaráció és test, különszedve
     * @private
     */
    #splitBlockFunction(functionDeclaration, functionBody) {
        functionBody = functionBody.slice(1, functionBody.length - 1);
        return {functionDeclaration, functionBody};
    }

    /**
     * Olyan függvény szelése, amely egy lambda kifejezés, vagy blokk nélküli
     * @param node A szintaxis fa egy olyan csúcsa, amely biztosan egy függvényt tartalmaz
     * @param functionDeclaration Függvény deklaráció
     * @param functionBody Függvény test
     * @returns {{functionBody: string, functionDeclaration: string}} Függvény deklaráció és test, különszedve
     * @private
     */
    #splitNonBlockFunction(node, functionDeclaration, functionBody) {
        let arrowIndex = functionDeclaration.indexOf('=>');
        if (arrowIndex > 0) {
            functionDeclaration = functionDeclaration.substring(0, arrowIndex + 2);
        }

        functionBody = this.#instrumentNonBlockFunction(node, functionBody);

        return {functionDeclaration, functionBody};
    }

    /**
     * Olyan függvény testének instrumentálása, amely egy lambda kifejezés, vagy blokk nélküli
     * @param node A szintaxis fa egy olyan csúcsa, amely biztosan egy függvényt tartalmaz
     * @param functionBody Függvény test
     * @returns {string} Instrumentált függvénytest
     * @private
     */
    #instrumentNonBlockFunction(node, functionBody) {
        let returnLine = InstrumentUtils.getReturnLine(node);
        let tempVar = InstrumentUtils.generateTempVariable();

        let traceExit = InstrumentUtils.traceExit('false', returnLine, tempVar);

        return  '\nlet ' + tempVar + ' = (' + functionBody + ');\n' + traceExit + '\nreturn ' + tempVar + ';\n';
    }
}

module.exports = Instrument;