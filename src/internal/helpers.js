Organic.extend = Backbone.Model.extend;

Organic.noop = function () {};

Organic.isNodeAttached = function (el) {
    return Backbone.$.contains(document.documentElement, el);
};

Organic.throwError = function (message, name) {
    var error = new Error(message);
    error.name = name || 'Error';
    throw error;
};

Organic.getOption = function (target, optionName) {
    if (!target || !optionName) {
        return;
    }

    var options = target.options,
        hasOption = options && (typeof options[optionName] !== 'undefined');

    return (hasOption ? options : target)[optionName];
};

Organic.proxyGetOption = function (optionName) {
    return Organic.getOption(this, optionName);
};

Organic.callResult = function (target, ctx, arg) {
    return _.isFunction(target) ? target.call(ctx || this, arg) : target;
};

Organic.applyResult = function (target, ctx, arg) {
    return _.isFunction(target) ? target.apply(ctx || this, arg) : target;
};

Organic.mixCollectionMethods = function (object, listProperty) {
    var methods = [
        'forEach', 'each', 'map', 'find', 'detect', 'filter',
        'select', 'reject', 'every', 'all', 'some', 'any', 'include',
        'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
        'last', 'without', 'isEmpty', 'pluck'
    ];

    _.each(methods, function (method) {
        object[method] = function () {
            var list = _.values(_.result(this, listProperty)),
                args = [list].concat(_.toArray(arguments));

            return _[method].apply(_, args);
        };
    });
};
