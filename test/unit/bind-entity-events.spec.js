describe('Organic.bindEntityEvents', function () {
    'use strict';

    beforeEach(function () {
        this.handleFooStub = this.sinon.stub();
        this.handleBarStub = this.sinon.stub();
        this.listenToStub = this.sinon.stub();
        this.entityStub = this.sinon.stub();

        this.target = {
            handleFoo: this.handleFooStub,
            handleBar: this.handleBarStub,
            listenTo: this.listenToStub
        };

        this.entity = this.entityStub;
    });

    describe('when entity isn\'t passed', function () {
        beforeEach(function () {
            Organic.bindEntityEvents(this.target, false, {'foo': 'handleFoo'});
        });

        it('shouldn\'t bind any events', function () {
            expect(this.listenToStub).not.to.have.been.called;
        });
    });

    describe('when bindings isn\'t passed', function () {
        beforeEach(function () {
            Organic.bindEntityEvents(this.target, this.entity, null);
        });

        it('shouldnt bind any events', function () {
            expect(this.listenToStub).not.to.have.been.called;
        });
    });

    describe('when binding is a function', function () {
        beforeEach(function () {
            this.bindingsSpy = this.sinon.spy(function () {
                return {'foo': 'handleFoo'};
            });

            Organic.bindEntityEvents(this.target, this.entity, this.bindingsSpy);
        });

        it('should evaluate bindings function', function () {
            expect(this.bindingsSpy).to.have.been.calledOnce;
        });

        it('should evaluate bindings function in context of target', function () {
            expect(this.bindingsSpy).to.have.been.calledOnce.and.calledOn(this.target);
        });

        it('should bind events returned from bindings function to targets handlers', function () {
            expect(this.listenToStub).to.have.been.calledOnce.and.calledWith(this.entity, 'foo', this.handleFooStub);
        });
    });

    describe('when bindings is an object with one event-handler pair', function () {
        describe('when handler is a function', function () {
            beforeEach(function () {
                Organic.bindEntityEvents(this.target, this.entity, {'foo': this.handleFooStub});
            });

            it('should bind an event to targets handler', function () {
                expect(this.listenToStub)
                    .to.have.been.calledOnce.and.calledWith(this.entity, 'foo', this.handleFooStub);
            });
        });

        describe('when handler is a string', function () {
            describe('when one handler is passed', function () {
                beforeEach(function () {
                    Organic.bindEntityEvents(this.target, this.entity, {'foo': 'handleFoo'});
                });

                it('should bind an event to targets handler', function () {
                    expect(this.listenToStub)
                        .to.have.been.calledOnce.and.calledWith(this.entity, 'foo', this.handleFooStub);
                });
            });

            describe('when multiple handlers are passed', function () {
                beforeEach(function () {
                    Organic.bindEntityEvents(this.target, this.entity, {
                        'baz': 'handleFoo handleBar'
                    });
                });

                it('should bind first event to targets handler', function () {
                    expect(this.listenToStub)
                        .to.have.been.calledTwice.and.calledWith(this.entity, 'baz', this.handleFooStub);
                });

                it('should bind second event to targets handler', function () {
                    expect(this.listenToStub)
                        .to.have.been.calledTwice.and.calledWith(this.entity, 'baz', this.handleBarStub);
                });
            });

            describe('when handler method doesn\'t exist', function () {
                it('should throw an exception', function () {
                    var self = this;
                    expect(function () {
                        Organic.bindEntityEvents(self.target, self.entity, {'baz': 'doesNotExist'});
                    }).to.throw('Method "doesNotExist" was configured as an event handler, but does not exist.');
                });
            });
        });
    });

    describe('when bindings is an object with multiple event-handler pairs', function () {
        beforeEach(function () {
            Organic.bindEntityEvents(this.target, this.entity, {
                'foo': 'handleFoo',
                'bar': 'handleBar'
            });
        });

        it('should bind first event to targets handler', function () {
            expect(this.listenToStub).to.have.been.calledTwice.and.calledWith(this.entity, 'foo', this.handleFooStub);
        });

        it('should bind second event to targets handler', function () {
            expect(this.listenToStub).to.have.been.calledTwice.and.calledWith(this.entity, 'bar', this.handleBarStub);
        });
    });

    describe('when bindings is not an object nor a function', function () {
        beforeEach(function () {
            this.run = function () {
                Organic.bindEntityEvents(this.target, this.entity, 'handleFoo');
            }.bind(this);
        });

        it('should error', function () {
            expect(this.run).to.throw('Bindings must be an object.');
        });
    });

    describe('when bindEntityEvents is proxied', function () {
        beforeEach(function () {
            this.target.bindEntityEvents = Organic.proxyBindEntityEvents;
            this.target.bindEntityEvents(this.entity, {'foo': 'handleFoo'});
        });

        it('should bind an event to targets handler', function () {
            expect(this.listenToStub).to.have.been.calledOnce.and.calledWith(this.entity, 'foo', this.handleFooStub);
        });
    });
});
