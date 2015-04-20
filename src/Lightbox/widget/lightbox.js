/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console */
/*mendix */
/*
    lightbox
    ========================

    @file      : lightbox.js
    @version   : 
    @author    : Pauline Oudeman
    @date      : Mon, 20 Apr 2015 12:05:48 GMT
    @copyright : 
    @license   : 

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
require({
    packages: [{
        name: 'jquery',
        location: '../../widgets/lightbox/lib',
        main: 'jquery-1.11.2.min'
    },
              {
        name: 'lightbox',
        location: '../../widgets/lightbox/lib',
        main: 'lightbox-min'
    }]
}, [
    'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin',
    'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/text',
    'jquery', 'lightbox', 'dojo/text!lightbox/widget/template/lightbox.html'
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, $, lightbox, widgetTemplate) {
    'use strict';

    // Declare widget's prototype.
    return declare('lightbox.widget.lightbox', [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,
        _contextObj: null,
        _handle: null, 
        
        postCreate: function () {

        },

        update: function (obj, callback) {
            if (obj) {
                this._contextObj = obj;
                this._resetSubscriptions();
            }
            this.fetchImages();
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
            domConstruct.place(imgList, this.domNode);
        },

        _resetSubscriptions: function () {
            // Release handle on previous object, if any.
            if (this._handle) {
                this.unsubscribe(this._handle);
                this._handle = null;
            }

            if (this._contextObj) {
                this._handle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function(guid){
                        mx.data.get({
                            guid: guid, 
                            callback: lang.hitch(this, this._fetchImages)
                        });
                    })
                });
            }
        }
    });
});