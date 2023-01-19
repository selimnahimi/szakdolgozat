const Module = require('module');

class Code {
    source;
    wrapped;

    constructor(source) {
        this.source = source;
        this.#checkWrapped();
    }

    wrap() {
        if (this.wrapped) return;

        this.source = Module.wrapper[0] + '\n' + this.source + Module.wrapper[1];
        this.wrapped = true;
    }

    unwrap() {
        if (!this.wrapped) return;

        this.source = this.source.substring(Module.wrapper[0].length, this.source.length - Module.wrapper[1].length);
        this.wrapped = false;
    }

    #checkWrapped() {
        this.wrapped = this.source.startsWith(Module.wrapper[0]);
    }
}

module.exports = Code;