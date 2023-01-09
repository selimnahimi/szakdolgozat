const EventEmitter = require('events').EventEmitter;
const Logger = require('./lib/logger').Logger;
const util = require('util');
const Module = require('module');

class Tracer extends EventEmitter {
    logger;

    constructor() {
        super();
        this.inject();
    }

    inject() {
        this.logger = new Logger();

        this.log("Hello World!");

        this.alterCompile();
    }

    log() {
        if (!this.logger) return;

        this.logger.print('tracer: ');
        this.logger.write.apply(this.logger, arguments);
    }

    alterCompile() {
        this.log('Module.prototype._compile módosítása');

        Module.prototype._compile = function(content, filename) {
            content = Module.wrapper[0] + '\n' + content + Module.wrapper[1];

            console.log(content);
        }
    }
}

exports.default = new Tracer();