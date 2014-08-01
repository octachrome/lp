describe('core', function () {
    var c;

    beforeEach(function () {
        c = require('../js/core');
    });

    it('should partially apply functions', function () {
        var add1 = c.partial(c.add, 1);
        var x = add1(4);
        expect(x).toBe(5);
    });
});
