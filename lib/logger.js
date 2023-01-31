const util = require('util');

/**
 * Logolásért felelős osztály
 */
class Logger {
    /**
     * Kimeneti csatorna
     */
    stdout;

    /**
     * Kimeneti csatorna metódusa
     */
    stdoutFn;

    constructor(stdout, stdoutFn) {
        this.stdout = stdout;
        this.stdoutFn = stdoutFn;
    }

    /**
     * Üzenet írása a kimeneti csatornára
     */
    write() {
        if (this.isInvalid()) return;

        let message = util.format.apply(this, arguments) + '\n';
        this.callStdoutFn(message);
    }

    /**
     * Üzenet írása a kimeneti csatornára
     * @param message Üzenet
     */
    print(message) {
        if (this.isInvalid()) return;

        this.callStdoutFn(message);
    }

    /**
     * Kimeneti csatorna metódusának hívása üzenettel
     * @param message Üzenet
     */
    callStdoutFn(message) {
        this.stdoutFn.call(this.stdout, message);
    }

    /**
     * Annak eldöntése, hogy a logger megfelelően lett-e beállítva
     * @returns {boolean} Igaz, ha a logger megfelelően be lett állítva
     */
    isInvalid() {
        return this.stdout === null;
    }
}

module.exports = Logger;