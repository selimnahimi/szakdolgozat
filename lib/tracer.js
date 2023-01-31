const idgen = require('idgen');

class Tracer {
    stack = [];
    stackMap = {};
    stackString = '';
    onEntryArgs = {
        name: '',
        file: '',
        line: 0,
        args: null,
        stack: null
    };
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

    pushStack(stackFrame) {
        let stackId = idgen();
        this.stackMap[stackId] = stackFrame;
        this.stack.push(stackId);

        return stackId;
    }

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

    updateStackString(stackFrame) {
        let identation = '  '.repeat(this.stack.length - 1);
        this.stackString += identation + stackFrame + '\n';

        console.log(this.stackString);
    }
}

module.exports = Tracer;