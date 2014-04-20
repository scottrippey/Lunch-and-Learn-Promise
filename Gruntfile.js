module.exports = function(grunt) {
    require('grunt-config-merge')(grunt);
    
    grunt.registerTask('default', [ 'tests' ]);
    
    require('./grunt/tasks/js.js')(grunt);
    require('./grunt/tasks/tests.js')(grunt);

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
};
