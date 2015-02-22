(function (root, factory) {
    'use strict';

    if (typeof exports === 'object') {
        factory(require('underscore'), require('backbone'));
    }
    else if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], factory);
    }
    else {
        factory(root._, root.Backbone);
    }
})(this, function (_, Backbone) {
    var Organic = (function (global, Backbone, _) {
        'use strict';
    
        var Organic = {};
        Backbone.Organic = Organic;
    
        Organic.Deferred = Backbone.$.Deferred;
    
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
        
        Organic.normalizeMethods = function (hash) {
            return _.reduce(hash, function (normalizedHash, method, name) {
                if (!_.isFunction(method)) {
                    method = this[method];
                }
        
                if (method) {
                    normalizedHash[name] = method;
                }
        
                return normalizedHash;
            }, {}, this);
        };
        
        Organic.normalizeUIString = function (uiString, ui) {
            return uiString.replace(/@ui\.[a-zA-Z_$0-9]*/g, function (r) {
                return ui[r.slice(4)];
            });
        };
        
        Organic.normalizeUIKeys = function (hash, ui) {
            return _.reduce(hash, function (memo, val, key) {
                var normalizedKey = Organic.normalizeUIString(key, ui);
                memo[normalizedKey] = val;
        
                return memo;
            }, {});
        };
        
        Organic.normalizeUIValues = function (hash, ui) {
            _.each(hash, function (val, key) {
                if (_.isString(val)) {
                    hash[key] = Organic.normalizeUIString(val, ui);
                }
            });
        
            return hash;
        };
        
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
        
        Organic.MonitorDOMRefresh = function (view) {
            function handleShow() {
                view._isShown = true;
                triggerDOMRefresh();
            }
        
            function handleRender() {
                view._isRendered = true;
                triggerDOMRefresh();
            }
        
            function triggerDOMRefresh() {
                if (view._isShown && view._isRendered && Organic.isNodeAttached(view.el)) {
                    if (_.isFunction(view.triggerMethod)) {
                        view.triggerMethod('dom:refresh');
                    }
                }
            }
        
            view.on({
                show: handleShow,
                render: handleRender
            });
        };
        
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
        
        (function (Organic) {
            function mergeProp (parentProp, prop) {
                if (_.isArray(parentProp)) {
                    return parentProp.concat(prop);
                }
        
                if (_.isObject(parentProp)) {
                    return _.extend({}, parentProp, prop);
                }
            }
        
            function mergeProps () {
                var proto = this.prototype,
                    parent = this.__super__;
        
                if (proto.mergeProps === parent.mergeProps) {
                    proto.mergeProps = [];
                }
        
                _(parent._mergeProps.concat(proto.mergeProps)).each(function (propName) {
                    var protoProp = proto[propName],
                        parentProp = parent[propName];
        
                    if (protoProp !== parentProp) {
                        var mergedProps = mergeProp(parentProp, protoProp);
        
                        if (mergedProps) {
                            proto[propName] = mergedProps;
                        }
                    }
                });
        
                return this;
            }
        
            function merge (protoProps) {
                var extended = this.extend(protoProps);
        
                return mergeProps.call(extended);
            }
        
            Organic.mixMerge = function (Class, Parent, props) {
                if (!Class.merge) {
                    Class.merge = merge;
                }
        
                if (arguments.length < 3) {
                    props = Parent;
                    Parent = void 0;
                }
        
                if (!Parent) {
                    Class.prototype._mergeProps = props;
                }
                else if (props) {
                    Class.prototype._mergeProps = (Parent.prototype._mergeProps || []).concat(props);
                }
            };
        
            Organic.mixMerge(Backbone.Model, ['defaults', 'relations']);
            Organic.mixMerge(Backbone.Collection);
            Organic.mixMerge(Backbone.View, ['events']);
            Organic.mixMerge(Backbone.Router);
        })(Organic);
        
    
        /**
         * @class
         */
        Organic.Emitter = function (options) {
            this.options = options || {};
        
            if (_.isFunction(this.initialize)) {
                this.initialize(this.options);
            }
        
            this._callBeforeDestroy = _.once(function () {
                Organic._triggerMethod(this, 'before:destroy', arguments);
            });
        };
        
        Organic.Emitter.extend = Backbone.Model.extend;
        
        _.extend(Organic.Emitter.prototype, Backbone.Events, {
            destroy: function () {
                this._callBeforeDestroy.apply(this, arguments);
                Organic._triggerMethod(this, 'destroy', arguments);
        
                this.stopListening();
                this.off();
        
                return this;
            },
        
            triggerMethod: Organic.triggerMethod,
            getOption: Organic.proxyGetOption
        });
        
        Organic.mixMerge(Organic.Emitter);
        
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
                    shouldDestroyView = isDifferentView && !options.preventDestroy,
                    shouldShowView = isDifferentView || options.forceShow;
        
                if (shouldDestroyView) {
                    this.empty();
                }
        
                if (shouldShowView) {
                    view.once('destroy', this.empty, this);
                    view.render();
        
                    this.triggerMethod('before:show', view);
                    Organic.triggerMethodOn(view, 'before:show');
        
                    this.attachViewHtml(view);
                    this.currentView = view;
        
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
        
    
        Organic.Renderer = {
            render: function (template, data) {
                if (!template) {
                    return '';
                }
        
                if (typeof template === 'function') {
                    return template(data);
                }
                else {
                    return template;
                }
            }
        };
        
    
        /**
         * @class
         * @augments external:Backbone.View
         */
        Organic.BaseView = Backbone.View.extend({
            constructor: function (options) {
                _.bindAll(this, 'render');
        
                this.options = _.extend({}, _.result(this, 'options'),
                    Organic.callResult(options, this));
        
                Backbone.View.apply(this, arguments);
        
                Organic.MonitorDOMRefresh(this);
            },
        
            getTemplate: function () {
                return this.getOption('template');
            },
        
            normalizeUIKeys: function (hash) {
                var ui = _.result(this, 'ui'),
                    bindings = _.result(this, '_uiBindings');
        
                return Organic.normalizeUIKeys(hash, bindings || ui);
            },
        
            normalizeUIValues: function (hash) {
                var ui = _.result(this, 'ui'),
                    bindings = _.result(this, '_uiBindings');
        
                return Organic.normalizeUIValues(hash, bindings || ui);
            },
        
            configureTriggers: function () {
                if (!this.triggers) {
                    return;
                }
        
                var triggers = this.normalizeUIKeys(_.result(this, 'triggers')),
                    triggerEvents = {};
        
                _.each(triggers, function (val, key) {
                    var hasOptions = _.isObject(val),
                        eventName = hasOptions ? val.event : val;
        
                    triggerEvents[key] = function (ev, evData) {
                        if (ev) {
                            var prevent = ev.preventDefault,
                                stop = ev.stopPropagation;
        
                            var shouldPrevent = hasOptions ? val.preventDefault : prevent,
                                shouldStop = hasOptions ? val.stopPropagation : stop;
        
                            if (shouldPrevent && prevent) {
                                prevent.call(ev);
                            }
        
                            if (shouldStop && stop) {
                                stop.call(ev);
                            }
                        }
        
                        this.triggerMethod(eventName, {
                            view: this,
                            model: this.model,
                            collection: this.collection
                        }, evData);
                    };
                }, this);
        
                return triggerEvents;
            },
        
            delegateEvents: function (events) {
                this._delegateDOMEvents(events);
                this.bindEntityEvents(this.model, this.getOption('modelEvents'));
                this.bindEntityEvents(this.collection, this.getOption('collectionEvents'));
        
                return this;
            },
        
            _delegateDOMEvents: function (events) {
                events = Organic.callResult(events || this.events, this);
                events = this.normalizeUIKeys(events);
        
                this.events = events;
        
                var combinedEvents = {},
                    triggers = this.configureTriggers();
        
                _.extend(combinedEvents, events, triggers);
        
                Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
            },
        
            undelegateEvents: function () {
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        
                this.unbindEntityEvents(this.model, this.getOption('modelEvents'));
                this.unbindEntityEvents(this.collection, this.getOption('collectionEvents'));
        
                return this;
            },
        
            destroy: function () {
                if (this.isDestroyed) {
                    return this;
                }
        
                Organic._triggerMethod(this, 'before:destroy', arguments);
                this.isDestroyed = true;
                Organic._triggerMethod(this, 'destroy', arguments);
        
                this.unbindUIElements();
                this.remove();
        
                return this;
            },
        
            bindUIElements: function () {
                if (!this.ui) {
                    return;
                }
        
                if (!this._uiBindings) {
                    this._uiBindings = this.ui;
                }
        
                var bindings = _.result(this, '_uiBindings');
        
                this.ui = {};
        
                _.each(_.keys(bindings), function (key) {
                    var selector = bindings[key];
                    this.ui[key] = this.$(selector);
                }, this);
            },
        
            unbindUIElements: function () {
                if (!this.ui || !this._uiBindings) {
                    return;
                }
        
                _.each(_.keys(this.ui), function (key) {
                    delete this.ui[key];
                }, this);
        
                this.ui = this._uiBindings;
                delete this._uiBindings;
            },
        
            render: function () {
                this._ensureViewIsIntact();
        
                this.triggerMethod('before:render', this);
        
                this._renderTemplate();
                this.bindUIElements();
        
                this.triggerMethod('render', this);
        
                return this;
            },
        
            attachElContent: function (html) {
                this.$el.html(html);
        
                return this;
            },
        
            _renderTemplate: function () {
                var template = this.getTemplate();
        
                if (template === false) {
                    return;
                }
        
                var html = Organic.Renderer.render(template);
                this.attachElContent(html);
        
                return this;
            },
        
            _ensureViewIsIntact: function () {
                if (this.isDestroyed) {
                    Organic.throwError(
                        'View (cid: "' + this.cid + '") has already been destroyed and cannot be used.',
                        'ViewDestroyedError');
                }
            },
        
            triggerMethod: Organic.triggerMethod,
            normalizeMethods: Organic.normalizeMethods,
            getOption: Organic.proxyGetOption,
            bindEntityEvents: Organic.proxyBindEntityEvents,
            unbindEntityEvents: Organic.proxyUnbindEntityEvents
        });
        
        Organic.mixMerge(Organic.BaseView, Backbone.View, ['ui', 'triggers']);
        
        /**
         * @class
         * @augments external:Backbone.View
         * @augments Organic.BaseView
         */
        Organic.View = Organic.BaseView.extend({
            serializeData: function () {
                if (!this.model && !this.collection) {
                    return {};
                }
        
                var args = [this.model || this.collection];
        
                if (arguments.length) {
                    args.push.apply(args, arguments);
                }
        
                if (this.model) {
                    return this.serializeModel.apply(this, args);
                }
                else {
                    return {items: this.serializeCollection.apply(this, args)};
                }
            },
        
            serializeModel: function (model) {
                return model.toJSON.apply(model, _.rest(arguments));
            },
        
            serializeCollection: function (collection) {
                return collection.toJSON.apply(collection, _.rest(arguments));
            },
        
            mixinTemplateHelpers: function (target) {
                var helpers = this.getOption('templateHelpers');
        
                return _.extend(target || {}, Organic.callResult(helpers, this));
            },
        
            /** @override */
            _renderTemplate: function () {
                var template = this.getTemplate();
        
                if (template === false) {
                    return;
                }
        
                var data = this.serializeData();
                data = this.mixinTemplateHelpers(data);
        
                var html = Organic.Renderer.render(template, data);
                this.attachElContent(html);
        
                return this;
            }
        });
        
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
        
    
        /**
         * @class
         */
        Organic.Slot = function (region) {
            if (!region) {
                Organic.throwError('Region is not defined');
            }
        
            this.region = region;
        };
        
        _.extend(Organic.Slot.prototype, {
            /**
             * @param {String} html
             * @return {Object} Slot
             */
            setHtml: function (html) {
                this.empty();
                this.region.showHtml(html);
        
                return this;
            },
        
            /**
             * @param {Function} ViewClass
             * @return {Object} Slot
             */
            setView: function (ViewClass) {
                this.empty();
                this.view = new ViewClass();
                this.region.show(this.view);
        
                return this;
            },
        
            /**
             * @param {Function} BlockClass
             * @return {Object} Slot
             */
            set: function (BlockClass) {
                this.empty();
                this.data = _.rest(arguments);
                this.block = new BlockClass();
        
                return this.active();
            },
        
            /**
             * @return {Object} Promise
             */
            active: function () {
                if (!this.block) {
                    Organic.throwError('Slot does not contain block', 'SlotActivationError');
                }
        
                this.data || (this.data = []);
        
                var self = this,
                    block = this.block;
        
                Organic._triggerMethod(block, 'before:prepare', this.data);
        
                return Backbone.$.when(block.prepare.apply(block, this.data))
                    .then(function () {
                        if (block.lazy) {
                            block._createInternalInstances();
                        }
        
                        self.region.show(block.getView());
                        Organic._triggerMethod(block, 'prepare', self.data);
        
                        return block;
                    });
            },
        
            empty: function () {
                if (this.block) {
                    this.block.destroy();
                    delete this.block;
                }
        
                if (this.view) {
                    this.view.destroy();
                    delete this.view;
                }
            },
        
            getBlock: function () {
                return this.block;
            },
        
            triggerMethod: Organic.triggerMethod
        });
        
        /**
         * @class
         * @augments Organic.Emitter
         */
        Organic.SlotManager = Organic.Emitter.extend({
            constructor: function (options) {
                this._slots = {};
                Organic.Emitter.call(this, options);
            },
        
            removeSlot: function (slotName) {
                this._slots[slotName].empty();
                delete this._slots[slotName];
        
                this.triggerMethod('remove:slot', slotName);
            },
        
            removeSlots: function () {
                _.each(_.keys(this._slots), this.removeSlot, this);
            },
        
            addSlot: function (region, slotName) {
                var slot = new Organic.Slot(region);
                this._slots[slotName] = slot;
        
                this.triggerMethod('add:slot', slotName, slot);
        
                return slot;
            },
        
            addSlots: function (regions) {
                _.each(regions, this.addSlot, this);
            },
        
            destroy: function () {
                this.removeSlots();
        
                return Organic.Emitter.prototype.destroy.apply(this, arguments);
            }
        });
        
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
        
                if (this.slotManager) {
                    this.slotManager.destroy();
                    delete this.slotManager;
                }
        
                if (this.view) {
                    this.unbindEntityEvents(this.view, this.viewEvents);
                    this.view.destroy();
                    delete this.view;
                }
        
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
        
        /**
         * @class
         * @augments Organic.Emitter
         * @augments Organic.SlotKeeper
         */
        Organic.Bundle = Organic.SlotKeeper.extend({
            constructor: function (args) {
                if (!args || !args.region) {
                    Organic.throwError('Region in not defined', 'BundleInitError');
                }
        
                _.bindAll(this, '_onBeforeRoute', '_onViewClose');
        
                this.view = args.view;
                this.region = args.region;
                this.isActive = false;
                this._routers = {};
        
                Organic.SlotKeeper.call(this, args.options);
        
                this.listenTo(this.view, 'close', this._onViewClose);
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
        
                this.region.show(this.view);
                this.isActive = true;
                this.triggerMethod('render');
        
                _.each(_.keys(this._routers), function (key) {
                    this._routers[key].triggerMethod('render', this);
                }, this);
            },
        
            _onViewClose: function () {
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
        
    
        return Organic;
    })(this, Backbone, _);
    
    return Backbone.Organic;
});
