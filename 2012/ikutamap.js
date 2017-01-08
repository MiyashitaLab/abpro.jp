  window.___gcfg = {lang: 'ja'};
  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();

var ctxPath = '';
var cryptEventCd = '1649804e4e2717f6d25dbe4402177d5067820c3932083d9bab21df116ec6efe2';
var eventId = '7681';

$(function() {
	var mapdiv = document.getElementById("map_canvas");
	var geocoder = new google.maps.Geocoder();
	var adr = '神奈川県神奈川県川崎市多摩区東三田1-1-1';
	var encodeAddress =  '%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E5%B7%9D%E5%B4%8E%E5%B8%82%E5%A4%9A%E6%91%A9%E5%8C%BA%E6%9D%B1%E4%B8%89%E7%94%B01-1-1';
	geocoder.geocode({'address': adr},function(results,status){
		if (status == google.maps.GeocoderStatus.OK) {
			var latlng = results[0].geometry.location;
			var myOptions = {
					zoom: 14,
					center: latlng,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					scaleControl: true
			};
			var map = new google.maps.Map(mapdiv, myOptions);
			var marker = new google.maps.Marker({
				position: latlng,
				map: map,
				draggable: true
			});
			var p = marker.position;
			var lat = p.lat();
			var lng = p.lng();
			document.getElementById("googlemaplink").href="http://maps.google.co.jp/maps?f=q&q="+encodeAddress+"&hl=ja&ll="+lat+","+lng+"&t=m&z=16";
			map.setCenter(results[0].geometry.location);
			marker.setPosition(results[0].geometry.location);
		};
	});
});
