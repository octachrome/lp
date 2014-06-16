describe('lexer', function () {
    it('should ignore whitespace', function () {
        var charList = fromArray("   \n\t  ");
        var toks = clex(charList);
        expect(toArray(toks)).toEqual([]);
    });

    it('should tokenise consecutive digits', function () {
        var charList = fromArray('153');
        var toks = clex(charList);
        expect(toArray(toks)).toEqual(['153']);
    });

    it('should tokenise variable names', function () {
        var charList = fromArray('abc123');
        var toks = clex(charList);
        expect(toArray(toks)).toEqual(['abc123']);
    });

    it('should tokenise unrecognised chars separately', function () {
        var charList = fromArray('$!^');
        var toks = clex(charList);
        expect(toArray(toks)).toEqual(['$', '!', '^']);
    });

    it('should tokenise a sequence of variables and numbers', function () {
        var charList = fromArray('2 x 32 abc');
        var toks = clex(charList);
        expect(toArray(toks)).toEqual(['2', 'x', '32', 'abc']);
    });

    it('should tokenise a more complex expression', function () {
        var charList = fromArray('var abc=21*4+88');
        var toks = clex(charList);
        expect(toArray(toks)).toEqual(['var', 'abc', '=', '21', '*', '4', '+', '88']);
    });

    it('should tokenise a multi-word token', function () {
        var charList = fromArray('subject to');
        var toks = clex(charList);
        expect(toArray(toks)).toEqual([Tokens.SUBJECT_TO]);
    });
});
