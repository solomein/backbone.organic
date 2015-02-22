var Organic = (function (global, Backbone, _) {
    'use strict';

    var Organic = {};
    Backbone.Organic = Organic;

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
})(this, Backbone, _);
