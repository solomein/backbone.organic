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
