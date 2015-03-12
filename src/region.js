/**
 * @class
 */
Organic.Region = function (options) {
    this.options = options || {};
    this.el = this.getOption('el');

    this.el = this.el instanceof Backbone.$ ? this.el[0] : this.el;

    if (!this.el) {
        Organic.throwError('An "el" must be specified for a region.', 'NoElError');
    }

    this.$el = this.getEl(this.el);

    if (_.isFunction(this.initialize)) {
        this.initialize.apply(this, arguments);
    }
};

_.extend(Organic.Region, {
    buildRegion: function (regionConfig, DefaultRegionClass) {
        if (_.isString(regionConfig)) {
            return this._buildRegionFromSelector(regionConfig, DefaultRegionClass);
        }

        if (regionConfig.selector || regionConfig.el || regionConfig.regionClass) {
            return this._buildRegionFromObject(regionConfig, DefaultRegionClass);
        }

        if (_.isFunction(regionConfig)) {
            return this._buildRegionFromRegionClass(regionConfig);
        }

        Organic.throwError('Improper region configuration type.');
    },

    _buildRegionFromSelector: function (selector, DefaultRegionClass) {
        return new DefaultRegionClass({el: selector});
    },

    _buildRegionFromObject: function (regionConfig, DefaultRegionClass) {
        var RegionClass = regionConfig.regionClass|| DefaultRegionClass || Organic.Region,
            options = _.omit(regionConfig, 'selector', 'regionClass');

        if (regionConfig.selector && !options.el) {
            options.el = regionConfig.selector;
        }

        var region = new RegionClass(options);

        if (regionConfig.parentEl) {
            region.getEl = function (el) {
                if (_.isObject(el)) {
                    return Backbone.$(el);
                }
                var parentEl = _.result(regionConfig, 'parentEl');

                return parentEl.find(el);
            };
        }

        return region;
    },

    _buildRegionFromRegionClass: function (RegionClass) {
        return new RegionClass();
    }
});

_.extend(Organic.Region.prototype, Backbone.Events, {
    show: function (view, options) {
        this._ensureElement();

        options = options || {};
        var isDifferentView = view !== this.currentView,
            isChangingView = !!this.currentView,
            shouldDestroyView = isDifferentView && !options.preventDestroy,
            shouldShowView = isDifferentView || options.forceShow;

        if (shouldDestroyView) {
            this.empty();
        }
        else if (isChangingView && shouldShowView) {
            this.currentView.off('destroy', this.empty, this);
        }

        if (shouldShowView) {
            view.once('destroy', this.empty, this);
            view.render();

            if (isChangingView) {
                this.triggerMethod('before:swap', view);
            }

            this.triggerMethod('before:show', view);
            Organic.triggerMethodOn(view, 'before:show');

            this.attachViewHtml(view);
            this.currentView = view;

            if (isChangingView) {
                this.triggerMethod('swap', view);
            }

            this.triggerMethod('show', view);
            Organic.triggerMethodOn(view, 'show');
        }

        return this;
    },

    showHtml: function (html) {
        this._ensureElement();

        this.empty();
        this.attachHtml(html);

        return this;
    },

    _ensureElement: function () {
        if (!_.isObject(this.el)) {
            this.$el = this.getEl(this.el);
            this.el = this.$el[0];
        }

        if (!this.$el || this.$el.length === 0) {
            Organic.throwError('An "el" ' + this.$el.selector + ' must exist in DOM');
        }
    },

    getEl: function (el) {
        return Backbone.$(el);
    },

    attachViewHtml: function (view) {
        this.attachHtml(view.el);
    },

    attachHtml: function (html) {
        this.$el.html(html);
    },

    empty: function () {
        var view = this.currentView;

        if (!view) {
            return;
        }

        this.triggerMethod('before:empty', view);
        this._destroyView();
        this.triggerMethod('empty', view);

        delete this.currentView;

        return this;
    },

    _destroyView: function () {
        var view = this.currentView;

        if (view.destroy && !view.isDestroyed) {
            view.destroy();
        }
        else if (view.remove) {
            view.remove();
            view.isDestroyed = true;
        }
    },

    attachView: function (view) {
        this.currentView = view;

        return this;
    },

    hasView: function () {
        return !!this.currentView;
    },

    reset: function () {
        this.empty();

        if (this.$el) {
            this.el = this.$el.selector;
        }

        delete this.$el;

        return this;
    },

    getOption: Organic.proxyGetOption,
    triggerMethod: Organic.triggerMethod
});

Organic.Region.extend = Organic.extend;
