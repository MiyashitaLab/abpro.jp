
var ERROR_COMMENT = "ReadingFileErrorOccurred";
var DIMENSION = 2;
var INTERVAL = 50;
var CANVAS_NAME = 'countdownCanvas';
var WIDTH = 1000;
var HEIGHT = 900;

var old_time = 0;
var timer;
var mouse_old_time = 0;
var model = new Array();

$(function () {
	init();
    //loadSpreadSheet('https://spreadsheets.google.com/spreadsheet/embeddedform?formkey=dHhwVFAxUmhpUkdFRktyOHJGTkpPWnc6MQ');
});

function init () {
	for (var mid=0; mid<model.length; mid++) {
		model[mid].animation.key = 0;
		model[mid].animation.time = 0;
		model[mid].cluster = $.cloneObject(model[mid].init);
	}
	old_time = (new Date()).getTime();

	var canvas = document.getElementById(CANVAS_NAME);
	if (!canvas || !canvas.getContext)
		return false;
	canvas.style.width = WIDTH + 'px';
	canvas.style.height = HEIGHT + 'px';
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

    $('#sheetButton').click('click', function (event) {
        $('#sheetCover').fadeIn(1000);
    });
    $(window).bind('mousemove', function (event) {
        var t = (new Date()).getTime();
        if (t - mouse_old_time > 10) {
            var r = Math.floor(255 * Math.random());
            var g = Math.floor(255 * Math.random());
            var b = Math.floor(255 * Math.random());
            model[0].cluster.particle.unshift({
    			type: 'text',
    			image: "★",
                font: '15px Impact',
    			position: [event.pageX, event.pageY,0],
    			accelaration: [0,0,0],
    			mass: 1,
    			color: r + ',' + g + ',' + b,
    			opacity: 1,
    			maxLife: 2.7,
    			life: 2
    		});
        }
        
        mouse_old_time = t;
        return false;
    });


	if (timer)
		clearTimeout(timer);
	timer = setTimeout(draw, INTERVAL);
}

function update () {
	var time = (new Date()).getTime();
	var dt = (time - old_time) / 1000;
	
	for (var mid=0; mid<model.length; mid++) {
		t = model[mid].animation.time + dt;
		if (t > model[mid].animation.maxTime) {
			if (model[mid].animation.returnTo != null)
				t = model[mid].animation.returnTo;
			else;
				t = model[mid].animation.maxTime;
		}
		model[mid].animation.time = t;

		var frame = model[mid].animation.frame;
		var s = model[mid].cluster.source;
		var p = model[mid].cluster.particle;
	
		if (model[mid].animation.interpolation == 'liner') {
			var key = floorFrame(frame, t);
			var k1 = key;
			var k2 = (key+1) % frame.length;
			t = (t - frame[k1].time) / (frame[k2].time - frame[k1].time);
			var c1 = frame[k1].cluster;
			var c2 = frame[k2].cluster;
			model[mid].cluster.center = select(model[mid].cluster.center, c1.position, c2.center, t, lerp2);
			model[mid].cluster.position = select(model[mid].cluster.position, c1.position, c2.position, t, lerp2);
			model[mid].cluster.rotation = select(model[mid].cluster.rotation, c1.rotation, c2.rotation, t, lerp1);
			model[mid].cluster.scale = select(model[mid].cluster.scale, c1.scale, c2.scale, t, lerp1);
		
			model[mid].animation.key = key;
		
			for (var i=0; i<s.length; i++) {	
				if (s[i].type == 'wind/spot') {
				
					for (var j=0; j<p.length; j++) {
						var ln = dist(p[j].position, s[i].position);
                        if (ln > 0)
    						for (var k=0; k<DIMENSION; k++)
	    						p[j].accelaration[k] += dt * s[i].force * (p[j].position[k] - s[i].position[k]) / ln;
					}
				}
				else if (s[i].type == 'wind/direction') {
					for (var j=0; j<p.length; j++) {
						for (var k=0; k<DIMENSION; k++)
							p[j].accelaration[k] += dt * s[i].force[k];
					}
				}
			}
	
			for (var i=0; i<p.length; i++) {	
				for (var j=0; j<DIMENSION; j++) {
					p[i].position[j] += dt * p[i].accelaration[j];
				}
				p[i].life -= dt;
				p[i].opacity = p[i].life / p[i].maxLife;
				if (p[i].life < 0)
					p.pop(i);
			}
		}
	}
	
	old_time = time;
}

