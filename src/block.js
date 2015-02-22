/**
 * @class
 * @augments Organic.Emitter
 * @augments Organic.SlotKeeper
 */
Organic.Block = Organic.SlotKeeper.extend({
    destroy: function () {
        this._callBeforeDestroy.apply(this, arguments);

        if (this.model) {
            this.unbindEntityEvents(this.model, this.modelEvents);
            delete this.model;
        }

        if (this.collection) {
            this.unbindEntityEvents(this.collection, this.collectionEvents);
            this.collection.reset();
            delete this.collection;
        }

        return Organic.SlotKeeper.prototype.destroy.apply(this, arguments);
    },

    getCollectionClass: function () {
        return this.collectionClass;
    },

    getCollection: function () {
        return this.collection;
    },

    getModelClass: function () {
        return this.modelClass;
    },

    getModel: function () {
        return this.model;
    },

    _createInternalInstances: function () {
        if (typeof this.model === 'undefined') {
            this.model = this._createModel();
        }

        if (this.model) {
            this.bindEntityEvents(this.model, this.modelEvents);
        }

        if (typeof this.collection === 'undefined') {
            this.collection = this._createCollection();
        }

        if (this.collection) {
            this.bindEntityEvents(this.collection, this.collectionEvents);
        }

        return Organic.SlotKeeper.prototype._createInternalInstances.apply(this, arguments);
    },

    _createModel: function () {
        var ModelClass = this.getModelClass();

        if (typeof ModelClass === 'function') {
            return new ModelClass();
        }
    },

    _createCollection: function () {
        var CollectionClass = this.getCollectionClass();

        if (typeof CollectionClass === 'function') {
            return new CollectionClass();
        }
    },

    /** @override */
    _getViewOptions: function () {
        var viewOptions = {};

        if (this.model) {
            viewOptions.model = this.model;
        }

        if (this.collection) {
            viewOptions.collection = this.collection;
        }

        return _.extend(viewOptions, this.viewOptions);
    },

    prepare: Organic.noop
});

Organic.mixMerge(Organic.Block, ['viewEvents', 'modelEvents', 'collectionEvents']);
