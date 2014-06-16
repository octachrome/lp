describe('core', function () {
    it('should partially apply functions', function () {
        var add1 = partial(add, 1);
        var x = add1(4);
        expect(x).toBe(5);
    });
});
