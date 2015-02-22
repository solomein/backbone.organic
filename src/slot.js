/**
 * @class
 */
Organic.Slot = function (region) {
    if (!region) {
        Organic.throwError('Region is not defined');
    }

    this.region = region;
};

_.extend(Organic.Slot.prototype, {
    /**
     * @param {String} html
     * @return {Object} Slot
     */
    setHtml: function (html) {
        this.empty();
        this.region.showHtml(html);

        return this;
    },

    /**
     * @param {Function} ViewClass
     * @return {Object} Slot
     */
    setView: function (ViewClass) {
        this.empty();
        this.view = new ViewClass();
        this.region.show(this.view);

        return this;
    },

    /**
     * @param {Function} BlockClass
     * @return {Object} Slot
     */
    set: function (BlockClass) {
        this.empty();
        this.data = _.rest(arguments);
        this.block = new BlockClass();

        return this.active();
    },

    /**
     * @return {Object} Promise
     */
    active: function () {
        if (!this.block) {
            Organic.throwError('Slot does not contain block', 'SlotActivationError');
        }

        this.data || (this.data = []);

        var self = this,
            block = this.block;

        Organic._triggerMethod(block, 'before:prepare', this.data);

        return Backbone.$.when(block.prepare.apply(block, this.data))
            .then(function () {
                if (block.lazy) {
                    block._createInternalInstances();
                }

                self.region.show(block.getView());
                Organic._triggerMethod(block, 'prepare', self.data);

                return block;
            });
    },

    empty: function () {
        if (this.block) {
            this.block.destroy();
            delete this.block;
        }

        if (this.view) {
            this.view.destroy();
            delete this.view;
        }
    },

    getBlock: function () {
        return this.block;
    },

    triggerMethod: Organic.triggerMethod
});
