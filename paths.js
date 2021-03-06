module.exports = {
    vendors: {
        underscore: 'bower_components/underscore/underscore.js',
        backbone: 'bower_components/backbone/backbone.js',
        jquery: 'bower_components/jquery/dist/jquery.js',
        sinon: 'bower_components/sinonjs/sinon.js'
    },
    core: {
        src:  'src/build/organic.js',
        dist: 'dist/backbone.organic.js',
        min:  'dist/backbone.organic.min.js'
    },
    src: {
        all: ['src/**/*.js', '*.js', 'test/unit/**/*.js'],
        organic: 'src/**/*.js',
        spec: 'test/unit/**/*.js'
    },
    test: {
        coverage: 'coverage'
    }
};
