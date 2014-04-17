module.exports = function(grunt) {
    
    grunt.registerTask('tests', [ 'jasmine' ]);
    grunt.mergeConfig({
        jasmine: {
            'all-specs': {
                src: 'src/**/*.js',
                options: {
                    specs: 'test/**/*.js'
                }
            }
        }
    });
    
};