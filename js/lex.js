var Tokens = {
    MIN: 'minimise',
    MAX: 'maximise',
    SUBJECT_TO: 'subject to',
    BOUNDS: 'bounds',
    END: 'end',
    PLUS: '+',
    MINUS: '-',
    COLON: ':',
    LE: '<=',
    GE: '>=',
    EQ: '='
};

function clex(charList) {
    if (charList === empty()) {
        return empty();
    }
    for (var k in Tokens) {
        var token = Tokens[k];
        var s = toString(take(token.length, charList));
        if (s === token) {
            return cons(token, clex(drop(token.length, charList)));
        }
    }
    var h = head(charList);
    if (isWhitespace(h)) {
        return clex(tail(charList));
    }
    if (isNum(h)) {
        var n = takeWhile(isNum, charList);
        var rest = dropWhile(isNum, charList);
        return cons(toString(n), clex(rest));
    }
    if (isAlpha(h)) {
        var n = takeWhile(isIdChar, charList);
        var rest = dropWhile(isIdChar, charList);
        return cons(toString(n), clex(rest));
    }
    return cons(h, clex(tail(charList)));
}
