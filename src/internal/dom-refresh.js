Organic.MonitorDOMRefresh = function (view) {
    function handleShow() {
        view._isShown = true;
        triggerDOMRefresh();
    }

    function handleRender() {
        view._isRendered = true;
        triggerDOMRefresh();
    }

    function triggerDOMRefresh() {
        if (view._isShown && view._isRendered && Organic.isNodeAttached(view.el)) {
            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod('dom:refresh');
            }
        }
    }

    view.on({
        show: handleShow,
        render: handleRender
    });
};
