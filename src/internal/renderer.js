Organic.Renderer = {
    render: function (template, data) {
        if (!template) {
            return '';
        }

        if (typeof template === 'function') {
            return template(data);
        }
        else {
            return template;
        }
    }
};
