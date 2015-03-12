/**
 * @class
 * @augments Organic.Emitter
 */
Organic.SlotKeeper = Organic.Emitter.extend({
    constructor: function (options) {
        if (this.lazy === false) {
            this._createInternalInstances();
        }

        Organic.Emitter.call(this, options);
    },

    destroy: function () {
        this._callBeforeDestroy.apply(this, arguments);
        this._destroyInternalInstances();

        return Organic.Emitter.prototype.destroy.apply(this, arguments);
    },

    getView: function () {
        return this.view;
    },

    getViewClass: function () {
        return this.viewClass;
    },

    _createInternalInstances: function () {
        if (typeof this.view === 'undefined') {
            this.view = this._createView();
        }

        if (this.view) {
            this._initSlots();
            this.bindEntityEvents(this.view, this.viewEvents);
        }
    },

    _destroyInternalInstances: function () {
        if (this.slotManager) {
            this.slotManager.destroy();
            delete this.slotManager;
        }

        if (this.view) {
            this.unbindEntityEvents(this.view, this.viewEvents);
            this.view.destroy();
            delete this.view;
        }
    },

    _createView: function () {
        var ViewClass = this.getViewClass();

        if (typeof ViewClass !== 'function') {
            Organic.throwError('`viewClass` is not defined', 'SlotKeeperInitError');
        }

        return new ViewClass(this._getViewOptions());
    },

    _initSlotManager: function () {
        this.slots = {};
        this.slotManager = new Organic.SlotManager();

        this.listenTo(this.slotManager, 'add:slot', function (name, slot) {
            this.slots[name] = slot;
        });

        this.listenTo(this.slotManager, 'remove:slot', function (name) {
            delete this.slots[name];
        });
    },

    _initSlots: function () {
        var regions = this.view.regions;

        if (!_.keys(regions).length) {
            return;
        }
        this._initSlotManager();
        this.slotManager.addSlots(regions);
    },

    _getViewOptions: function () {
        return this.viewOptions;
    },

    lazy: false,

    bindEntityEvents: Organic.proxyBindEntityEvents,
    unbindEntityEvents: Organic.proxyUnbindEntityEvents
});
