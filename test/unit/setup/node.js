var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    chaiJq = require('chai-jq'),
    requireHelper = require('./require-helper');

chai.use(sinonChai);
chai.use(chaiJq);

global.expect = chai.expect;
global.sinon = sinon;

if (!global.document || !global.window) {
    var jsdom = require('jsdom').jsdom;

    global.document = jsdom('<html><head><script></script></head><body></body></html>', {
        FetchExternalResources: ['script'],
        ProcessExternalResources: ['script'],
        MutationEvents: '2.0',
        QuerySelector: false
    });

    global.window = document.defaultView;
    global.navigator = global.window.navigator;

    global.window.Node.prototype.contains = function (node) {
        return this.compareDocumentPosition(node) & 16;
    };
}

global.$ = global.jQuery = require('jquery');
global._ = require('underscore');
global.Backbone = require('backbone');
global.Backbone.$ = global.$;
global.Organic = Backbone.Organic = {};
Organic.Deferred = global.Backbone.$.Deferred;

requireHelper('internal/helpers');
requireHelper('internal/normalize');
requireHelper('internal/trigger-method');
requireHelper('internal/dom-refresh');
requireHelper('internal/bind-entity-events');
requireHelper('internal/merge');

requireHelper('emitter');
requireHelper('region');
requireHelper('region-manager');

requireHelper('internal/renderer');

requireHelper('base-view');
requireHelper('view');
requireHelper('layout');

requireHelper('router');

requireHelper('slot');
requireHelper('slot-manager');
requireHelper('slot-keeper');
requireHelper('block');
requireHelper('bundle');
