dojo.require('Lightbox.lib.js.jquery');
dojo.require('Lightbox.lib.js.lightbox-min');

mxui.dom.addCss(dojo.moduleUrl('Lightbox.widget', 'ui/css/lightbox.css'));

dojo.declare("Lightbox.widget.lightbox", mxui.widget._WidgetBase, {
	_mxObj : null,

	postCreate : function(){
		this.actLoaded();
	},

	update : function(obj, callback){
		if(obj){
			this._mxObj = obj;
		}
		this.fetchImages();
		callback && callback();
	},

	fetchImages : function() {
		if(this._mxObj){
			this.lbImageConstraint = this.lbImageConstraint.replace('[%CurrentObject%]', this._mxObj.getGuid());
		}

		var xpath = '//' + this.lbImage + this.lbImageConstraint;

		mx.data.get({
			xpath : xpath,
			callback: function(images) {
				this.renderList(images);
			}
		}, this);
	},

	renderList : function(images) {
		var imgList = dojo.create('ul', { 'class' : this.id + '_uolist' });
		for (var i = 0; i < images.length; i++) {
			var listitem = dojo.create('li');
			var image = images[i];
			var link = dojo.create('a', { 'href' : 'file?target=internal&guid=' + image.getGuid(), 'data-lightbox' : this.boxName });
			dojo.style(link, {
				'display' : 'inline-block'
			});
			var img = null;

			if(image.get('PublicThumbnailPath') !== '') {
				//do sth with the thumbnail
			} else { 
				//make your own thumbnail
				img = dojo.create('img', { 'src' : 'file?target=internal&guid=' + image.getGuid() });
				dojo.style(img, {
					'width' : '100px',
					'padding' : '.5em'
				});
				
			}

			if(img){
				dojo.place(img, link);
				dojo.place(link, listitem);
				dojo.place(listitem, imgList);
			}

		};

		dojo.place(imgList, this.domNode);
	}
});
