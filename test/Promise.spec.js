
var resolved = function(result) { return new Promise(function(res,rej){ res(result); })};
var rejected = function(error) { return new Promise(function(res,rej) { rej(error); })};

var __asyncCallbacks = [];
setImmediate = function(callback) {
    __asyncCallbacks.push(callback);
};
simulateAsync = function() {
    for (var i = 0; i < __asyncCallbacks.length; i++) {
        __asyncCallbacks[i]();
    }
    __asyncCallbacks.length = 0;
};

var spyAssertions = [];
var shouldPass = function() {
    var spy = jasmine.createSpy("shouldPass");
    spyAssertions.push(function() {
        expect(spy).toHaveBeenCalled();
    });
    return spy;
};
var shouldFail = function() {
    var spy = jasmine.createSpy("shouldFail");
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

Promise.prototype.getResult = function() {
    var promiseResult;
    this.done(function(result) { promiseResult = result; });
    simulateAsync();
    return promiseResult;
};
Promise.prototype.getError = function() {
    var promiseError;
    this.done(null, function(error) { promiseError = error; });
    simulateAsync();
    return promiseError;
};

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
            var chainedResult;
            resolved("hello").then().then(function(result) {
                chainedResult = result;
            });
            simulateAsync();
            expect(chainedResult).toBe("hello");
            
            rejected("goodbye").then().then(null, function(error) {
                chainedResult = error;
            });
            simulateAsync();
            expect(chainedResult).toBe("goodbye");

        });
        it("should mutate", function() {
            var chainedResult;
            resolved("hello").then(function(result) { return result.toUpperCase(); }).then(function(result) {
                chainedResult = result;
            });
            simulateAsync();
            expect(chainedResult).toBe("HELLO");
        });
        it("should unwrap returned promises", function() {
            var chainedResult;
            resolved("hello").then(function() {
                return resolved("hi");
            }).then(function(result) {
                chainedResult = result;
            });
            simulateAsync();
            expect(chainedResult).toBe("hi");
        });
        it("should switch resolutions", function() {
            resolved().then(shouldPass(), shouldFail())
                .then(function() { return rejected(); }).then(shouldFail(), shouldPass())
                .then(null, function() { return resolved(); }).then(shouldPass(), shouldFail());
        });
    });
    
    
});

describe('Promise static methods', function() {
    describe("all", function() {
        it("should join several results", function() {
            var result = Promise.all([ resolved(1), resolved(2), resolved(3) ]).getResult();
            expect(result).toEqual([1,2,3])
        });
        it("should fail if 1 of them fail", function() {
            var error = Promise.all([ resolved(1), rejected(2), resolved(3) ]).getError();
            expect(error).toEqual(2);
        });
        it("should fail if 2 of them fail", function() {
            var error = Promise.all([ resolved(1), rejected(2), resolved(3), rejected(4) ]).getError();
            expect(error).toEqual(2);
        });
    });
    describe("any", function() {
        it("should succeed if 1 is successful", function() {
            var result;
            result = Promise.any([ resolved(1), resolved(2), resolved(3) ]).getResult();
            expect(result).toEqual(1);
            
            result = Promise.any([ rejected(1), resolved(2), resolved(3) ]).getResult();
            //expect(result).toEqual(2);
            
            result = Promise.any([ rejected(1), rejected(2), resolved(3) ]).getResult();
            //expect(result).toEqual(3);
        });
        it("should fail if they all fail", function() {
            var error = Promise.any([ rejected(1), rejected(2), rejected(3) ]).getError();
            expect(error).toEqual(1);
        });
    });
});


describe('Deferred', function() {
    var d, state, UNRESOLVED = 0, RESOLVED = 1, REJECTED = 2;
    beforeEach(function() {
        d = new Deferred();
        state = UNRESOLVED;
        d.promise.done(function() {
            state = RESOLVED;
        }, function() {
            state = REJECTED;
        });
    });
    
    it("should ignore multiple resolutions", function() {
        expect(state).toBe(UNRESOLVED);
        d.resolve(); simulateAsync();
        expect(state).toBe(RESOLVED);
        d.reject(); simulateAsync();
        expect(state).toBe(RESOLVED);
        d.resolve(); simulateAsync();
        expect(state).toBe(RESOLVED);
        d.reject(); simulateAsync();
        expect(state).toBe(RESOLVED);
    });
    
    it("should resolve async", function() {
        expect(state).toBe(UNRESOLVED);
        d.resolve();
        expect(state).toBe(UNRESOLVED);
        simulateAsync();
        expect(state).toBe(RESOLVED);
    });
      
});
