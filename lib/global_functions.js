class GlobalFunctions {
    static setup(pigeon) {
        global.__nestEntry__ = function (args) {
            try {
                return pigeon.tracer.onEntry(args);
            } catch (exception) {
                pigeon.log('ERROR: Exception on tracer entry:', exception);
            }
        };

        global.__nestExit__ = function (args) {
            try {
                pigeon.tracer.onExit(args);
            } catch (exception) {
                pigeon.log('ERROR: Exception on tracer exit:', exception);
            }
        };
    }
}

module.exports = GlobalFunctions;