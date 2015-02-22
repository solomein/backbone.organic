Organic._triggerMethod = (function () {
    var splitter = /(^|:)(\w)/gi;

    function toCamelCase(match, prefix, firstLetter) {
        return firstLetter.toUpperCase();
    }

    return function (ctx, event, args) {
        var noEventArg = arguments.length < 3;

        if (noEventArg) {
            args = event;
            event = args[0];
        }

        var methodName = 'on' + event.replace(splitter, toCamelCase),
            method = ctx[methodName],
            result;

        if (_.isFunction(method)) {
            result = method.apply(ctx, noEventArg ? _.rest(args) : args);
        }

        if (_.isFunction(ctx.trigger)) {
            if (noEventArg + args.length > 1) {
                ctx.trigger.apply(ctx, noEventArg ? args : [event].concat(_.rest(args, 0)));
            }
            else {
                ctx.trigger(event);
            }
        }

        return result;
    };
})();

Organic.triggerMethod = function (event) {
    return Organic._triggerMethod(this, arguments);
};

Organic.triggerMethodOn = function (ctx) {
    var fnc = _.isFunction(ctx.triggerMethod) ? ctx.triggerMethod : Organic.triggerMethod;

    return fnc.apply(ctx, _.rest(arguments));
};
