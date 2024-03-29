const EventEmitter = require('events').EventEmitter;
const Module = require('module');
const Instrument = require('./lib/instrument');
const GlobalFunctions = require('./lib/global_functions');
const Visualizer = require('./lib/visualizer/visualizer');
const Logger = require('./lib/logger');
const Tracer = require('./lib/tracer');
const Code = require('./lib/code');
const JSONHandler = require('./lib/jsonhandler');
const path = require("path");

/**
 * Az osztály, ami a folyamat elindításáért felelős
 * @extends EventEmitter
 */
class Pigeon extends EventEmitter {
    /**
     * Verzió azonosító
     * @type {string}
     */
    version = 'pre-0.0.1';

    /**
     * Logolásért felelős osztály
     * @type {Logger}
     */
    logger = new Logger(process.stdout, process.stdout.write);

    /**
     * Követő metódusokért felelős osztály
     * @type {Tracer}
     */
    tracer = new Tracer(this);
    instrument = new Instrument(this);
    visualizer = new Visualizer(this);

    constructor() {
        super();
        this.inject();
    }

    /**
     * Forráskód injektálás végrehajtása
     */
    inject() {
        this.log(`-- pigeon ${this.version} --`);
        this.log('kimeneti JSON fájlok létrehozása');
        JSONHandler.createAllJSONFiles();
        this.log('compile felülírása');
        this.alterCompile();
        this.setupGlobalFunctions();
    }

    /**
     * Fordítás felülírása instrumentálás segítségével
     */
    alterCompile() {
        let self = this;
        let original = Module.prototype._compile;

        Module.prototype._compile = function(content, filename) {
            let relativeFilename = path.relative( __dirname, filename ).replaceAll("\\", "/");

            // Beágyazás
            let code = new Code(content);
            code.wrap();

            // Instrumentálás
            code.source = self.instrument.inject(relativeFilename, code);

            // Megágyazás
            code.unwrap();

            // Eredeti működés megtartása
            original.call(this, code.source, filename);

            JSONHandler.calculateCombinedJSON();
        }
    }

    /**
     * Globális függvények beállítása
     */
    setupGlobalFunctions() {
        GlobalFunctions.setup(this);
    }

    /**
     * Logolást végző metódus
     */
    log() {
        if (!this.logger) return;

        this.logger.print('pigeon: ');
        this.logger.write.apply(this.logger, arguments);
    }
}

exports.default = new Pigeon();