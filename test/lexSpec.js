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

    it('should lex a program', function () {
        var prog = 'minimise\n\
x + y + 4 z\n\
\n\
subject to\n\
constraint1: x + 2y <= 3\n\
constraint2: y + z >= 10\n\
\n\
bounds\n\
y free\n\
\n\
end';
        var toks = clex(fromArray(prog));
        expect(toArray(toks)).toEqual([
            Tokens.MIN, 'x', Tokens.PLUS, 'y', Tokens.PLUS, '4', 'z',
            Tokens.SUBJECT_TO,
            'constraint1', Tokens.COLON, 'x', Tokens.PLUS, '2', 'y', Tokens.LE, '3',
            'constraint2', Tokens.COLON, 'y', Tokens.PLUS, 'z', Tokens.GE, '10',
            Tokens.BOUNDS,
            'y', Tokens.FREE,
            Tokens.END]);
    });
});
