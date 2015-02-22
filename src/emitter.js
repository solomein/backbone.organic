/**
 * @class
 */
Organic.Emitter = function (options) {
    this.options = options || {};

    if (_.isFunction(this.initialize)) {
        this.initialize(this.options);
    }

    this._callBeforeDestroy = _.once(function () {
        Organic._triggerMethod(this, 'before:destroy', arguments);
    });
};

Organic.Emitter.extend = Backbone.Model.extend;

_.extend(Organic.Emitter.prototype, Backbone.Events, {
    destroy: function () {
        this._callBeforeDestroy.apply(this, arguments);
        Organic._triggerMethod(this, 'destroy', arguments);

        this.stopListening();
        this.off();

        return this;
    },

    triggerMethod: Organic.triggerMethod,
    getOption: Organic.proxyGetOption
});

Organic.mixMerge(Organic.Emitter);
