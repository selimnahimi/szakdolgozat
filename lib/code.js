const Module = require('module');

/**
 * Kódrészletet tartalmazó osztály
 */
class Code {
    /**
     * Forráskód
     * @type {string}
     */
    source;

    /**
     * Ez a kódrészlet modulként van beágyazva?
     * @type {boolean}
     */
    isWrapped;

    constructor(source) {
        this.source = source;
        this.#checkWrapped();
    }

    /**
     * Beágyazás modulként
     */
    wrap() {
        if (this.isWrapped) return;

        this.source = Module.wrapper[0] + '\n' + this.source + Module.wrapper[1];
        this.isWrapped = true;
    }

    /**
     * Modul beágyazás megszüntetése
     */
    unwrap() {
        if (!this.isWrapped) return;

        this.source = this.source.substring(Module.wrapper[0].length, this.source.length - Module.wrapper[1].length);
        this.isWrapped = false;
    }

    /**
     * Code létrehozása a szintaxis fa egy csúcsából
     * @param node A szintaxis fa egy csúcsa
     * @returns {Code}
     */
    static fromNode(node) {
        return new Code(node.source());
    }

    /**
     * Ez a kódrészlet be van ágyazva?
     */
    #checkWrapped() {
        this.isWrapped = this.source.startsWith(Module.wrapper[0]);
    }
}

module.exports = Code;