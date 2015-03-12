/**
 * @class
 * @augments Organic.Emitter
 * @augments Organic.SlotKeeper
 */
Organic.Bundle = Organic.SlotKeeper.extend({
    lazy: true,

    constructor: function (options) {
        this.options = options || {};
        this.region = this.getOption('region');

        if (!this.region) {
            Organic.throwError('Region in not defined', 'BundleInitError');
        }

        _.bindAll(this, '_onBeforeRoute', '_onRegionSwap');

        this.isActive = false;
        this._routers = {};

        this.listenTo(this.region, 'swap', this._onRegionSwap);

        Organic.SlotKeeper.call(this, this.options);
    },

    initRouter: function (routerName) {
        var router = this._routers[routerName] = new this.routersDecl[routerName]({
            handlersContext: this
        });

        this.listenTo(router, 'before:route', this._onBeforeRoute);
        router.triggerMethod('init', this);

        return router;
    },

    initRouters: function () {
        _.each(_.keys(this.routersDecl), function (key) {
            this.initRouter(key);
        }, this);
    },

    getRouter: function (routerName) {
        if (typeof this._routers[routerName] === 'undefined') {
            Organic.throwError('Router is not initialized');
        }

        return this._routers[routerName];
    },

    _onBeforeRoute: function () {
        if (this.isActive) {
            return;
        }

        /** Reinitialize internal instances */
        this._destroyInternalInstances();
        this._createInternalInstances();

        this.region.show(this.view);
        this.isActive = true;
        this.triggerMethod('render');

        _.each(_.keys(this._routers), function (key) {
            this._routers[key].triggerMethod('render', this);
        }, this);
    },

    _onRegionSwap: function () {
        this.isActive = false;
    },

    destroy: function () {
        _.each(_.keys(this._routers), function (key) {
            this._routers[key].destroy(this);
            delete this._routers[key];
        }, this);

        return Organic.SlotKeeper.prototype.destroy.apply(this, arguments);
    }
});
