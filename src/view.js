/**
 * @class
 * @augments external:Backbone.View
 * @augments Organic.BaseView
 */
Organic.View = Organic.BaseView.extend({
    serializeData: function () {
        if (!this.model && !this.collection) {
            return {};
        }

        var args = [this.model || this.collection];

        if (arguments.length) {
            args.push.apply(args, arguments);
        }

        if (this.model) {
            return this.serializeModel.apply(this, args);
        }
        else {
            return {items: this.serializeCollection.apply(this, args)};
        }
    },

    serializeModel: function (model) {
        return model.toJSON.apply(model, _.rest(arguments));
    },

    serializeCollection: function (collection) {
        return collection.toJSON.apply(collection, _.rest(arguments));
    },

    mixinTemplateHelpers: function (target) {
        var helpers = this.getOption('templateHelpers');

        return _.extend(target || {}, Organic.callResult(helpers, this));
    },

    /** @override */
    _renderTemplate: function () {
        var template = this.getTemplate();

        if (template === false) {
            return;
        }

        var data = this.serializeData();
        data = this.mixinTemplateHelpers(data);

        var html = Organic.Renderer.render(template, data);
        this.attachElContent(html);

        return this;
    }
});
