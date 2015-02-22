/**
 * @class
 * @augments Organic.Emitter
 */
Organic.RegionManager = Organic.Emitter.extend({
    constructor: function (options) {
        this._regions = {};
        Organic.Emitter.call(this, options);
    },

    addRegions: function (regionDefinitions, defaults) {
        regionDefinitions = Organic.applyResult(regionDefinitions, this, arguments);

        var regions = {};

        _.each(regionDefinitions, function (definition, name) {
            if (_.isString(definition)) {
                definition = {selector: definition};
            }

            if (definition.selector) {
                definition = _.defaults({}, definition, defaults);
            }

            regions[name] = this.addRegion(name, definition);
        }, this);

        return regions;
    },

    addRegion: function (name, definition) {
        var region = definition instanceof Organic.Region
            ? definition
            : Organic.Region.buildRegion(definition, Organic.Region);

        this.triggerMethod('before:add:region', name, region);
        this._store(name, region);
        this.triggerMethod('add:region', name, region);

        return region;
    },

    get: function (name) {
        return this._regions[name];
    },

    removeRegion: function (name) {
        var region = this._regions[name];
        region.empty();
        region.stopListening();

        delete this._regions[name];
        this._setLength();

        this.triggerMethod('remove:region', name, region);
    },

    removeAllRegions: function () {
        var regionNames = _.keys(this._regions);

        _.each(regionNames, this.removeRegion, this);
    },

    resetAllRegions: function () {
        var regionNames = _.keys(this._regions);

        _.each(regionNames, function (name) {
            this._regions[name].reset();
        }, this);
    },

    destroy: function () {
        this.removeAllRegions();

        return Organic.Emitter.prototype.destroy.apply(this, arguments);
    },

    _store: function (name, region) {
        this._regions[name] = region;
        this._setLength();
    },

    _setLength: function () {
        this.length = _.keys(this._regions).length;
    }
});

Organic.mixCollectionMethods(Organic.RegionManager.prototype, '_regions');
