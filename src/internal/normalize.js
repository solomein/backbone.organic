Organic.normalizeMethods = function (hash) {
    return _.reduce(hash, function (normalizedHash, method, name) {
        if (!_.isFunction(method)) {
            method = this[method];
        }

        if (method) {
            normalizedHash[name] = method;
        }

        return normalizedHash;
    }, {}, this);
};

Organic.normalizeUIString = function (uiString, ui) {
    return uiString.replace(/@ui\.[a-zA-Z_$0-9]*/g, function (r) {
        return ui[r.slice(4)];
    });
};

Organic.normalizeUIKeys = function (hash, ui) {
    return _.reduce(hash, function (memo, val, key) {
        var normalizedKey = Organic.normalizeUIString(key, ui);
        memo[normalizedKey] = val;

        return memo;
    }, {});
};

Organic.normalizeUIValues = function (hash, ui) {
    _.each(hash, function (val, key) {
        if (_.isString(val)) {
            hash[key] = Organic.normalizeUIString(val, ui);
        }
    });

    return hash;
};
