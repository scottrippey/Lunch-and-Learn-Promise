module.exports = function(grunt) {
    
    grunt.registerTask('tests', [ 'jasmine' ]);
    grunt.mergeConfig({
        jasmine: {
            'all-specs': {
                src: [
	                'src/Promise.js'
	                ,'src/Promise-utils.js'
	                ,'src/Deferred.js'
	                ,'src/xhr.js'
                ],
                options: {
                    specs: [
	                    'test/common.js'
	                    ,'test/Promise.spec.js'
	                    ,'test/Promise-utils.spec.js'
	                    ,'test/Deferred.spec.js'
                    ]
                }
            }
        }
    });
    
};
