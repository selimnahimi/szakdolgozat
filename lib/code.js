const Module = require('module');

class Code {
    static wrap(code) {
        return Module.wrapper[0] + '\n' + code + Module.wrapper[1];
    }

    static unwrap(code) {
        return code.substring(Module.wrapper[0].length, code.length - Module.wrapper[1].length);
    }
}

module.exports = Code;