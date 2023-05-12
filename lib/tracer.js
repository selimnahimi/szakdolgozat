const idgen = require('idgen');
const VisNode = require("./visualizer/vis_node");
const VisEdge = require("./visualizer/vis_edge");

/**
 * Kód követésért felelős osztály
 */
class Tracer {
    pigeon;

    constructor(pigeon) {
        this.pigeon = pigeon;
    }

    /**
     * Verem
     * @type {Array}
     */
    stack = [];

    /**
     * Verem részletesebb objektumként tárolva
     * @type {Object}
     */
    stackMap = {};

    /**
     * Verem olvasható és indentált szövegként tárolva
     * @type {string}
     */
    stackString = '';

    /**
     * Függvény belépési argumentumok
     * @type {{args: Object, stack: Array, file: string, line: number, name: string}}
     */
    onEntryArgs = {
        name: '',
        file: '',
        line: 0,
        args: null,
        stack: null
    };

    /**
     * Függvény kilépési argumentumok
     * @type {{exception: boolean|string, stack: Array, file: string, retLine: number, returnValue: null, line: number, name: string, span: number}}
     */
    onExitArgs = {
        name: '',
        file: '',
        line: 0,
        retLine: 0,
        span: 0,
        stack: null,
        exception: false,
        returnValue: null
    };

    /**
     * Függvényhívás verembe vétele és a verem azonosító visszaadása
     * @param stackFrame Függvényhívás olvasható formája
     * @returns {String} Verem azonosító
     */
    pushStack(stackFrame) {
        let stackId = idgen();
        this.stackMap[stackId] = stackFrame;

        let previousStackFrame = this.peekStackFrame();

        let node1 = new VisNode(previousStackFrame);
        let node2 = new VisNode(stackFrame);
        let edge = new VisEdge(node1, node2);

        this.pigeon.visualizer.graph.edges.push(edge);

        this.pigeon.visualizer.visualize();

        this.stack.push(stackId);

        return stackId;
    }

    /**
     * Veremből folyamatos kipakolás addig, amíg el nem érjük a megadott verem azonosítót
     * @param stackId Verem azonosító
     * @returns {string} Függvény visszatérési értéke
     */
    popStack(stackId) {
        let currentStackId;
        do {
            currentStackId = this.stack.pop();
        } while (currentStackId && currentStackId !== stackId);

        let returnValue = this.stackMap[currentStackId];
        if (this.stack.length < 1) {
            this.stackMap = {};
        }

        return returnValue;
    }

    /**
     * Függvénybe belépés követése, verem frissítése a jelenlegi függvény adataival
     * @param args Függvény részletei
     * @returns {{file: string, stackId: String, name, fnLine, ts: number}} Függvény jelenlegi részletei
     */
    onEntry(args) {
        let stackFrame = args.name + '@' + args.file + '::' + args.line;
        let stackId = this.pushStack(stackFrame);

        this.onEntryArgs.name = args.name;
        this.onEntryArgs.file = args.file;
        this.onEntryArgs.line = args.line;
        this.onEntryArgs.args = args.args;
        this.onEntryArgs.stack = this.stack;

        console.log("onEntry:");
        console.log(args);
        this.updateStackString(stackFrame);

        return {
            name: args.name,
            file: args.file,
            fnLine: args.line,
            ts: Date.now(),
            stackId: stackId
        }
    }

    /**
     * Függvényből kilépés követése
     * @param args Függvény részletei
     */
    onExit(args) {
        let ts = Date.now() - args.entryData.ts;
        this.popStack(args.entryData.stackId);

        this.onExitArgs.name = args.entryData.name;
        this.onExitArgs.file = args.entryData.file;
        this.onExitArgs.line = args.entryData.fnLine;
        this.onExitArgs.retLine = args.line;
        this.onExitArgs.span = ts;
        this.onExitArgs.stack = this.stack;
        this.onExitArgs.exception = args.exception;
        this.onExitArgs.returnValue = args.returnValue;

        console.log("onExit:");
        console.log(args);
    }

    /**
     * Verem olvasható szövegéhez hozzáadás
     * @param stackFrame Függvényhívás olvasható formája
     */
    updateStackString(stackFrame) {
        let identation = '  '.repeat(this.stack.length - 1);
        this.stackString += identation + stackFrame + '\n';

        console.log(this.stackString);
    }

    peekStackFrame() {
        let stackId = this.stack[this.stack.length - 1];
        return this.stackMap[stackId] || "base";
    }
}

module.exports = Tracer;