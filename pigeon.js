const EventEmitter = require('events').EventEmitter;
const Module = require('module');
const Instrument = require('./lib/instrument');
const GlobalFunctions = require('./lib/global_functions');
const Logger = require('./lib/logger');
const Tracer = require('./lib/tracer');
const Code = require('./lib/code');

class Pigeon extends EventEmitter {
    version = 'pre-0.0.1';
    logger = new Logger(process.stdout, process.stdout.write);
    tracer = new Tracer();

    constructor() {
        super();
        this.inject();
    }

    inject() {
        this.log(`-- pigeon ${this.version} --`);
        this.log('compile felülírása');
        this.alterCompile();
        this.setupGlobalFunctions();
    }

    alterCompile() {
        let original = Module.prototype._compile;

        Module.prototype._compile = function(content, filename) {
            // Beágyazás
            let code = new Code(content);
            code.wrap();

            console.log(code.source);

            // TODO: Instrumentálás
            console.log(Instrument.inject(filename, code));
            code.source = Instrument.inject(filename, code);

            // Megágyazás
            code.unwrap();

            original.call(this, code.source, filename);
        }
    }

    setupGlobalFunctions() {
        GlobalFunctions.setup(this);
    }

    log() {
        if (!this.logger) return;

        this.logger.print('pigeon: ');
        this.logger.write.apply(this.logger, arguments);
    }
}

exports.default = new Pigeon();