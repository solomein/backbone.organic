describe('Organic.Emitter', function () {
    'use strict';

    beforeEach(function () {
        this.initializeOptions = {foo: 'bar'};

        this.initializeStub = this.sinon.stub();
        this.onDestroyStub = this.sinon.stub();
        this.destroyHandlerStub = this.sinon.stub();
        this.listenToHandlerStub = this.sinon.stub();

        this.Emitter = Organic.Emitter.extend({
            initialize: this.initializeStub,
            onDestroy: this.onDestroyStub
        });
    });

    describe('when creating an emitter', function () {
        beforeEach(function () {
            this.triggerOptions = {bar: 'foo'};
            this.emitter = new this.Emitter(this.initializeOptions);

            this.fooHandler = this.sinon.stub();

            this.emitter.on('foo', this.fooHandler);
            this.emitter.trigger('foo', this.triggerOptions);
        });

        it('should support triggering events', function () {
            expect(this.fooHandler).to.have.been.calledOnce.and.calledWith(this.triggerOptions);
        });

        it('should have an event aggregator built in to it', function () {
            expect(this.emitter.listenTo).to.be.a('function');
        });

        it('should support an initialize function', function () {
            expect(this.initializeStub).to.have.been.calledOnce.and.calledWith(this.initializeOptions);
        });

        it('should maintain a reference to the options', function () {
            expect(this.emitter).to.have.property('options', this.initializeOptions);
        });
    });

    describe('when no options argument is supplied to the constructor', function () {
        beforeEach(function () {
            this.emitter = new this.Emitter();
        });

        it('should provide an empty object as the options', function () {
            expect(this.emitter.options).to.be.an('object');
        });

        it('should provide the empty object as the options to initialize', function () {
            expect(this.initializeStub).to.have.been.calledOnce.and.calledWith(this.emitter.options);
        });
    });

    describe('when destroying a emitter', function () {
        beforeEach(function () {
            this.argumentOne = 'foo';
            this.argumentTwo = 'bar';

            this.emitter = new this.Emitter();

            this.sinon.spy(this.emitter, 'stopListening');
            this.sinon.spy(this.emitter, 'off');

            this.emitter.on('destroy', this.destroyHandlerStub);
            this.emitter.listenTo(this.emitter, 'destroy', this.listenToHandlerStub);

            this.sinon.spy(this.emitter, 'destroy');
            this.emitter.destroy(this.argumentOne, this.argumentTwo);
        });

        it('should stopListening events', function () {
            expect(this.emitter.stopListening).to.have.been.calledOnce;
        });

        it('should turn off all events', function () {
            expect(this.emitter.off).to.have.been.called;
        });

        it('should stopListening after calling destroy', function () {
            expect(this.listenToHandlerStub).to.have.been.calledOnce;
        });

        it('should trigger a destroy event with any arguments passed to destroy', function () {
            expect(this.destroyHandlerStub).to.have.been.calledOnce.and.calledWith(this.argumentOne, this.argumentTwo);
        });

        it('should call an onDestroy method with any arguments passed to destroy', function () {
            expect(this.emitter.onDestroy).to.have.been.calledOnce.and.calledWith(this.argumentOne, this.argumentTwo);
        });

        it('should return the emitter', function () {
            expect(this.emitter.destroy).to.have.returned(this.emitter);
        });
    });
});
