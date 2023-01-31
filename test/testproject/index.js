console.log("Hello World!");
let number1 = 5;
let number2 = 10;
let result1 = number1 + number2;
let result2 = testFn(number1, number2);
console.log(result1);
console.log(result2);

function testFn(number1, number2) {
    return addNumbers({
        number1: number1,
        number2: number2
    });
}

function addNumbers(args) {
    return (args => {return args.number1 + args.number2})(args);
}