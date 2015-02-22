(function (Organic) {
    function mergeProp (parentProp, prop) {
        if (_.isArray(parentProp)) {
            return parentProp.concat(prop);
        }

        if (_.isObject(parentProp)) {
            return _.extend({}, parentProp, prop);
        }
    }

    function mergeProps () {
        var proto = this.prototype,
            parent = this.__super__;

        if (proto.mergeProps === parent.mergeProps) {
            proto.mergeProps = [];
        }

        _(parent._mergeProps.concat(proto.mergeProps)).each(function (propName) {
            var protoProp = proto[propName],
                parentProp = parent[propName];

            if (protoProp !== parentProp) {
                var mergedProps = mergeProp(parentProp, protoProp);

                if (mergedProps) {
                    proto[propName] = mergedProps;
                }
            }
        });

        return this;
    }

    function merge (protoProps) {
        var extended = this.extend(protoProps);

        return mergeProps.call(extended);
    }

    Organic.mixMerge = function (Class, Parent, props) {
        if (!Class.merge) {
            Class.merge = merge;
        }

        if (arguments.length < 3) {
            props = Parent;
            Parent = void 0;
        }

        if (!Parent) {
            Class.prototype._mergeProps = props;
        }
        else if (props) {
            Class.prototype._mergeProps = (Parent.prototype._mergeProps || []).concat(props);
        }
    };

    Organic.mixMerge(Backbone.Model, ['defaults', 'relations']);
    Organic.mixMerge(Backbone.Collection);
    Organic.mixMerge(Backbone.View, ['events']);
    Organic.mixMerge(Backbone.Router);
})(Organic);
