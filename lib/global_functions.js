class GlobalFunctions {
    static setup(pigeon) {
        global.__pigeonTraceEntry__ = function (args) {
            try {
                return pigeon.tracer.onEntry(args);
            } catch (exception) {
                pigeon.log('ERROR: Exception on tracer entry:', exception);
            }
        };

        global.__pigeonTraceExit__ = function (args) {
            try {
                pigeon.tracer.onExit(args);
            } catch (exception) {
                pigeon.log('ERROR: Exception on tracer exit:', exception);
            }
        };
    }
}

module.exports = GlobalFunctions;