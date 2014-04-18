	/* A Deferred controls a Promise by exposing resolve, reject, and promise as properties */
	function Deferred() {
		if (!(this instanceof Deferred)) return new Deferred();

		var deferred = this;
		deferred.promise = new Promise(function(resolve, reject) {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	}
