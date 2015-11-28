'use strict';

module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt);

  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'bin/www',
        options: {
          env: {
            DEBUG: 'app:*'
          }
        }
      },
    },

    watch: {
      scripts: {
        files: ['bin/www', '**/*.js'],
        tasks: ['nodemon'],
        options: {
          spawn: false,
        },
      },
    },
  });
};
