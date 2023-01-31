/**
 * Globális metódusok létrehozásáért felelős osztály
 */
class GlobalFunctions {

    /**
     * Globális metódusok létrehozása
     * @param pigeon : Pigeon Pigeon egy példánya
     */
    static setup(pigeon) {
        /**
         * Függvény belépésének követése
         * @param args Függvény tulajdonságai
         * @returns {{file: *, stackId: *, name: *, fnLine: *, ts: number}}
         * @private
         */
        global.__nestEntry__ = function (args) {
            try {
                return pigeon.tracer.onEntry(args);
            } catch (exception) {
                pigeon.log('ERROR: Exception on tracer entry:', exception);
            }
        };

        /**
         * Függvény kilépésének követése
         * @param args Függvény tulajdonságai
         * @private
         */
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