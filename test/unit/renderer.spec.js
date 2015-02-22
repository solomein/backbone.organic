describe('Organic.Renderer', function () {
    'use strict';

    beforeEach(function () {
        this.data = {
            foo: 'bar'
        };
    });

    describe('when no template is provided', function () {
        beforeEach(function () {
            this.renderSpy = this.sinon.spy(Organic.Renderer, 'render');
            Organic.Renderer.render();
        });

        it('should return empty string', function () {
            expect(this.renderSpy).to.have.been.calledOnce.and.returned('');
        });
    });

    describe('when overriding the `render` method', function () {
        beforeEach(function () {
            this.renderStub = this.sinon.stub(Organic.Renderer, 'render');

            this.view = new Organic.View({
                template: 'foobar'
            });

            this.view.render();
        });

        it('should render the view with the overridden method', function () {
            expect(this.renderStub).to.have.been.called;
        });
    });

    describe('when providing a precompiled template', function () {
        beforeEach(function () {
            this.templateFunction = _.template('<%= foo %>');
            this.renderSpy = this.sinon.spy(Organic.Renderer, 'render');
            Organic.Renderer.render(this.templateFunction, this.data);
        });

        it('should use the provided template function', function () {
            expect(this.renderSpy).to.have.been.calledOnce.and.returned(this.data.foo);
        });
    });
});
