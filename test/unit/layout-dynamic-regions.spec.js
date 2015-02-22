describe('layoutView - dynamic regions', function () {
    'use strict';

    beforeEach(function () {
        this.template = function () {
            return '<div id="foo"></div><div id="bar"></div>';
        };
    });

    describe('when adding a region to a layoutView, after it has been rendered', function () {
        beforeEach(function () {
            this.MyLayout = Organic.Layout.extend();

            this.layoutView = new this.MyLayout({
                template: this.template
            });

            this.layoutView.render();

            this.region = this.layoutView.addRegion('foo', '#foo');

            this.view = new Backbone.View();
            this.layoutView.regions.foo.show(this.view);
        });

        it('should add the region to the layoutView', function () {
            expect(this.layoutView.regions.foo).to.equal(this.region);
        });

        it('should set the parent of the region to the layoutView', function () {
            expect(this.region.$el.parent()[0]).to.equal(this.layoutView.el);
        });

        it('should be able to show a view in the region', function () {
            expect(this.layoutView.regions.foo.$el.children().length).to.equal(1);
        });
    });

    describe('when adding a region to a layoutView, before it has been rendered', function () {
        beforeEach(function () {
            this.layoutView = new Organic.Layout({
                template: this.template
            });

            this.region = this.layoutView.addRegion('foo', '#foo');

            this.layoutView.render();

            this.view = new Backbone.View();
            this.layoutView.regions.foo.show(this.view);
        });

        it('should add the region to the layoutView after it is rendered', function () {
            expect(this.layoutView.regions.foo).to.equal(this.region);
        });

        it('should set the parent of the region to the layoutView', function () {
            expect(this.region.$el.parent()[0]).to.equal(this.layoutView.el);
        });

        it('should be able to show a view in the region', function () {
            expect(this.layoutView.regions.foo.$el.children().length).to.equal(1);
        });
    });

    describe(
    'when adding a region to a layoutView that does not have any regions defined, and re-rendering the layoutView',
    function () {
        beforeEach(function () {
            this.layoutView = new Organic.Layout({
                template: this.template
            });

            this.barRegion = this.layoutView.regions.bar;

            this.region = this.layoutView.addRegion('foo', '#foo');

            this.layoutView.render();
            this.layoutView.render();

            this.view = new Backbone.View();
            this.layoutView.regions.foo.show(this.view);
        });

        it('should keep the original regions', function () {
            expect(this.layoutView.regions.bar).to.equal(this.barRegion);
        });

        it('should re-add the region to the layoutView after it is re-rendered', function () {
            expect(this.layoutView.regions.foo).to.equal(this.region);
        });

        it('should set the parent of the region to the layoutView', function () {
            expect(this.region.$el.parent()[0]).to.equal(this.layoutView.el);
        });

        it('should be able to show a view in the region', function () {
            expect(this.layoutView.regions.foo.$el.children().length).to.equal(1);
        });
    });

    describe('when adding a region to a layoutView that already has regions defined, and re-rendering the layoutView', function () {
        beforeEach(function () {
            this.layoutView = new Organic.Layout({
                regionsDecl: {
                    bar: '#bar'
                },
                template: this.template
            });

            this.region = this.layoutView.addRegion('foo', '#foo');

            this.layoutView.render();
            this.layoutView.render();

            this.view = new Backbone.View();
            this.layoutView.regions.foo.show(this.view);
        });

        it('should re-add the region to the layoutView after it is re-rendered', function () {
            expect(this.layoutView.regions.foo).to.equal(this.region);
        });

        it('should set the parent of the region to the layoutView', function () {
            this.region.show(new Backbone.View());
            expect(this.region.$el.parent()[0]).to.equal(this.layoutView.el);
        });

        it('should be able to show a view in the region', function () {
            expect(this.layoutView.regions.foo.$el.children().length).to.equal(1);
        });
    });

    describe('when removing a region from a layoutView', function () {
        beforeEach(function () {
            this.Layout = Organic.Layout.extend({
                template: this.template,
                regionsDecl: {
                    foo: '#foo'
                }
            });

            this.emptyHandler = this.sinon.spy();
            this.layoutView = new this.Layout();

            this.layoutView.render();
            this.layoutView.regions.foo.show(new Backbone.View());
            this.region = this.layoutView.regions.foo;

            this.region.on('empty', this.emptyHandler);

            this.layoutView.removeRegion('foo');
        });

        it('should empty the region', function () {
            expect(this.emptyHandler).to.have.been.called;
        });

        it('should remove the region', function () {
            expect(this.layoutView.foo).to.be.undefined;
            expect(this.layoutView.regions.foo).to.be.undefined;
            expect(this.layoutView.regionManager.get('foo')).to.be.undefined;
        });
    });

    describe('when removing a region and then re-rendering the layoutView', function () {
        beforeEach(function () {
            this.Layout = Organic.Layout.extend({
                template: this.template,
                regionsDecl: {
                    foo: '#foo'
                }
            });

            this.layoutView = new this.Layout();

            this.layoutView.render();
            this.layoutView.regions.foo.show(new Backbone.View());

            this.layoutView.removeRegion('foo');
            this.layoutView.render();

            this.region = this.layoutView.foo;
        });

        it('should not re-attach the region to the layoutView', function () {
            expect(this.region).to.be.undefined;
            expect(this.layoutView.regionManager.get('foo')).to.be.undefined;
        });
    });

    describe('when adding a region to a layoutView then destroying the layoutView', function () {
        beforeEach(function () {
            this.emptyHandler = this.sinon.stub();
            this.layoutView = new Organic.Layout({
                template: this.template
            });

            this.layoutView.render();

            this.region = this.layoutView.addRegion('foo', '#foo');
            this.region.on('empty', this.emptyHandler);

            this.view = new Backbone.View();
            this.layoutView.regions.foo.show(this.view);

            this.layoutView.destroy();
        });

        it('should empty the region', function () {
            expect(this.emptyHandler).to.have.been.called;
        });
    });
});
