describe('Organic.Layout', function () {
    'use strict';

    beforeEach(function () {
        this.layoutViewManagerTemplateFn = _.template('<div id="one"></div><div id="two"></div>');
        this.template = function () {
            return '<span class=".craft"></span><h1 id="#a-fun-game"></h1>';
        };

        this.Layout = Organic.Layout.extend({
            template: this.layoutViewManagerTemplateFn,
            regionsDecl: {
                one: '#one',
                two: '#two'
            }
        });

        this.CustomRegion1 = function () {};

        this.CustomRegion2 = Organic.Region.extend();

        this.LayoutNoDefaultRegion = this.Layout.extend({
            regionsDecl: {
                one: {
                    selector: '#one',
                    regionClass: this.CustomRegion1
                },
                two: '#two'
            }
        });
    });

    describe('on instantiation', function () {
        beforeEach(function () {
            var self = this;
            this.LayoutInitialize = this.Layout.extend({
                initialize: function () {
                    self.one = this.one;
                }
            });

            this.layoutViewManager = new this.LayoutInitialize();
        });

        it('should instantiate the specified region managers', function () {
            expect(this.layoutViewManager.regions).to.have.property('one');
            expect(this.layoutViewManager.regions).to.have.property('two');
        });

        it('should instantiate the specified region before initialize', function () {
            expect(this.one).to.equal(this.layoutViewManager.one);
        });
    });

    describe('on instantiation with no regions defined', function () {
        beforeEach(function () {
            var self = this;
            this.NoRegions = Organic.Layout.extend({});
            this.init = function () {
                self.layoutViewManager = new self.NoRegions();
            };
        });

        it('should instantiate the specified region managers', function () {
            expect(this.init).not.to.throw;
        });
    });

    describe('on instantiation with custom region managers', function () {
        beforeEach(function () {
            this.LayoutCustomRegion = this.Layout.extend({
                regionClass: this.CustomRegion1,
                regionsDecl: {
                    one: {
                        selector: '#one',
                        regionClass: this.CustomRegion1
                    },
                    two: {
                        selector: '#two',
                        regionClass: this.CustomRegion2,
                        specialOption: true
                    },
                    three: {
                        selector: '#three'
                    },
                    four: '#four'
                }
            });

            this.layoutViewManager = new this.LayoutCustomRegion();
        });

        it('should instantiate specific regions with custom regions if specified', function () {
            expect(this.layoutViewManager.regions).to.have.property('one');
            expect(this.layoutViewManager.regions.one).to.be.instanceof(this.CustomRegion1);
            expect(this.layoutViewManager.regions).to.have.property('two');
            expect(this.layoutViewManager.regions.two).to.be.instanceof(this.CustomRegion2);
        });

        it('should instantiate the default regionManager if specified', function () {
            expect(this.layoutViewManager.regions).to.have.property('three');
            expect(this.layoutViewManager.regions.three).to.be.instanceof(this.CustomRegion1);
            expect(this.layoutViewManager.regions).to.have.property('four');
            expect(this.layoutViewManager.regions.three).to.be.instanceof(this.CustomRegion1);
        });

        it('should instantiate marionette regions is no regionClass is specified', function () {
            var layoutViewManagerNoDefault = new this.LayoutNoDefaultRegion();
            expect(layoutViewManagerNoDefault.regions).to.have.property('two');
            expect(layoutViewManagerNoDefault.regions.two).to.be.instanceof(Organic.Region);
        });

        it('should pass extra options to the custom regionClass', function () {
            expect(this.layoutViewManager.regions.two).to.have.property('options');
            expect(this.layoutViewManager.regions.two.options).to.have.property('specialOption');
            expect(this.layoutViewManager.regions.two.options.specialOption).to.be.ok;
        });
    });

    describe('when regions are defined as a function', function () {
        beforeEach(function () {
            var self = this;
            this.Layout = Organic.Layout.extend({
                template: '#foo',
                regionsDecl: function (opts) {
                    self.options = opts;

                    return {
                        'foo': '#bar'
                    };
                }
            });

            this.setFixtures('<div id="foo"><div id="bar"></div></div>');
            this.layoutView = new this.Layout();
            this.layoutView.render();
        });

        it('should supply the layoutView.options to the function when calling it', function () {
            expect(this.options).to.deep.equal(this.layoutView.options);
        });

        it('should build the regions from the returns object literal', function () {
            expect(this.layoutView.regions).to.have.property('foo');
            expect(this.layoutView.regions.foo).to.be.instanceof(Organic.Region);
        });
    });

    describe('on rendering', function () {
        beforeEach(function () {
            this.layoutViewManager = new this.Layout();
            this.layoutViewManager.render();
        });

        it('should find the region scoped within the rendered template', function () {
            this.layoutViewManager.regions.one._ensureElement();
            var el = this.layoutViewManager.$('#one');
            expect(this.layoutViewManager.regions.one.$el[0]).to.equal(el[0]);
        });
    });

    describe('when destroying', function () {
        beforeEach(function () {
            this.layoutViewManager = new this.Layout();
            this.layoutViewManager.render();

            this.one = this.layoutViewManager.regions.one;
            this.two = this.layoutViewManager.regions.two;

            this.sinon.spy(this.one, 'empty');
            this.sinon.spy(this.two, 'empty');

            this.sinon.spy(this.layoutViewManager, 'destroy');
            this.layoutViewManager.destroy();
            this.layoutViewManager.destroy();
        });

        it('should empty the region managers', function () {
            expect(this.one.empty).to.have.been.calledOnce;
            expect(this.two.empty).to.have.been.calledOnce;
        });

        it('should delete the region managers', function () {
            expect(this.layoutViewManager.regions.one).to.be.undefined;
            expect(this.layoutViewManager.regions.two).to.be.undefined;
        });

        it('should return the view', function () {
            expect(this.layoutViewManager.destroy).to.have.always.returned(this.layoutViewManager);
        });
    });

    describe('when showing a layoutView via a region', function () {
        beforeEach(function () {
            var self = this;

            this.setFixtures('<div id="mgr"></div>');

            this.layoutView = new this.Layout();
            this.layoutView.onRender = function () {
                self.one = self.layoutView.regions.one;
                self.one._ensureElement();
            };

            this.region = new Organic.Region({
                el: '#mgr'
            });

            this.showReturn = this.region.show(this.layoutView);
        });

        it('should make the regions available in `onRender`', function () {
            expect(this.one).to.exist;
        });

        it('the regions should find their elements in `onRender`', function () {
            expect(this.one.$el.length).to.equal(1);
        });

        it('should return the region after showing a view in a region', function () {
            expect(this.showReturn).to.equal(this.region);
        });
    });

    describe('when re-rendering an already rendered layoutView', function () {
        beforeEach(function () {
            this.LayoutBoundRender = this.Layout.extend({
                initialize: function () {
                    if (this.model) {
                        this.listenTo(this.model, 'change', this.render);
                    }
                }
            });

            this.layoutView = new this.LayoutBoundRender({
                model: new Backbone.Model()
            });
            this.layoutView.render();

            this.view = new Backbone.View();
            this.view.destroy = function () {};
            this.layoutView.regions.one.show(this.view);

            this.resetRegionsSpy = this.sinon.spy(this.layoutView.regionManager, 'resetAllRegions');

            this.layoutView.render();
            this.layoutView.regions.one.show(this.view);
            this.region = this.layoutView.one;
        });

        it('should reset the regions', function () {
            expect(this.resetRegionsSpy.callCount).to.equal(1);
        });

        it('should re-bind the regions to the newly rendered elements', function () {
            expect(this.layoutView.regions.one.$el.parent()[0]).to.equal(this.layoutView.el);
        });

        describe('and the views "render" function is bound to an event in the "initialize" function', function () {
            beforeEach(function () {
                var self = this;
                this.layoutView.onRender = function () {
                    this.regions.one.show(self.view);
                };

                this.layoutView.model.trigger('change');
            });

            it('should re-bind the regions correctly', function () {
                expect(this.layoutView.$('#one')).not.to.equal();
            });
        });
    });

    describe('when re-rendering a destroyed layoutView', function () {
        beforeEach(function () {
            this.layoutView = new this.Layout();
            this.layoutView.render();
            this.region = this.layoutView.regions.one;

            this.view = new Backbone.View();
            this.view.destroy = function () {};
            this.layoutView.regions.one.show(this.view);
            this.layoutView.destroy();

            this.sinon.spy(this.region, 'empty');
            this.sinon.spy(this.view, 'destroy');

            this.layoutView.onBeforeRender = this.sinon.stub();
            this.layoutView.onRender = this.sinon.stub();
        });

        it('should throw an error', function () {
            expect(this.layoutView.render).to.throw('View (cid: "' + this.layoutView.cid
                + '") has already been destroyed and cannot be used.');
        });
    });

    describe('has a valid inheritance chain back to Organic.View', function () {
        beforeEach(function () {
            this.constructor = this.sinon.spy(Organic, 'View');
            this.layoutView = new Organic.Layout();
        });

        it('calls the parent Organic.Views constructor function on instantiation', function () {
            expect(this.constructor).to.have.been.called;
        });
    });

    describe('when defining region selectors using @ui. syntax', function () {
        beforeEach(function () {
            var UILayout = Organic.Layout.extend({
                template: this.template,
                regionsDecl: {
                    war: '@ui.war'
                },
                ui: {
                    war: '.craft'
                }
            });
            this.layoutView = new UILayout();
        });

        it('should apply the relevant @ui. syntax selector', function () {
            expect(this.layoutView.regions.war).to.exist;
            expect(this.layoutView.regions.war.$el.selector).to.equal('.craft');
        });
    });

    describe('overiding default regionManager', function () {
        beforeEach(function () {
            var self = this;
            this.spy = this.sinon.spy();
            this.layout = new(Organic.Layout.extend({
                getRegionManager: function () {
                    self.spy.apply(this, arguments);

                    return new Organic.RegionManager();
                }
            }))();
        });

        it('should call into the custom regionManager lookup', function () {
            expect(this.spy).to.have.been.called;
        });

        it('should call the custom regionManager with the view as the context', function () {
            expect(this.spy).to.have.been.calledOn(this.layout);
        });
    });
});
