(function (root, factory) {
    'use strict';

    if (typeof exports === 'object') {
        factory(require('underscore'), require('backbone'));
    }
    else if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], factory);
    }
    else {
        factory(root._, root.Backbone);
    }
})(this, function (_, Backbone) {
    // @include organic.js
    return Backbone.Organic;
});
