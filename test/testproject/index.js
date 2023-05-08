const lib = require('./lib');

console.log("Hello World!");
let number1 = 5;
let number2 = 10;
let result1 = number1 + number2;
let result2 = testFn(number1, number2);
let result3 = addNumbers({number1, number2});
console.log(result1);
console.log(result2);
console.log(result3);

function testFn(number1, number2) {
    emptyFunction();
    lib.libFunction();
    return addNumbers({
        number1: number1,
        number2: number2
    });
}

function addNumbers(args) {
    emptyFunction();
    emptyFunction();
    emptyFunction();
    return (args => {return args.number1 + args.number2})(args);
}

function emptyFunction() {

}