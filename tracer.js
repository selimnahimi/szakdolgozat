const EventEmitter = require('events').EventEmitter;
const Logger = require('./lib/logger').Logger;
const Module = require('module');
const Code = require("./lib/code").Code;

class Tracer extends EventEmitter {
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
            content = Code.wrap(content);

            console.log(content);

            // TODO: Instrumentálás

            // Megágyazás
            content = Code.unwrap(content);

            original.call(this, content, filename);
        }
    }

    log() {
        if (!this.logger) return;

        this.logger.print('pigeon: ');
        this.logger.write.apply(this.logger, arguments);
    }
}

exports.default = new Tracer();