
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
	this.then(function(result) { promiseResult = result; });
	simulateAsync();
	return promiseResult;
};
Promise.prototype.getErrorNow = function() {
	var promiseError;
	this.then(null, function(error) { promiseError = error; });
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


