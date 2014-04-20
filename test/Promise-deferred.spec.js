describe('Deferred', function() {
    it("should ignore multiple resolutions", function() {
	    var d = Promise.deferred();
        expect(d.promise.getResultNow()).toBe(undefined);
        d.resolve("success");
        expect(d.promise.getResultNow()).toBe("success");
        d.reject("ignore this");
        expect(d.promise.getResultNow()).toBe("success");
        expect(d.promise.getErrorNow()).toBe(undefined);
        d.resolve("ignore this");
	    expect(d.promise.getResultNow()).toBe("success");
    });
});
