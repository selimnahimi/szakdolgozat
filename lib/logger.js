const util = require('util');

class Logger {
    stdout;
    stdoutFn;
    
    constructor(stdout, stdoutFn) {
        this.stdout = stdout;
        this.stdoutFn = stdoutFn;
    }

    write() {
        if (this.isInvalid()) return;

        let message = util.format.apply(this, arguments) + '\n';
        this.callStdoutFn(message);
    }

    print(message) {
        if (this.isInvalid()) return;

        this.callStdoutFn(message);
    }

    callStdoutFn(message) {
        this.stdoutFn.call(this.stdout, message);
    }

    isInvalid() {
        return this.stdout === null;
    }
}

exports.Logger = Logger;