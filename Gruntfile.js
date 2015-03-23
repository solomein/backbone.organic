module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    var jshintReporter = require('jshint-stylish'),
        paths = require('./paths');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        preprocess: {
            core: {
                src: paths.core.src,
                dest: paths.core.dist
            }
        },

        uglify: {
            core: {
                src: paths.core.dist,
                dest: paths.core.min
            }
        },

        instrument: {
            files: paths.src.organic,
            options: {
                lazy: true,
                basePath: 'test'
            }
        },

        env: {
            coverage: {
                APP_DIR_FOR_CODE_COVERAGE: '../../../test/src/'
            }
        },

        mochaTest: {
            tests: {
                options: {
                    require: 'test/unit/setup/node.js',
                    reporter: 'nyan',
                    clearRequireCache: true,
                    mocha: require('mocha')
                },
                src: [
                    'test/unit/setup/helpers.js',
                    'test/unit/*.spec.js'
                ]
            }
        },

        storeCoverage: {
            options: {
                dir: paths.test.coverage
            }
        },

        makeReport: {
            src: paths.test.coverage + '/**/*.json',
            options: {
                type: 'lcov',
                dir: paths.test.coverage,
                print: 'detail'
            }
        },

        jscs: {
            src: paths.src.all
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: jshintReporter
            },

            organic: {
                src: paths.src.organic
            },

            specs: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },

                files: {
                    src: paths.src.spec
                }
            }
        },

        complexity: {
            generic: {
                src: paths.src.organic,
                options: {
                    breakOnErrors: true,
                    errorsOnly: false,
                    cyclomatic: 10,
                    halstead: 18,
                    maintainability: 100,
                    hideComplexFunctions: false
                }
            }
        }
    });

    grunt.registerTask('default', [
        'valid'
    ]);

    grunt.registerTask('valid', [
        'jscs',
        'jshint:organic',
        'jshint:specs',
        'complexity'
    ]);

    grunt.registerTask('test', [
        'preprocess',
        'mochaTest'
    ]);

    grunt.registerTask('coverage', [
        'preprocess',
        'env:coverage',
        'instrument',
        'mochaTest',
        'storeCoverage',
        'makeReport'
    ]);

    grunt.registerTask('build', [
        'preprocess',
        'uglify'
    ]);
};
