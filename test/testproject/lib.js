const otherLib = require('./otherlib');

function libFunction() {
    console.log("Test Lib Function");

    otherLib.libFunction2();
}

module.exports = {libFunction};