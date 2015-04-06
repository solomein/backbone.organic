/**
 * @class
 * @augments external:Backbone.Router
 */
Organic.Router = Backbone.Router.extend({
    constructor: function (options) {
        Backbone.Router.apply(this, arguments);

        this.options = options || {};

        var appRoutes = this.getOption('appRoutes'),
            handlers = this.getOption('handlers'),
            context = this.getOption('handlersContext');

        this._processAppRoutes(handlers, appRoutes, context);
    },

    route: function (route, name, callback) {
        if (_.isFunction(name)) {
            callback = name;
        }
        else if (!callback) {
            callback = this[name];
        }

        var wrappedRoute = _.bind(function () {
            this.trigger('before:route');
            Organic.history.add(window.location.hash);
            callback.apply(this, arguments);
        }, this);

        return Backbone.Router.prototype.route
            .call(this, route, name, wrappedRoute);
    },

    destroy: function () {
        Organic._triggerMethod(this, 'destroy', arguments);

        this.stopListening();
        this.off();
        this.stop();

        return this;
    },

    stop: function () {
        var routes = this.getOption('appRoutes');

        _.each(_.keys(routes), function (key) {
            this._removeFromHistory(key);
        }, this);

        return this;
    },

    _removeFromHistory: function (routePath) {
        var handlers = Backbone.history.handlers;
        var routeConfig = _.find(handlers, function (routeConfig) {
            var routeRegEx = this._routeToRegExp(routePath);

            return routeConfig.route.source === routeRegEx.source;
        }, this);

        if (routeConfig) {
            Backbone.history.handlers = _.without(handlers, routeConfig);
        }
    },

    _processAppRoutes: function (handlers, appRoutes, context) {
        var routeNames = _.keys(appRoutes).reverse();

        _.each(routeNames, function (route) {
            var methodName = appRoutes[route],
                method = handlers[methodName];

            if (!method) {
                Organic.throwError('Method "'
                    + methodName + '" was not found on the handlers');
            }

            if (context) {
                method = _.bind(method, context);
            }

            this.route(route, methodName, method);
        }, this);
    },

    triggerMethod: Organic.triggerMethod,
    getOption: Organic.proxyGetOption
});
