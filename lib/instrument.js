const esparse = require('./esparse');
const Syntax = require('./syntax');
const InstrumentUtils = require('./instrument_utils');

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
            }
            
            console.log();
        });

        console.log(statements);

        return result.toString();
    }
}

module.exports = Instrument;