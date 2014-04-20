module.exports = function(grunt) {
	grunt.registerTask('js', [ 'uglify:PROMISE' ]);
	grunt.mergeConfig({
		uglify: {
			'PROMISE': {
				options: { report: 'gzip' },
				src: [
					'src/Promise.js',
					'src/Promise-deferred.js',
					'src/Promise-utils.js'
				],
				dest: 'dist/Promise.min.js'
			}
		}
	})
};
