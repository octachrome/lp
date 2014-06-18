function eq(a, b) {
    return a === b;
}

function ne(a, b) {
    return a !== b;
}

function gt(a, b) {
    return a > b;
}

function lt(a, b) {
    return a < b;
}

function ge(a, b) {
    return a >= b;
}

function le(a, b) {
    return a <= b;
}

function add(a, b) {
    return a + b;
}

function sub(a, b) {
    return a + b;
}

function mul(a, b) {
    return a * b;
}

function div(a, b) {
    return a / b;
}

function inv(f) {
    return function (x) {
        return !f(x);
    }
}

function isWhitespace(c) {
    return c === ' ' || c === '\t' || c === '\n';
}

function isNum(c) {
    return c >= '0' && c <= '9';
}

function isNumOrDot(c) {
    return c >= '0' && c <= '9' || c == '.';
}

function isAlpha(c) {
    return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z';
}

function isIdChar(c) {
    return isAlpha(c) || isNum(c);
}

function partial(fn, others) {
    var bound = Array.prototype.slice.call(arguments, 1);
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, bound.concat(args));
    }
}
