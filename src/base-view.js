/**
 * @class
 * @augments external:Backbone.View
 */
Organic.BaseView = Backbone.View.extend({
    constructor: function (options) {
        _.bindAll(this, 'render');

        this.options = _.extend({}, _.result(this, 'options'),
            Organic.callResult(options, this));

        Backbone.View.apply(this, arguments);

        Organic.MonitorDOMRefresh(this);
    },

    getTemplate: function () {
        return this.getOption('template');
    },

    normalizeUIKeys: function (hash) {
        var ui = _.result(this, 'ui'),
            bindings = _.result(this, '_uiBindings');

        return Organic.normalizeUIKeys(hash, bindings || ui);
    },

    normalizeUIValues: function (hash) {
        var ui = _.result(this, 'ui'),
            bindings = _.result(this, '_uiBindings');

        return Organic.normalizeUIValues(hash, bindings || ui);
    },

    configureTriggers: function () {
        if (!this.triggers) {
            return;
        }

        var triggers = this.normalizeUIKeys(_.result(this, 'triggers')),
            triggerEvents = {};

        _.each(triggers, function (val, key) {
            var hasOptions = _.isObject(val),
                eventName = hasOptions ? val.event : val;

            triggerEvents[key] = function (ev, evData) {
                if (ev) {
                    var prevent = ev.preventDefault,
                        stop = ev.stopPropagation;

                    var shouldPrevent = hasOptions ? val.preventDefault : prevent,
                        shouldStop = hasOptions ? val.stopPropagation : stop;

                    if (shouldPrevent && prevent) {
                        prevent.call(ev);
                    }

                    if (shouldStop && stop) {
                        stop.call(ev);
                    }
                }

                this.triggerMethod(eventName, {
                    view: this,
                    model: this.model,
                    collection: this.collection
                }, evData);
            };
        }, this);

        return triggerEvents;
    },

    delegateEvents: function (events) {
        this._delegateDOMEvents(events);
        this.bindEntityEvents(this.model, this.getOption('modelEvents'));
        this.bindEntityEvents(this.collection, this.getOption('collectionEvents'));

        return this;
    },

    _delegateDOMEvents: function (events) {
        events = Organic.callResult(events || this.events, this);
        events = this.normalizeUIKeys(events);

        this.events = events;

        var combinedEvents = {},
            triggers = this.configureTriggers();

        _.extend(combinedEvents, events, triggers);

        Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
    },

    undelegateEvents: function () {
        Backbone.View.prototype.undelegateEvents.apply(this, arguments);

        this.unbindEntityEvents(this.model, this.getOption('modelEvents'));
        this.unbindEntityEvents(this.collection, this.getOption('collectionEvents'));

        return this;
    },

    destroy: function () {
        if (this.isDestroyed) {
            return this;
        }

        Organic._triggerMethod(this, 'before:destroy', arguments);
        this.isDestroyed = true;
        Organic._triggerMethod(this, 'destroy', arguments);

        this.unbindUIElements();
        this.remove();

        return this;
    },

    bindUIElements: function () {
        if (!this.ui) {
            return;
        }

        if (!this._uiBindings) {
            this._uiBindings = this.ui;
        }

        var bindings = _.result(this, '_uiBindings');

        this.ui = {};

        _.each(_.keys(bindings), function (key) {
            var selector = bindings[key];
            this.ui[key] = this.$(selector);
        }, this);
    },

    unbindUIElements: function () {
        if (!this.ui || !this._uiBindings) {
            return;
        }

        _.each(_.keys(this.ui), function (key) {
            delete this.ui[key];
        }, this);

        this.ui = this._uiBindings;
        delete this._uiBindings;
    },

    render: function () {
        this._ensureViewIsIntact();

        this.triggerMethod('before:render', this);

        this._renderTemplate();
        this.bindUIElements();

        this.triggerMethod('render', this);

        return this;
    },

    attachElContent: function (html) {
        this.$el.html(html);

        return this;
    },

    _renderTemplate: function () {
        var template = this.getTemplate();

        if (template === false) {
            return;
        }

        var html = Organic.Renderer.render(template);
        this.attachElContent(html);

        return this;
    },

    _ensureViewIsIntact: function () {
        if (this.isDestroyed) {
            Organic.throwError(
                'View (cid: "' + this.cid + '") has already been destroyed and cannot be used.',
                'ViewDestroyedError');
        }
    },

    triggerMethod: Organic.triggerMethod,
    normalizeMethods: Organic.normalizeMethods,
    getOption: Organic.proxyGetOption,
    bindEntityEvents: Organic.proxyBindEntityEvents,
    unbindEntityEvents: Organic.proxyUnbindEntityEvents
});

Organic.mixMerge(Organic.BaseView, Backbone.View, ['ui', 'triggers']);
