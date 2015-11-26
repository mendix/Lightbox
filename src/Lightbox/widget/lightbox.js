/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, document, jQuery */
/*mendix */
/*
    lightbox
    ========================

    @file      : lightbox.js
    @version   : 2.1.0
    @author    : Pauline Oudeman, J.W. Lagendijk
    @date      : Fri, 24 Apr 2015 07:20:03 GMT
    @copyright :
    @license   : Apache License, Version 2.0
*/

define([
    'dojo/_base/declare',
    'mxui/widget/_WidgetBase',
    'dijit/_TemplatedMixin',

    'mxui/dom',
    'dojo/dom-style',
    'dojo/dom-construct',
    'dojo/_base/array',
    'dojo/_base/lang',

    'lightbox/lib/jquery-1.11.2.min',
    'lightbox/lib/lightbox-min',
    'dojo/text!lightbox/widget/template/lightbox.html'
], function (declare, _WidgetBase, _TemplatedMixin, dom, domStyle, domConstruct, dojoArray, lang, _jQuery, lightbox, widgetTemplate) {
    'use strict';

    var $ = jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare('lightbox.widget.lightbox', [_WidgetBase, _TemplatedMixin], {

        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        update: function (obj, callback) {
            if (obj) {
                this._contextObj = obj;
                this._resetSubscriptions();
            }
            this._fetchImages();
            callback();
        },

        _fetchImages: function () {
            var xpath = '//' + this.lbImage + this.lbImageConstraint;
            if (this._contextObj) {
                xpath = xpath.replace('[%CurrentObject%]', this._contextObj.getGuid());
                mx.data.get({
                    xpath: xpath,
                    callback: lang.hitch(this, this._renderList)
                });
            } else if (!this._contextObj && (xpath.indexOf('[%CurrentObject%]') > -1)) {
                console.warn('No context for xpath, not fetching.');
            } else {
                mx.data.get({
                    xpath: xpath,
                    callback: lang.hitch(this, this._renderList)
                });
            }
        },

        _renderList: function (images) {
            var i = null,
                listitem = null,
                image = null,
                link = null,
                img = null,
                imgList = dom.create('ul', {
                    'class': this.id + '_uolist'
                });
            for (i = 0; i < images.length; i++) {
                listitem = dom.create('li');
                image = images[i];
                link = dom.create('a', {
                    'href': 'file?target=internal&guid=' + image.getGuid(),
                    'data-lightbox': this.boxName
                });
                domStyle.set(link, {
                    'display': 'inline-block'
                });

                if (image.get('PublicThumbnailPath') !== '') {
                    //do sth with the thumbnail
                } else {
                    //make your own thumbnail
                    img = dom.create('img', {
                        'src': 'file?target=internal&guid=' + image.getGuid()
                    });
                    domStyle.set(img, {
                        'width': '100px',
                        'padding': '.5em'
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
        },


        // Reset subscriptions.
        _resetSubscriptions: function () {
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

                _objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._fetchImages()();
                    })
                });

                this._handles = [_objectHandle];
            }
        }
    });
});
require(['lightbox/widget/lightbox'], function () {
    'use strict';
});