describe('Organic.merge', function () {
    'use strict';

    describe('when merging with parent', function () {
        beforeEach(function () {
            this.defaultMergeProps = ['events', 'ui', 'triggers', 'modelEvents', 'collectionEvents'];
            this.customMergeProps = ['customProp'];

            this.ParentView = Organic.View.extend({
                ui: {
                    bar: '.bar'
                },

                customProp: [1]
            });

            this.View = this.ParentView.merge({
                ui: {
                    foo: '.foo'
                },

                customProp: [2],

                mergeProps: this.customMergeProps
            });
        });

        it('should set `mergeProps`', function () {
            expect(this.ParentView.prototype._mergeProps).to.eql(this.defaultMergeProps);

            expect(this.View.prototype.mergeProps).to.eql(this.customMergeProps);
            expect(this.View.prototype._mergeProps).to.eql(this.defaultMergeProps);
        });

        it('should merge custom and default properties', function () {
            expect(this.View.prototype.ui).to.eql({
                bar: '.bar',
                foo: '.foo'
            });

            expect(this.View.prototype.customProp).to.eql([1, 2]);
        });

        it('should not modify parent properties', function () {
            expect(this.ParentView.prototype.ui).to.eql({
                bar: '.bar'
            });

            expect(this.ParentView.prototype.customProp).to.eql([1]);
        });

        describe('when merging with child', function () {
            beforeEach(function () {
                this.ChildView = this.View.merge({
                    ui: {
                        baz: '.baz'
                    },

                    customProp: [3]
                });
            });

            it('should unset `mergeProps`', function () {
                expect(this.ChildView.prototype.mergeProps).to.eql([]);
                expect(this.ChildView.prototype._mergeProps).to.eql(this.defaultMergeProps);
            });

            it('should not modify own custom properties', function () {
                expect(this.ChildView.prototype.customProp).to.eql([3]);
            });

            it('should merge default properties', function () {
                expect(this.ChildView.prototype.ui).to.eql({
                    bar: '.bar',
                    foo: '.foo',
                    baz: '.baz'
                });
            });
        });
    });
});
