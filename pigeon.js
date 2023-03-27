const EventEmitter = require('events').EventEmitter;
const Module = require('module');
const Instrument = require('./lib/instrument');
const GlobalFunctions = require('./lib/global_functions');
const Logger = require('./lib/logger');
const Tracer = require('./lib/tracer');
const Code = require('./lib/code');
const Graphviz = require('graphviz');

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
    tracer = new Tracer();

    constructor() {
        super();
        this.inject();
    }

    /**
     * Forráskód injektálás végrehajtása
     */
    inject() {
        let g = Graphviz.digraph("G");
        let n1 = g.addNode( "Hello", {"color" : "blue"} );
        n1.set( "style", "filled" );
        g.addNode( "World" );

        let e = g.addEdge( n1, "World" );
        e.set( "color", "red" );

        g.output( "png", "test01.png" );

        this.log(`-- pigeon ${this.version} --`);
        this.log('compile felülírása');
        this.alterCompile();
        this.setupGlobalFunctions();
    }

    /**
     * Fordítás felülírása instrumentálás segítségével
     */
    alterCompile() {
        let original = Module.prototype._compile;

        Module.prototype._compile = function(content, filename) {
            // Beágyazás
            let code = new Code(content);
            code.wrap();

            // TODO: Instrumentálás
            code.source = Instrument.inject(filename, code);

            // Megágyazás
            code.unwrap();

            original.call(this, code.source, filename);
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