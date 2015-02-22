describe('Organic.SlotManager', function () {
    beforeEach(function () {
        this.slotManager = new Organic.SlotManager();
    });

    describe('when adding slot', function () {
        beforeEach(function () {
            this.region = new Organic.Region({
                el: '#foo'
            });
            this.onAddSlotSpy = this.sinon.spy();

            this.slotManager.on('add:slot', this.onAddSlotSpy);
            this.slot = this.slotManager.addSlot(this.region, 'slotName');
        });

        it('should trigger a "add:slot" event/method', function () {
            expect(this.onAddSlotSpy).to.have.been.calledWith('slotName', this.slot);
        });

        it('should create slot', function () {
            expect(this.slot).to.be.an.instanceof(Organic.Slot);
        });

        it('should store slot', function () {
            expect(this.slotManager._slots.slotName).to.equal(this.slot);
        });
    });

    describe('when removing slot', function () {
        beforeEach(function () {
            this.region = new Organic.Region({
                el: '#foo'
            });
            this.onRemoveSlotSpy = this.sinon.spy();

            this.slotManager.on('remove:slot', this.onRemoveSlotSpy);
            this.slot = this.slotManager.addSlot(this.region, 'slotName');
            this.sinon.spy(this.slot, 'empty');

            this.slotManager.removeSlot('slotName');
        });

        it('should trigger a "remove:slot" event/method', function () {
            expect(this.onRemoveSlotSpy).to.have.been.calledWith('slotName');
        });

        it('should call `slot.empty`', function () {
            expect(this.slot.empty).to.have.been.called;
        });

        it('should delete slot', function () {
            expect(this.slotManager._slots.slotName).to.be.undefined;
        });
    });

    describe('when adding slots', function () {
        beforeEach(function () {
            this.regions = {
                bar: new Organic.Region({el: '#bar'}),
                baz: new Organic.Region({el: '#baz'})
            };

            this.sinon.spy(this.slotManager, 'addSlot');
            this.slotManager.addSlots(this.regions);
        });

        it('should call `addSlot`', function () {
            expect(this.slotManager.addSlot).to.have.callCount(2);
        });

        it('should store all slots', function () {
            expect(this.slotManager._slots.bar).to.be.an.instanceof(Organic.Slot);
            expect(this.slotManager._slots.baz).to.be.an.instanceof(Organic.Slot);
        });
    });

    describe('when removing slots', function () {
        beforeEach(function () {
            this.regions = {
                bar: new Organic.Region({el: '#bar'}),
                baz: new Organic.Region({el: '#baz'})
            };

            this.sinon.spy(this.slotManager, 'removeSlot');
            this.slotManager.addSlots(this.regions);
            this.slotManager.removeSlots();
        });

        it('should call `removeSlot`', function () {
            expect(this.slotManager.removeSlot).to.have.callCount(2);
        });

        it('should remove all slots', function () {
            expect(this.slotManager._slots.bar).to.be.undefined;
            expect(this.slotManager._slots.baz).to.be.undefined;
        });
    });

    describe('when destroying', function () {
        beforeEach(function () {
            this.sinon.spy(this.slotManager, 'removeSlots');
            this.onDestroy = this.sinon.spy();
            this.onBeforeDestroy = this.sinon.spy();

            this.slotManager.on('destroy', this.onDestroy);
            this.slotManager.on('before:destroy', this.onBeforeDestroy);

            this.slotManager.destroy();
        });

        it('should call `removeSlots`', function () {
            expect(this.slotManager.removeSlots).to.have.been.called;
        });

        it('should trigger a "destroy" event/method', function () {
            expect(this.onDestroy).to.have.been.called;
        });

        it('should trigger a "before:destroy" event/method', function () {
            expect(this.onBeforeDestroy).to.have.been.called;
        });
    });
});
