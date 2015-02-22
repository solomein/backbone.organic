/**
 * @class
 * @augments external:Backbone.View
 * @augments Organic.BaseView
 * @augments Organic.View
 */
Organic.Layout = Organic.View.extend({
    regionClass: Organic.Region,

    constructor: function (options) {
        options = options || {};

        this._firstRender = true;
        this._initRegions(options);

        Organic.View.call(this, options);
    },

    render: function () {
        this._ensureViewIsIntact();

        if (this._firstRender) {
            this._firstRender = false;
        }
        else {
            this.regionManager.resetAllRegions();
        }

        return Organic.View.prototype.render.apply(this, arguments);
    },

    destroy: function () {
        if (this.isDestroyed) {
            return this;
        }

        this.regionManager.destroy();

        return Organic.View.prototype.destroy.apply(this, arguments);
    },

    addRegion: function (name, definition) {
        var regions = {};
        regions[name] = definition;

        return this._buildRegions(regions)[name];
    },

    addRegions: function (regions) {
        this.regionsDecl = _.extend({}, this.regionsDecl, regions);

        return this._buildRegions(regions);
    },

    removeRegion: function (name) {
        delete this.regionsDecl[name];

        return this.regionManager.removeRegion(name);
    },

    getRegionManager: function () {
        return new Organic.RegionManager();
    },

    _initRegionManager: function () {
        this.regionManager = this.getRegionManager();
        this.regions = {};

        this.listenTo(this.regionManager, 'add:region', function (name, region) {
            this.regions[name] = region;
        });

        this.listenTo(this.regionManager, 'remove:region', function (name) {
            delete this.regions[name];
        });
    },

    _buildRegions: function (regions) {
        var self = this;

        var defaults = {
            regionClass: this.getOption('regionClass'),
            parentEl: function () {
                return self.$el;
            }
        };

        return this.regionManager.addRegions(regions, defaults);
    },

    _initRegions: function (options) {
        this._initRegionManager();

        var regions = _.extend({}, Organic.callResult(this.regionsDecl, this, options));

        if (_.keys(regions).length) {
            regions = this.normalizeUIValues(regions);
            this._buildRegions(regions);
        }
    }
});

Organic.mixMerge(Organic.Layout, Backbone.BaseView, ['regionsDecl']);
