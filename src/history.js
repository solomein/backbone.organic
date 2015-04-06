/**
 * @class
 * @augments Organic.Queue
 */
Organic.History = Organic.Queue.extend({
    constructor: function () {
        this.history = Backbone.history;
        this.defaultFragment = null;

        Organic.Queue.call(this);
    },

    add: function (fragment) {
        if (this.getLast() !== fragment) {
            Organic.Queue.prototype.add.call(this, fragment);
        }

        return this;
    },

    back: function () {
        var fragment = this.getPrevious() || this.defaultFragment;

        return this.navigate(fragment, {trigger: true});
    },

    navigate: function (fragment, options) {
        this.history.navigate(fragment, options);

        return this;
    },

    start: function () {
        this.history.start();

        return this;
    },

    stop: function () {
        this.history.stop();

        return this;
    }
});

Organic.history = new Organic.History();
