(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'underscore'], function (Backbone, _) {
            return (root.Organic = factory(root, Backbone, _));
        });
    }
    else if (typeof exports !== 'undefined') {
        var Backbone = require('backbone'),
            _ = require('underscore');
        module.exports = factory(root, Backbone, _);
    }
    else {
        root.Organic = factory(root, root.Backbone, root._);
    }
}(this, function (root, Backbone, _) {
    'use strict';

    var previousOrganic = root.Organic;

    var Organic = Backbone.Organic = {};

    Organic.noConflict = function () {
        root.Organic = previousOrganic;

        return this;
    };

    Organic.Deferred = Backbone.$.Deferred;

    // @include ../internal/helpers.js
    // @include ../internal/normalize.js
    // @include ../internal/trigger-method.js
    // @include ../internal/dom-refresh.js
    // @include ../internal/bind-entity-events.js
    // @include ../internal/merge.js

    // @include ../emitter.js
    // @include ../region.js
    // @include ../region-manager.js

    // @include ../internal/renderer.js

    // @include ../base-view.js
    // @include ../view.js
    // @include ../layout.js

    // @include ../router.js

    // @include ../slot.js
    // @include ../slot-manager.js
    // @include ../slot-keeper.js
    // @include ../block.js
    // @include ../bundle.js

    return Organic;
}));
