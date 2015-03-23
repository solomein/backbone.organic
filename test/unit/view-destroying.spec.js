describe('Destroying views', function () {
    'use strict';

    describe('when destroying a Organic.BaseView multiple times', function () {
        beforeEach(function () {
            this.onDestroyStub = this.sinon.stub();

            this.baseView = new Organic.BaseView();
            this.baseView.onDestroy = this.onDestroyStub;

            this.baseView.destroy();
            this.baseView.destroy();
        });

        it('should only run the destroying code once', function () {
            expect(this.onDestroyStub).to.have.been.calledOnce;
        });

        it('should mark the view as destroyed', function () {
            expect(this.baseView).to.have.property('isDestroyed', true);
        });
    });

    describe('when destroying a Organic.View multiple times', function () {
        beforeEach(function () {
            this.onBeforeDestroyStub = this.sinon.stub();

            this.view = new Organic.View();
            this.view.onBeforeDestroy = this.onBeforeDestroyStub;

            this.view.destroy();
            this.view.destroy();
        });

        it('should only run the destroying code once', function () {
            expect(this.onBeforeDestroyStub).to.have.been.calledOnce;
        });

        it('should mark the view as destroyed', function () {
            expect(this.view).to.have.property('isDestroyed', true);
        });
    });

    describe('when rendering a Organic.View that was previously destroyed', function () {
        beforeEach(function () {
            this.view = new Organic.View();
            this.view.destroy();
        });

        it('should throw an error', function () {
            expect(this.view.render).to.throw('View (cid: "' + this.view.cid
                + '") has already been destroyed and cannot be used.');
        });
    });

    describe('when destroying a Organic.Layout multiple times', function () {
        beforeEach(function () {
            this.onDestroyStub = this.sinon.stub();

            this.layout = new Organic.Layout();
            this.layout.onDestroy = this.onDestroyStub;

            this.layout.destroy();
            this.layout.destroy();
        });

        it('should only run the destroying code once', function () {
            expect(this.onDestroyStub).to.have.been.calledOnce;
        });

        it('should mark the view as destroyed', function () {
            expect(this.layout).to.have.property('isDestroyed', true);
        });
    });

    describe('when rendering a Organic.Layout that was previously destroyed', function () {
        beforeEach(function () {
            this.layout = new Organic.Layout();
            this.layout.destroy();
        });

        it('should throw an error', function () {
            expect(this.layout.render).to.throw('View (cid: "' + this.layout.cid
                + '") has already been destroyed and cannot be used.');
        });
    });
});
