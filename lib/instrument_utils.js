const Syntax = require("./syntax");
const Code = require("./code");
const util = require("util");

/**
 * Instrumentáláshoz használt kellék metódusokat tartalmazó osztály
 */
class InstrumentUtils {
    /**
     * Elfogadott szintaxis fa csúcs típusok
     * @type {Array}
     */
    static allowedNodeTypes = [
        Syntax.ExpressionStatement,
        Syntax.VariableDeclaration
    ]

    /**
     * Függvényt leíró szintaxis fa csúcs típusok
     * @type {Array}
     */
    static functionNodeTypes = [
        Syntax.FunctionDeclaration,
        Syntax.FunctionExpression,
        Syntax.ArrowFunctionExpression
    ]

    /**
     * Függvény kilépés követéséért felelős forráskód sablon
     * @type {string}
     */
    static TRACE_EXIT = '__nestExit__({entryData: __nestEntryData__, exception: %s, line: %s, returnValue: %s});';

    /**
     * Függvény belépés követéséért felelős forráskód sablon
     * @type {string}
     */
    static TRACE_ENTRY = 'let __nestEntryData__ = __nestEntry__({file: %s, name: %s, line: %s, args: %s});';

    /**
     * Annak eldöntése, hogy egy adott szintaxis fa csúcsa be legyen-e gyűjtve lefedettség ellenőrzés végett
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean} Igaz, ha be kell gyűjteni
     */
    static shouldCollect(node) {
        return this.allowedNodeTypes.includes(node.type);
    }

    /**
     * Szintaxis fa csúcsának begyűjtése lefedettség ellenőrzése végett
     * @param node A szintaxis fa egy csúcsa
     * @param collection Gyűjtemény
     */
    static collectNode(node, collection) {
        if (!this.shouldCollect(node)) return;

        if (node.type in collection) {
            collection[node.type].push(node)
        } else {
            collection[node.type] = [node];
        }
    }

    /**
     * Egy függvény deklaráció csúcsból a függvény nevének kinyerése.
     * @param node Egy szintaxis fa csúcsa, ami lehetőleg egy függvény deklarációt tartalmaz
     * @returns {string}
     */
    static getFunctionName(node) {
        if (!this.isFunctionNode(node)) return '';
        if (node.id) return node.id.name;
        if (node.type === Syntax.FunctionDeclaration) return '';

        let parent = node.parent;
        switch (parent.type) {
            case Syntax.AssignmentExpression:
                if (this.#hasLeftRange(parent)) {
                    return this.#getLeftNodeName(parent);
                }
                break;

            case Syntax.VariableDeclarator:
                return this.#getNameFromId(parent);

            case Syntax.CallExpression:
                return this.#getNameFromId(parent.callee);

            default:
                if (this.#isLengthANumber(parent)) {
                    return this.#getNameFromId(parent);
                }

                if (this.#isParentKeyIdentifier(node)) {
                    return parent.key.name;
                }
        }

        return '[Unknown]';
    }

    /**
     * Annak eldöntése, hogy egy adott szintaxis fa csúcs függvény deklaráció-e
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean} Igaz, ha a csúcs egy függvény deklaráció
     */
    static isFunctionNode(node) {
        return (this.functionNodeTypes.includes(node.type)) && node.range;
    }

    /**
     * Annak eldöntése, hogy egy adott csúcs blokk kifejezés-e
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean} Igaz, ha a csúcs egy blokk kifejezést ír le
     */
    static isBlockStatement(node) {
        return node.body.type === Syntax.BlockStatement;
    }

    /**
     * Annak eldöntése, hogy az adott csúcs a modul beágyazást végzi-e
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean} Igaz, ha a csúcs a modul beágyazásáért felelős
     */
    static isOnWrapperFunction(node) {
        let parent = node.parent;
        while (parent) {
            if (this.isFunctionNode(parent)) {
                return parent.loc.start.line === 1;
            }

            parent = parent.parent;
        }

        return true;
    }

    /**
     * Függvény deklarációjának kinyerése
     * @param node A szintaxis fa egy csúcsa
     * @returns {string}
     */
    static getFunctionDeclaration(node) {
        return node.source().slice(0, node.body.range[0] - node.range[0]);
    }

    /**
     * Függvény testének kinyerése
     * @param node A szintaxis fa egy csúcsa
     * @returns {string}
     */
    static getFunctionBody(node) {
        return node.body.source();
    }

