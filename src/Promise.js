
	/* Core Promise; exposes resolve and reject using an immediate callback */
	function Promise(exposeResolveReject) {
		if (!(this instanceof Promise)) return new Promise(exposeResolveReject);


	}

	/* Promise prototype methods; everything relies on Promise.done */

	Promise.prototype = {
		then: function(success, failure) {

		}
		,'finally': function(callback) {

		}
	};


