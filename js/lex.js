if (typeof exports === 'undefined') {
    var exports = window.lex = {};
}

(function (exports) {
    var c = require('./core');
    var l = require('./list');

    var Tokens = exports.Tokens = {
        MIN: 'minimise',
        MAX: 'maximise',
        SUBJECT_TO: 'subject to',
        BOUNDS: 'bounds',
        FREE: 'free',
        END: 'end',
        PLUS: '+',
        MINUS: '-',
        COLON: ':',
        LE: '<=',
        GE: '>=',
        EQ: '='
    };

    exports.clex = function clex(charList) {
        if (charList === l.empty()) {
            return l.empty();
        }
        for (var k in Tokens) {
            var token = Tokens[k];
            var s = l.toString(l.take(token.length, charList));
            if (s === token) {
                return l.cons(token, clex(l.drop(token.length, charList)));
            }
        }
        var h = l.head(charList);
        if (c.isWhitespace(h)) {
            return clex(l.tail(charList));
        }
        if (c.isNum(h)) {
            var n = l.takeWhile(c.isNumOrDot, charList);
            var rest = l.dropWhile(c.isNumOrDot, charList);
            return l.cons(l.toString(n), clex(rest));
        }
        if (c.isAlpha(h)) {
            var n = l.takeWhile(c.isIdChar, charList);
            var rest = l.dropWhile(c.isIdChar, charList);
            return l.cons(l.toString(n), clex(rest));
        }
        return l.cons(h, clex(l.tail(charList)));
    }
})(exports);
