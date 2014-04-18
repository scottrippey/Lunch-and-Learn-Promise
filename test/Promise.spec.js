
/* Override setImmediate, to get synchronous results */

var asyncCallbacks = [];
setImmediate = function(callback) {
    asyncCallbacks.push(callback);
};
simulateAsync = function() {
    for (var i = 0; i < asyncCallbacks.length; i++) {
        asyncCallbacks[i]();
    }
    asyncCallbacks.length = 0;
};
Promise.prototype.getResultNow = function() {
	var promiseResult;
	this.done(function(result) { promiseResult = result; });
	simulateAsync();
	return promiseResult;
};
Promise.prototype.getErrorNow = function() {
	var promiseError;
	this.done(null, function(error) { promiseError = error; });
	simulateAsync();
	return promiseError;
};



/* Test helper methods: */

var resolved = function(result) { return new Promise(function(res,rej){ res(result); })};
var rejected = function(error) { return new Promise(function(res,rej) { rej(error); })};

var spyAssertions = [];
var shouldPass = function() {
    var spy = jasmine.createSpy("shouldPass");
	spy.and.callFake(function(arg) { return arg; });
    spyAssertions.push(function() {
        expect(spy).toHaveBeenCalled();
    });
    return spy;
};
var shouldFail = function() {
    var spy = jasmine.createSpy("shouldFail");
	spy.and.callFake(function(arg) { return arg; });
    spyAssertions.push(function() {
        expect(spy).not.toHaveBeenCalled();
    });
    return spy;
};
afterEach(function() {
    simulateAsync();
    spyAssertions.forEach(function(assertion) { assertion(); });
    spyAssertions.length = 0;
});




describe('Promise', function() {
    
    describe('done', function() {
        it("should fire success", function() {
            resolved().done(shouldPass(), shouldFail());
        });
        it("should fire failure", function() {
            rejected().done(shouldFail(), shouldPass());
        });
        it("should accept many callbacks", function() {
            var p = resolved();
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
        });
        it("should accept nulls", function() {
            resolved().done(null, null);
            resolved().done(null, shouldFail());
            resolved().done(shouldPass(), null);
        });
        it("should accept nulls", function() {
            rejected().done(null, null);
            rejected().done(null, shouldPass());
            rejected().done(shouldFail(), null);
        });
    });
    
    describe('then', function() {
        it("should be chainable", function() {
            resolved().then().then().then(shouldPass(), shouldFail());
        });
        it("should be chainable", function() {
            rejected().then().then().then(shouldFail(), shouldPass());
        });
        it("should pass through", function() {
            var result = resolved("hello").then(null, shouldFail()).getResultNow();
            expect(result).toBe("hello");
            
            result = rejected("goodbye").then(shouldFail(), null).getErrorNow();
            expect(result).toBe("goodbye");

        });
        it("should mutate", function() {
            var result = resolved("hello").then(function(result) { return result.toUpperCase(); }).getResultNow();
            expect(result).toBe("HELLO");
        });
        it("should unwrap returned promises", function() {
            var result = resolved("hello").then(function(result) {
                return resolved(result + " world");
            }).getResultNow();
            expect(result).toBe("hello world");
        });
        it("should switch states", function() {
            var result = resolved("success").then(shouldPass(), shouldFail())
                .then(function(result) { return rejected(result + " fail"); })
	            .then(shouldFail(), shouldPass())
                .then(null, function(error) { return resolved(error + " success"); })
	            .then(shouldPass(), shouldFail())
	            .getResultNow();
	        expect(result).toBe("success fail success");
        });
    });
    
    
});

describe('Promise static methods', function() {
    describe("all", function() {
        it("should join several results", function() {
            var result = Promise.all([ resolved(1), resolved(2), resolved(3) ]).getResultNow();
            expect(result).toEqual([1,2,3])
        });
        it("should fail if 1 of them fail", function() {
            var error = Promise.all([ resolved(1), rejected(2), resolved(3) ]).getErrorNow();
            expect(error).toEqual(2);
        });
        it("should fail if 2 of them fail", function() {
            var error = Promise.all([ resolved(1), rejected(2), resolved(3), rejected(4) ]).getErrorNow();
            expect(error).toEqual(2);
        });
    });
    describe("any", function() {
        it("should succeed if 1 is successful", function() {
            var result;
            result = Promise.any([ resolved(1), resolved(2), resolved(3) ]).getResultNow();
            expect(result).toEqual(1);
            
            result = Promise.any([ rejected(1), resolved(2), resolved(3) ]).getResultNow();
            expect(result).toEqual(2);
            
            result = Promise.any([ rejected(1), rejected(2), resolved(3) ]).getResultNow();
            expect(result).toEqual(3);
        });
        it("should fail if they all fail", function() {
            var error = Promise.any([ rejected(1), rejected(2), rejected(3) ]).getErrorNow();
            expect(error).toEqual([ 1, 2, 3 ]);
        });
    });
});

describe('Deferred', function() {
    it("should ignore multiple resolutions", function() {
	    var d = new Deferred();
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
