const EventEmitter = require('events').EventEmitter;
const Module = require('module');
const Instrument = require("./lib/instrument");
const Logger = require('./lib/logger');
const Code = require("./lib/code");

class Pigeon extends EventEmitter {
    version = 'pre-0.0.1';
    logger = new Logger(process.stdout, process.stdout.write);

    constructor() {
        super();
        this.inject();
    }

    inject() {
        this.log(`-- pigeon ${this.version} --`);
        this.log('compile felülírása');
        this.alterCompile();
    }

    alterCompile() {
        let tracer = this;
        let original = Module.prototype._compile;

        Module.prototype._compile = function(content, filename) {
            // Beágyazás
            let code = new Code(content);
            code.wrap();

            console.log(code.source);

            // TODO: Instrumentálás

            // Megágyazás
            code.unwrap();

            original.call(this, content, filename);
        }
    }

    log() {
        if (!this.logger) return;

        this.logger.print('pigeon: ');
        this.logger.write.apply(this.logger, arguments);
    }
}

exports.default = new Pigeon();