function draw () {
	update();
	
	var canvas = document.getElementById(CANVAS_NAME);
	if (!canvas || !canvas.getContext)
		return false;
		
	var ctx = canvas.getContext('2d');
		
	ctx.clearRect(0,0,WIDTH,HEIGHT);	

	for (var mid=0; mid<model.length; mid++) {
		var c = model[mid].cluster;
		var p = model[mid].cluster.particle;
	
		ctx.save();

		var rad = c.rotation;
		
		ctx.setTransform(1,0,0,1, -c.center[0], -c.center[1]);
		ctx.transform(Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), 0, 0);
		ctx.transform(c.scale, 0, 0, c.scale, c.position[0], c.position[1]);
		ctx.transform(1,0,0,1, c.center[0], c.center[1]);
	
		for (var i=0; i<p.length; i++) {
			if (p[i].type == 'text') {
	        	ctx.font = (p[i].font) ? p[i].font : '30px Impact';
				ctx.fillStyle = 'rgba(' + p[i].color + ',' + p[i].opacity + ')';
				ctx.fillText(p[i].image, p[i].position[0], p[i].position[1]);
			}
		}
		
		ctx.restore();
	}

	clearTimeout(timer);
	return timer = setTimeout(draw, INTERVAL);
}
/*
function loadSpreadSheet (url) {
    var form = $('#countdownForm');
    form.text("Loading...");

    $.ajax({
        type: 'get',
        url: 'sheet.php',
        data: {
            url: url
        },
        success: function (data) {
            form.empty();
            if (data.indexOf(ERROR_COMMENT) >= 0) {
                form.text('Load Failed');
            }
            form.append(data);
        }
    });
}
*/

$.cloneObject = function (obj) {
	var c = (obj instanceof Array) ? [] : {};
	for (var i in obj) {
		var prop = obj[i];
 
		if (typeof prop == 'object') {
			if (prop instanceof Array) {
				c[i] = [];
 
				for (var j = 0; j < prop.length; j++) {
					if (typeof prop[j] != 'object')
						c[i].push(prop[j]);
					else
						c[i].push($.cloneObject(prop[j]));
				}
			}
			else
				c[i] = $.cloneObject(prop);
		}
		else
			c[i] = prop;
	}
 
	return c;
}

function dist (p1, p2) {
	var t;
	var ln = 0;
	for (var i=0; i<DIMENSION; i++) {
		t = p1[i] - p2[i];
		ln += t*t;
	}
	return Math.sqrt(ln);
}

function floorFrame (frame, t) {
	for (var i=0; i<frame.length; i++) {
		if (t >= frame[i].time)
			return (i);
	}
}

function select (p0, p1, p2, t, lerp) {
	if (p1 != null) {
		if (p2 != null) 
			return lerp(p1, p2, t);
		else
			return p1;
	}
	else if (p2 != null)
		return p2;
	else
		return p0;
}

function lerp1 (p1, p2, t) {
	return (1-t) * p1 + t * p2;
}

function lerp2 (p1, p2, t) {
	var p = new Array(2);
	p[0] = (1-t) * p1[0] + t * p2[0];
	p[1] = (1-t) * p1[1] + t * p2[1];
	return p;
}


model[0] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/spot',
			position: [100,100,0],
			force: 0.0,
			mass: Math.POSITIVE_INFINITY
		}, {
			type: 'wind/direction',
			force: [0,300,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: []
	},
	
	animation: {
		interpolation: 'liner',
		returnTo: null,
		maxTime: 10,
		frame: [{
			time: 0,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 10,
			cluster: {
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[1] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/spot',
			position: [100,100,0],
			force: 0.0,
			mass: Math.POSITIVE_INFINITY
		}, {
			type: 'wind/direction',
			force: [0,0,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "image.png",
			position: [30,50,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}, {
			type: 'text',
			image: "★",
			position: [50,60,0],
			accelaration: [0,90,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 3,
			life: 3
		}, {
			type: 'text',
			image: "星",
			position: [70,100,0],
			accelaration: [60,40,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "かきくけこ",
			position: [50,40,0],
			accelaration: [50,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 3,
			life: 3
		}, {
			type: 'text',
			image: "あいうえお",
			position: [50,80,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 10,
		frame: [{
			time: 0,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 10,
			cluster: {
				rotation: Math.PI/6,
				position: [0,50,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};
