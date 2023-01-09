const util = require('util');

class Logger {
    stdout = process.stdout;
    stdoutFn = process.stdout.write;

    write() {
        if (this.isInvalid()) return;

        let message = util.format.apply(this, arguments) + '\n';
        this.stdoutFn.call(this.stdout, message);
    }

    print(content) {
        if (this.isInvalid()) return;

        this.stdoutFn.call(this.stdout, content);
    }

    isInvalid() {
        return this.stdout === null;
    }
}

exports.Logger = Logger;