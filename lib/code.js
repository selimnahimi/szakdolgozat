const Module = require('module');

class Code {
    source;
    isWrapped;

    constructor(source) {
        this.source = source;
        this.#checkWrapped();
    }

    wrap() {
        if (this.isWrapped) return;

        this.source = Module.wrapper[0] + '\n' + this.source + Module.wrapper[1];
        this.isWrapped = true;
    }

    unwrap() {
        if (!this.isWrapped) return;

        this.source = this.source.substring(Module.wrapper[0].length, this.source.length - Module.wrapper[1].length);
        this.isWrapped = false;
    }

    static fromNode(node) {
        return new Code(node.source());
    }

    #checkWrapped() {
        this.isWrapped = this.source.startsWith(Module.wrapper[0]);
    }
}

module.exports = Code;