    /**
     * Függvény visszatérési sorának kinyerése
     * @param node A szintaxis fa egy csúcsa
     * @returns {number}
     */
    static getReturnLine(node) {
        if (this.isFileWrapped(node)) {
            return node.body.loc.start.line - 1;
        } else {
            return node.body.loc.start.line;
        }
    }

    /**
     * A szintaxis fa tetejének megkeresése egy lejjebb levő csúcson keresztül
     * @param node A szintaxis fa egy csúcsa
     * @returns {node} A szintaxis fa teteje
     */
    static getTopNode(node) {
        let topNode = node;
        while (topNode.parent) {
            topNode = topNode.parent;
        }

        return topNode;
    }

    /**
     * Annak eldöntése, hogy a szintaxis fa, amiben a csúcs szerepel, be van-e ágyazva modulként
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean} Igaz, ha a szintaxis fa, amiben az adott csúcs szerepel, be van ágyazva
     */
    static isFileWrapped(node) {
        let topNode = this.getTopNode(node);
        return Code.fromNode(topNode).isWrapped;
    }

    /**
     * Függvény belépéséért felelős forráskód sablon kitöltése
     * @param fileName Fájl neve
     * @param functionName Függvény neve
     * @param line Függvény kód sorának száma
     * @param args Függvény argumentumai
     * @returns {string} Kitöltött sablon
     */
    static traceEntry(fileName, functionName, line, args) {
        return util.format(this.TRACE_ENTRY, fileName, functionName, line, args);
    }

    /**
     * Függvény kilépéséért felelős forráskód sablon kitöltése
     * @param exception Felmerült hiba
     * @param line Kilépési sor száma
     * @param returnValue Függvény visszatérési értéke
     * @returns {string} Kitöltött sablon
     */
    static traceExit(exception, line, returnValue) {
        return util.format(this.TRACE_EXIT, exception, line, returnValue);
    }

    /**
     * Átmeneti változónév generálása átmeneti adatok tárolására
     * @returns {string} Átmeneti változónév
     */
    static generateTempVariable() {
        return '__traceTmpVar' + Math.floor(Math.random() * 10000) + '__';
    }

    /**
     * Függvény hívási argumentum lista generálása
     * @param node A szintaxis fa egy olyan csúcsa, amely függvényhívást ír le
     * @returns {string} Argumentum lista
     */
    static generateArgList(node) {
        return  '[' + node.params.map(p => {
            if (p.type === Syntax.RestElement) {
                return p.argument.name;
            }

            return p.name;
        }).join(',') + ']';
    }

    /**
     * A szülő csúcs azonosító (`Identifier`) típusú, és tartalmaz kulcs nevet?
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean} Igaz, ha a szülő csúcs azonosító típusú és tartalmaz egy kulcs nevet
     * @private
     */
    static #isParentKeyIdentifier(node) {
        let parent = node.parent;

        return parent.key &&
            parent.key.type === 'Identifier' &&
            parent.value === node &&
            parent.key.name;
    }

    /**
     * Annak eldöntése, hogy a csúcs bal szomszédjának van-e `range` attribútuma
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean}
     * @private
     */
    static #hasLeftRange(node) {
        return node.left.range;
    }

    /**
     * Függvény név kinyerése a csúcs bal szomszédjából
     * @param node A szintaxis fa egy csúcsa, aminek van bal szomszédja
     * @returns {string} Kinyert függvény név
     * @private
     */
    static #getLeftNodeName(node) {
        return node.left.source().replace(/"/g, '\\"');
    }

    /**
     * Függvény nevének kinyerése az `id` paraméter alapján
     * @param node A szintaxis fa egy olyan csúcsa, amely függvény deklarációt ír le
     * @returns {string|'[Unknown]'} A függvény neve, ha az szerepel az `id` paraméterben, másképpen pedig `[Unknown]`
     * @private
     */
    static #getNameFromId(node) {
        return node.id ? node.id.name : '[Unknown]';
    }

    /**
     * Annak eldöntése, hogy egy csúcsnak van-e hossza, és az egy szám-e
     * @param node A szintaxis fa egy csúcsa
     * @returns {boolean} Igaz, ha a csúcsnak van hossza és az szám típusú
     * @private
     */
    static #isLengthANumber(node) {
        return typeof node.length === 'number';
    }
}

module.exports = InstrumentUtils;