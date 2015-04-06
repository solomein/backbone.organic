Organic.Queue = function (len) {
    this.queueLen = len || 2;
    this.queue = new Array(this.queueLen);
};

_.extend(Organic.Queue.prototype, {
    add: function () {
        if (this.queue.length >= this.queueLen) {
            this.queue.shift();
        }

        this.queue.push(this.process.apply(this, _.rest(arguments, 0)));

        return this;
    },

    process: function () {
        return arguments[0];
    },

    getPrevious: function () {
        return this.queue[this.queueLen - 2];
    },

    getLast: function () {
        return this.queue[this.queueLen - 1];
    }
});

Organic.Queue.extend = Backbone.Model.extend;
