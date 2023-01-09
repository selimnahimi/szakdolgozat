import EventEmitter from 'events';
import Logger from './lib/logger.js';
import * as util from 'util';

class Tracer extends EventEmitter {
    logger = null;
    constructor() {
        super();
        this.inject();
    }
    inject() {
        this.logger = new Logger();

        this.log("Hello World!");
    }

    log() {
        if (!this.logger) return;

        this.logger.print('tracer: ');
        this.logger.write.apply(this.logger, arguments);
    }
}

export default new Tracer();