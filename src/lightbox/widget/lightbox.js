define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",

    "dojo/text!lightbox/widget/template/lightbox.html",

    "lightbox/lib/jquery",
    "lightbox/lib/lightbox"
], function (declare, _WidgetBase, _TemplatedMixin, dom, domStyle, domConstruct, dojoArray, lang, widgetTemplate) {
    "use strict";

    return declare("lightbox.widget.lightbox", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,

        // Internal objects
        _boxName: null,

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            if (obj) {
                this._contextObj = obj;
                this._resetSubscriptions();
                this._setBoxName(callback);
            } else {
                mendix.lang.nullExec(callback);
            }
        },

        _fetchImages: function (callback) {
            logger.debug(this.id + "._fetchImages");
            var xpath = "//" + this.lbImage + this.lbImageConstraint;
            if (this._contextObj) {
                xpath = xpath.replace(/\[%CurrentObject%\]/g, this._contextObj.getGuid());
                mx.data.get({
                    xpath: xpath,
                    callback: lang.hitch(this, this._renderList, callback)
                });
            } else if (!this._contextObj && (xpath.indexOf("[%CurrentObject%]") > -1)) {
                console.warn("No context for xpath, not fetching.");
                mendix.lang.nullExec(callback);
            } else {
                mx.data.get({
                    xpath: xpath,
                    callback: lang.hitch(this, this._renderList, callback)
                });
            }
        },

        _setBoxName: function (callback) {
            this._boxName = this.boxName;
            if (this.dynamicBoxName && this._contextObj) {
                this._contextObj.fetch(this.dynamicBoxName, lang.hitch(this, function (name) {
                    if (name) {
                        this._boxName = name;
                    }
                    this._fetchImages(callback);
                }));
            } else {
                this._fetchImages(callback);
            }
        },

        _renderList: function (callback, images) {
            logger.debug(this.id + "._renderList");
            var i = null,
                listitem = null,
                image = null,
                link = null,
                img = null,
                imgList = dom.create("ul", {
                    "class": this.id + "_uolist"
                });

            for (i = 0; i < images.length; i++) {
                listitem = dom.create("li");
                image = images[i];
                link = dom.create("a", {
                    "href": "file?target=internal&guid=" + image.getGuid(),
                    "data-lightbox": "mx-lightbox-" + this._boxName
                });

                domStyle.set(link, {
                    "display": "inline-block"
                });

                if (image.get("PublicThumbnailPath") !== "") {
                    //do sth with the thumbnail
                } else {
                    //make your own thumbnail
                    img = dom.create("img", {
                        "src": "file?target=internal&guid=" + image.getGuid()
                    });
                    domStyle.set(img, {
                        "width": "100px",
                        "padding": ".5em"
                    });

                }

                if (img) {
                    domConstruct.place(img, link);
                    domConstruct.place(link, listitem);
                    domConstruct.place(listitem, imgList);
                }
            }

            domConstruct.empty(this.domNode);
            domConstruct.place(imgList, this.domNode);

            mendix.lang.nullExec(callback);
        },


        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            var _objectHandle = null,
                _attrHandle = null,
                _validationHandle = null;

            // Release handles on previous object, if any.
            if (this._handles) {
                this._handles.forEach(function (handle, i) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {

                _objectHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, this._fetchImages)
                });

                this._handles = [_objectHandle];
            }
        }
    });
});

require(["lightbox/widget/lightbox"]);
