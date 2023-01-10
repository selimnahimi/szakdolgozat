const EventEmitter = require('events').EventEmitter;
const Logger = require('./lib/logger').Logger;
const Module = require('module');

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
        Module.prototype._compile = function(content, filename) {
            content = Module.wrapper[0] + '\n' + content + Module.wrapper[1];

            console.log(content);
        }
    }

    log() {
        if (!this.logger) return;

        this.logger.print('pigeon: ');
        this.logger.write.apply(this.logger, arguments);
    }
}

exports.default = new Tracer();