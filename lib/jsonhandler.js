const fs = require('fs');

/**
 * JSON fájlokat kezelő osztály
 */
class JSONHandler {
    static resultPath = './results/'
    static filePathDynamic = JSONHandler.resultPath + 'dynamic.json';
    static filePathStatic = JSONHandler.resultPath + 'static.json';
    static filePathCombined = JSONHandler.resultPath + 'combined.json';

    static loadJSON(filePath) {
        let content = fs.readFileSync(filePath, 'utf8');

        return JSON.parse(content);
    }

    static saveJSON(filePath, content) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
    }

    static newJSON(filePath) {
        let jsonContent = {
            functions: {}
        }

        this.saveJSON(filePath, jsonContent);
    }

    static calculateCombinedJSON() {
        let dynamicJSON = this.loadDynamicJSON();
        let staticJSON = this.loadStaticJSON();
        let combinedJSON = this.loadCombinedJSON();

        let dynamicStatementCount = this.countStatements(dynamicJSON);
        let staticStatementCount = this.countStatements(staticJSON);

        for (let functionId in staticJSON.functions) {
            let staticFunctionObject = staticJSON.functions[functionId];
            if (!combinedJSON.functions[functionId]) {
                combinedJSON.functions[functionId] = {};
            }

            for (let statementId in staticFunctionObject) {
                let statementObj = staticFunctionObject[statementId];

                if (dynamicJSON.functions[functionId] && dynamicJSON.functions[functionId][statementId]) {
                    statementObj.executed = true;
                } else {
                    statementObj.executed = false;
                }

                combinedJSON.functions[functionId][statementId] = statementObj;
            }
        }

        combinedJSON.coverage = (dynamicStatementCount / staticStatementCount) * 100;
        this.saveCombinedJSON(combinedJSON);
    }

    static countStatements(object) {
        let count = 0;
        for (let functionId in object.functions) {
            count += Object.keys(object.functions[functionId]).length
        }
        return count;
    }

    static loadDynamicJSON() {
        return this.loadJSON(this.filePathDynamic);
    }

    static loadStaticJSON() {
        return this.loadJSON(this.filePathStatic);
    }

    static loadCombinedJSON() {
        return this.loadJSON(this.filePathCombined);
    }

    static saveDynamicJSON(content) {
        this.saveJSON(this.filePathDynamic, content);
    }

    static saveStaticJSON(content) {
        this.saveJSON(this.filePathStatic, content);
    }

    static saveCombinedJSON(content) {
        this.saveJSON(this.filePathCombined, content);
    }

    static newDynamicJSON() {
        this.newJSON(this.filePathDynamic);
    }

    static newStaticJSON() {
        this.newJSON(this.filePathStatic);
    }

    static newCombinedJSON() {
        this.newJSON(this.filePathCombined);
    }

    static createAllJSONFiles() {
        this.newDynamicJSON();
        this.newStaticJSON();
        this.newCombinedJSON();
    }
}

module.exports = JSONHandler;