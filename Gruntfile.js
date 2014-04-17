module.exports = function(grunt) {
    require('grunt-config-merge')(grunt);
    
    grunt.registerTask('default', [ 'tests' ]);
    
    require('./grunt/tasks/tests.js')(grunt);
    
    grunt.loadNpmTasks('grunt-contrib-jasmine');
};