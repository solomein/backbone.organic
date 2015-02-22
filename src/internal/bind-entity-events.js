(function (Organic) {
    function iterateEvents (target, entity, bindings, actions) {
        if (!entity || !bindings) {
            return;
        }

        bindings = Organic.callResult(bindings, target);

        if (!_.isObject(bindings)) {
            Organic.throwError('Bindings must be an object.', 'BindingError');
        }

        _.each(bindings, function (method, ev) {
            var action = _.isFunction(method) ? actions.func : actions.str;
            action(target, entity, ev, method);
        });
    }

    function bindString (target, entity, ev, method) {
        var methodNames = method.split(/\s+/);

        _.each(methodNames, function (methodName) {
            var targetMethod = target[methodName];

            if (!targetMethod) {
                Organic.throwError('Method "' + methodName
                    + '" was configured as an event handler,'
                    + ' but does not exist.', 'BindingError');
            }

            bindFunction(target, entity, ev, targetMethod);
        });
    }

    function unbindString (target, entity, ev, method) {
        var methodNames = method.split(/\s+/);

        _.each(methodNames, function (methodName) {
            var targetMethod = target[methodName];
            unbindFunction(target, entity, ev, targetMethod);
        });
    }

    function bindFunction (target, entity, ev, method) {
        target.listenTo(entity, ev, method);
    }

    function unbindFunction (target, entity, ev, method) {
        target.stopListening(entity, ev, method);
    }

    Organic.bindEntityEvents = function (target, entity, bindings) {
        iterateEvents(target, entity, bindings, {
            func: bindFunction,
            str: bindString
        });
    };

    Organic.unbindEntityEvents = function (target, entity, bindings) {
        iterateEvents(target, entity, bindings, {
            func: unbindFunction,
            str: unbindString
        });
    };

    Organic.proxyBindEntityEvents = function (entity, bindings) {
        return Organic.bindEntityEvents(this, entity, bindings);
    };

    Organic.proxyUnbindEntityEvents = function (entity, bindings) {
        return Organic.unbindEntityEvents(this, entity, bindings);
    };
})(Organic);
