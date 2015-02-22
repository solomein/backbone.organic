var sinon = require('sinon'),
    $ = require('jquery');

var $body = $(document.body);

var setFixtures = function () {
    _(arguments).each(function (content) {
        $body.append(content);
    });
};

var clearFixtures = function () {
    $body.empty();
};

beforeEach(function () {
    this.sinon = sinon.sandbox.create();
    this.setFixtures = setFixtures;
    this.clearFixtures = clearFixtures;
});

afterEach(function () {
    this.sinon.restore();
    clearFixtures();
    window.location.hash = '';
    Backbone.history.stop();
    Backbone.history.handlers.length = 0;
});
