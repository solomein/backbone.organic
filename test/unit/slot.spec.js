describe('Organic.Slot', function () {
    describe('when creating a new slot and no region has been provided', function () {
        it('should throw an exception', function () {
            expect(function () {
                return new Organic.Slot();
            }).to.throw('Region is not defined');
        });
    });

    describe('when creating a new slot', function () {
        beforeEach(function () {
            this.setFixtures('<div id="region"></div>');
            this.el = $('#region')[0];
            this.region = new Organic.Region({
                el: this.el
            });

            this.slot = new Organic.Slot(this.region);

            this.htmlString = 'some html';

            this.ViewClass = Organic.BaseView.extend({
                template: this.htmlString
            });

            this.prepareSpy = this.sinon.spy();
            this.onPrepareSpy = this.sinon.spy();
            this.onBeforePrepareSpy = this.sinon.spy();

            this.BlockClass = Organic.Block.extend({
                viewClass: this.ViewClass,
                prepare: this.prepareSpy,
                onPrepare: this.onPrepareSpy,
                onBeforePrepare: this.onBeforePrepareSpy
            });

            this.sinon.spy(this.slot, 'empty');
        });

        it('should memorize region', function () {
            expect(this.slot.region).to.equal(this.region);
        });

        describe('when calling `setHtml`', function () {
            beforeEach(function () {
                this.sinon.spy(this.slot, 'setHtml');
                this.slot.setHtml(this.htmlString);
            });

            it('should call `empty`', function () {
                expect(this.slot.empty).to.have.been.called;
            });

            it('should append HTML', function () {
                expect(this.region.$el).to.contain.$html(this.htmlString);
            });

            it('should return slot', function () {
                expect(this.slot.setHtml).to.have.returned(this.slot);
            });
        });

        describe('when calling `setView`', function () {
            beforeEach(function () {
                this.sinon.spy(this.slot, 'setView');
                this.slot.setView(this.ViewClass);
            });

            it('should call `empty`', function () {
                expect(this.slot.empty).to.have.been.called;
            });

            it('should append HTML', function () {
                expect(this.region.$el).to.contain.$html(this.htmlString);
            });

            it('should return slot', function () {
                expect(this.slot.setView).to.have.returned(this.slot);
            });
        });

        describe('when calling `set`', function () {
            beforeEach(function () {
                this.sinon.spy(this.slot, 'set');
                this.sinon.spy(this.slot, 'active');
                this.sinon.spy(this.region, 'show');

                this.slot.set(this.BlockClass, 1, 2);
            });

            it('should call `empty`', function () {
                expect(this.slot.empty).to.have.been.called;
            });

            it('should call `active`', function () {
                expect(this.slot.active).to.have.been.called;
            });

            it('should call `region.show`', function () {
                expect(this.region.show).to.have.been.called;
            });

            it('should trigger `prepare` event', function () {
                expect(this.onPrepareSpy).to.have.been.calledWith(1, 2);
            });

            it('should trigger `before:prepare` event', function () {
                expect(this.onBeforePrepareSpy).to.have.been.calledWith(1, 2);
            });
        });

        describe('when calling `active` and block is not defined', function () {
            it('should throw an exception', function () {
                expect(this.slot.active).to.throw('Slot does not contain block');
            });
        });

        describe('when activating lazy block', function () {
            beforeEach(function () {
                this.LazyBlockClass = this.BlockClass.extend({
                    lazy: true
                });

                this.slot.block = new this.LazyBlockClass();

                this.sinon.spy(this.slot.block, '_createInternalInstances');

                this.slot.active();
            });

            it('should create internal instances', function () {
                expect(this.slot.block._createInternalInstances).to.have.been.called;
            });
        });

        describe('when slot is not empty', function () {
            beforeEach(function () {
                this.block = new this.BlockClass();
                this.view = new this.ViewClass();
                this.slot.block = this.block;
                this.slot.view = this.view;
            });

            describe('when calling `empty`', function () {
                beforeEach(function () {
                    this.sinon.spy(this.block, 'destroy');
                    this.sinon.spy(this.view, 'destroy');

                    this.slot.empty();
                });

                it('should delete block', function () {
                    expect(this.slot.block).to.be.undefined;
                });

                it('should delete view', function () {
                    expect(this.slot.view).to.be.undefined;
                });

                it('should destroy block', function () {
                    expect(this.block.destroy).to.have.been.called;
                });

                it('should destroy view', function () {
                    expect(this.view.destroy).to.have.been.called;
                });
            });

            describe('when calling `getBlock`', function () {
                beforeEach(function () {
                    this.sinon.spy(this.slot, 'getBlock');
                    this.slot.getBlock();
                });

                it('should return block', function () {
                    expect(this.slot.getBlock).to.have.returned(this.block);
                });
            });
        });
    });
});
