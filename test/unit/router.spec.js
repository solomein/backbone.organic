describe('Organic.Router', function () {
    'use strict';

    afterEach(function () {
        window.location.hash = '';
    });

    describe('when a route is configured with a method that does not exist on the handlers', function () {
        beforeEach(function () {
            var self = this;

            this.handlers = {};
            this.Router = Organic.Router.extend({
                appRoutes: {
                    'foo-route': 'doesNotExist'
                }
            });

            this.run = function () {
                self.router = new self.Router({
                    handlers: self.handlers
                });
            };
        });

        it('should throw an error saying the method does not exist', function () {
            expect(this.run).to.throw('Method "doesNotExist" was not found on the handlers');
        });
    });

    describe('when a handlers is passed through the constructor and a route fires', function () {
        beforeEach(function () {
            this.handlers = {
                foo: this.sinon.stub()
            };
            this.Router = Organic.Router.extend({
                appRoutes: {
                    'foo-route': 'foo'
                }
            });

            this.router = new this.Router({
                handlers: this.handlers
            });
            Backbone.history.start();

            this.router.navigate('foo-route', true);
        });

        it('should call the configured method on the handlers passed in the constructor', function () {
            expect(this.handlers.foo).to.have.been.calledOnce;
        });

        it('should execute the handlers method with the context of the router', function () {
            expect(this.handlers.foo).to.have.been.calledOnce.and.calledOn(this.router);
        });
    });

    describe('when a handlers is provided in the router definition and a route fires', function () {
        beforeEach(function () {
            this.handlers = {
                foo: this.sinon.stub()
            };
            this.Router = Organic.Router.extend({
                appRoutes: {
                    'foo-route': 'foo'
                },
                handlers: this.handlers
            });

            this.router = new this.Router();
            Backbone.history.start();

            this.router.navigate('foo-route', true);
        });

        it('should execute the handlers method with the context of the router', function () {
            expect(this.handlers.foo).to.have.been.calledOnce.and.calledOn(this.router);
        });
    });

    describe('when a second route fires from a handlers instance', function () {
        beforeEach(function () {
            this.handlers = {
                foo: this.sinon.stub(),
                bar: this.sinon.stub()
            };

            this.Router = Organic.Router.extend({
                appRoutes: {
                    'foo-route': 'foo',
                    'bar-route': 'bar'
                }
            });

            this.router = new this.Router({
                handlers: this.handlers
            });
            Backbone.history.start();

            this.router.navigate('foo-route', true);
            this.router.navigate('bar-route', true);
        });

        it('should execute the handlers method with the context of the router', function () {
            expect(this.handlers.bar).to.have.been.calledOnce.and.calledOn(this.router);
        });
    });

    describe('when a route fires with parameters', function () {
        beforeEach(function () {
            this.fooParam = 'bar';
            this.handlers = {
                foo: this.sinon.stub()
            };
            this.Router = Organic.Router.extend({
                appRoutes: {
                    'foo-route/:id': 'foo'
                }
            });

            this.router = new this.Router({
                handlers: this.handlers
            });
            Backbone.history.start();

            this.router.navigate('foo-route/' + this.fooParam, true);
        });

        it('should call the configured method with parameters', function () {
            expect(this.handlers.foo).to.have.always.been.calledWith(this.fooParam);
        });
    });

    describe('when a standard route is defined and fired', function () {
        beforeEach(function () {
            this.fooStub = this.sinon.stub();
            this.Router = Organic.Router.extend({
                routes: {
                    'foo-route': 'foo'
                },
                foo: this.fooStub
            });

            this.router = new this.Router();
            Backbone.history.start();

            this.router.navigate('foo-route', true);
        });

        it('should fire the route callback', function () {
            expect(this.fooStub).to.have.been.calledOnce;
        });
    });

    describe('when router configured with ambiguous routes', function () {
        beforeEach(function () {
            this.handlers = {
                fooBar: this.sinon.stub(),
                fooId: this.sinon.stub()
            };
            this.Router = Organic.Router.extend({
                appRoutes: {
                    'foo/bar': 'fooBar',
                    'foo/:id': 'fooId'
                }
            });

            Backbone.history.start();

            this.router = new this.Router({
                handlers: this.handlers
            });
            this.router.navigate('foo/bar', true);
        });

        it('should take routes order into account', function () {
            expect(this.handlers.fooBar).to.have.been.calledOnce;
            expect(this.handlers.fooId).not.to.have.been.calledOnce;
        });
    });

    describe('when routes are in the wrong order', function () {
        beforeEach(function () {
            this.handlers = {
                fooBar: this.sinon.stub(),
                fooId: this.sinon.stub()
            };
            this.Router = Organic.Router.extend({
                appRoutes: {
                    'foo/:id': 'fooId',
                    'foo/bar': 'fooBar'
                }
            });

            Backbone.history.start();

            this.router = new this.Router({
                handlers: this.handlers
            });
            this.router.navigate('foo/bar', true);
        });

        it('should fire the wrong route', function () {
            expect(this.handlers.fooBar).not.to.have.been.calledOnce;
            expect(this.handlers.fooId).to.have.been.calledOnce;
        });
    });

    describe('when app routes are provided in the constructor', function () {
        beforeEach(function () {
            this.handlers = {
                foo: this.sinon.stub(),
                bar: this.sinon.stub()
            };
            this.AppRouter = Organic.Router.extend({
                appRoutes: {
                    'foo-route': 'foo'
                }
            });
            this.appRouter = new this.AppRouter({
                handlers: this.handlers,
                appRoutes: {
                    'bar-route': 'bar'
                }
            });
            Backbone.history.start();
            this.appRouter.navigate('foo-route', true);
            this.appRouter.navigate('bar-route', true);
        });

        it('should override the configured routes and use the constructor param', function () {
            expect(this.handlers.foo).not.to.have.been.calledOnce;
            expect(this.handlers.bar).to.have.been.calledOnce;
        });
    });

    describe('when a route fires with parameters and app routes are provided exclusively in the constructor', function () {
        beforeEach(function () {
            this.fooParam = 'bar';
            this.handlers = {
                foo: this.sinon.stub()
            };
            this.AppRouter = Organic.Router.extend();
            this.appRouter = new this.AppRouter({
                handlers: this.handlers,
                appRoutes: {
                    'foo-route/:id': 'foo'
                }
            });
            Backbone.history.start();
            this.appRouter.navigate('foo-route/' + this.fooParam, true);
        });

        it('should call the configured method with parameters', function () {
            expect(this.handlers.foo).to.have.always.been.calledWith(this.fooParam);
        });
    });
});
