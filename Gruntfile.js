'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('frame-carousel.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist', 'www/assets/vendor/frame-carousel']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      js: {
        src: ['src/jquery.<%= pkg.name %>.js'],
        dest: 'dist/jquery.<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      js: {
        src: '<%= concat.js.dest %>',
        dest: 'dist/jquery.<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      css: {
        src: 'dist/jquery.<%= pkg.name %>.css',
        dest: 'dist/jquery.<%= pkg.name %>.min.css'
      }
    },
    copy: {
      sample: {
        expand: true,
        // flatten: true,
        // filter: 'isFile'
        cwd: 'src/sample/',
        src: '**',
        dest: 'dist/sample/'
      },
      www_dist: {
        expand: true,
        cwd: 'dist/',
        src: '**',
        dest: 'www/assets/vendor/frame-carousel/'
      }
    },
    less: {
      www: {
        src: 'www/assets/css/main.less',
        dest: 'www/assets/css/main.css'
      },
      core: {
        src: 'src/jquery.<%= pkg.name %>.less',
        dest: 'dist/jquery.<%= pkg.name %>.css'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'concat', 'uglify', 'less:core', 'cssmin', 'copy:sample', 'copy:www_dist', 'less:www']);

};
