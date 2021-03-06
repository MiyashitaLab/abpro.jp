
var ERROR_COMMENT = "ReadingFileErrorOccurred";
var DIMENSION = 2;
var INTERVAL = 50;
var CANVAS_NAME = 'countdownCanvas';
var WIDTH = 1330;
var HEIGHT = 1400;

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
        model[mid].isEnable = false;
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


    $(window).bind('mousemove', function (event) {
        var t = (new Date()).getTime();
        if (t - mouse_old_time > 10) {
            var r = Math.floor(255 * Math.random());
            var g = Math.floor(255 * Math.random());
            var b = Math.floor(255 * Math.random());
            model[0].cluster.particle.unshift({
    			type: 'text',
    			image: "■",
                font: '8px Impact',
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

        if (model[mid].animation.start <= t && model[mid].animation.end >= t)
            model[mid].isEnable = true;
        else
            model[mid].isEnable = false;
        
        if (model[mid].isEnable) {

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
                    if (p[i].life != Math.POSITIVE_INFINITY) {
        				p[i].life -= dt;
        				p[i].opacity = p[i].life / p[i].maxLife;
        				if (p[i].life < 0)
        					p.pop(i);
                    }
    			}
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
        if (model[mid].isEnable) {
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


/*model[0] = {
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
};*/


model[1] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[2] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[3] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[4] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[5] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[6] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[7] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

/////////////////////////

model[8] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[9] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[10] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[11] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[12] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[13] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[14] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[15] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [],
		particle: [{
			type: 'text',
			image: "◈",
			position: [250,700,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [245,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [255,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},]
	},
	
	animation: {
		start: 0,
		end: 5,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

//////////////////////////////


model[16] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[17] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[18] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[19] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[20] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[21] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.0,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[22] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [1150,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [1150,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1150,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1145,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [1155,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

/////////////////////////

model[23] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[24] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[25] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[26] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[27] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[28] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.0,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[29] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [250,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [250,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [250,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [245,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [255,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

///////////////////////////////////////////////////////////////////////////////////////


model[30] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [],
		particle: [{
			type: 'text',
			image: "◈",
			position: [850,700,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [845,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [855,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},]
	},
	
	animation: {
		start: 0,
		end: 5,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[31] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[32] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[33] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[34] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[35] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[36] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[37] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

/////////////////////////

model[38] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[39] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[40] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[41] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[42] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 3.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[43] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[44] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "☆",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "☆",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[45] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [],
		particle: [{
			type: 'text',
			image: "◈",
			position: [550,700,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [545,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [555,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},]
	},
	
	animation: {
		start: 0,
		end: 5,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

//////////////////////////////


model[46] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[47] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[48] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[49] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[50] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[51] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.0,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[52] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [850,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [850,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [850,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [845,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [855,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

/////////////////////////

model[53] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '250,60,50',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.5,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[54] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.6,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[55] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '244,232,98',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.7,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[56] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '98,247,132',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.8,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[57] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '99,235,245',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 4.9,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[58] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '85,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '115,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.0,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[59] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [{
			type: 'wind/spot',
			position: [550,220,0],
			force: 70,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "♡",
			position: [550,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [550,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,220,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [545,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,215,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "♡",
			position: [555,225,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '223,100,244',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
		start: 5.1,
		end: 8,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

model[60] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 0,
		source: [],
		particle: [{
			type: 'text',
			image: "◈",
			position: [1150,700,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [1145,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},{
			type: 'text',
			image: "◈",
			position: [1155,705,0],
			accelaration: [0,-150,0],
			mass: 1,
			color: '248,253,142',
			opacity: 1,
			maxLife: 3,
			life: 3
		},]
	},
	
	animation: {
		start: 0,
		end: 5,
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
				rotation: 0,
				position: [0,0,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,//cluster0,
};

//////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////


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

model[61] = {
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
			force: [3,5,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,100,0],
			accelaration: [210,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [-30,180,0],
			accelaration: [100,10,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "わー",
			position: [0,230,0],
			accelaration: [250,0,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,430,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [0,400,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [30,130,0],
			accelaration: [190,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 9,
			life: 9
		}, {
			type: 'text',
			image: "わー",
			position: [-70,130,0],
			accelaration: [350,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "キャー",
			position: [50,300,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
        start: 10,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 10,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};

model[62] = {
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
			force: [3,5,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '32, 32, 224',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,100,0],
			accelaration: [210,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [-30,180,0],
			accelaration: [100,10,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "わー",
			position: [0,230,0],
			accelaration: [250,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,430,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [0,400,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [30,130,0],
			accelaration: [190,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 9,
			life: 9
		}, {
			type: 'text',
			image: "わー",
			position: [-70,130,0],
			accelaration: [350,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "キャー",
			position: [50,300,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
        start: 9,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 9,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,300,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                scale: 1.3
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[63] = {
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
			force: [3,5,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,100,0],
			accelaration: [210,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [-30,180,0],
			accelaration: [100,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "わー",
			position: [0,230,0],
			accelaration: [250,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,430,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [0,400,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [30,130,0],
			accelaration: [190,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 9,
			life: 9
		}, {
			type: 'text',
			image: "わー",
			position: [-70,130,0],
			accelaration: [350,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "キャー",
			position: [50,300,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
        start: 9,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 9,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,500,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                rotation: 0.3,
                scale: 1.2
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[64] = {
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
			force: [3,5,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [-200,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [-20,100,0],
			accelaration: [-210,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-30,180,0],
			accelaration: [-100,10,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "わー",
			position: [0,230,0],
			accelaration: [-250,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はじまったー",
			position: [-30,430,0],
			accelaration: [-200,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "ごろごろごろ",
			position: [0,400,0],
			accelaration: [-200,0,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [-100,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [30,130,0],
			accelaration: [-190,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 9,
			life: 9
		}, {
			type: 'text',
			image: "どどどどど",
			position: [-70,130,0],
			accelaration: [-350,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "キャー",
			position: [50,300,0],
			accelaration: [-100,0,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
        start: 9,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 9,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [1300,100,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                rotation: -0.3,
                scale: 1.2
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[65] = {
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
			force: [3,5,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,100,0],
			accelaration: [210,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [-30,180,0],
			accelaration: [100,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "わー",
			position: [0,230,0],
			accelaration: [250,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,430,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [0,400,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [30,130,0],
			accelaration: [190,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 9,
			life: 9
		}, {
			type: 'text',
			image: "わー",
			position: [-70,130,0],
			accelaration: [350,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "キャー",
			position: [50,300,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
        start: 9,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 9,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [400,500,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                rotation: 0.3,
                scale: 1.2
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[65] = {
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
			force: [3,5,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '32, 32, 224',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,100,0],
			accelaration: [210,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [-30,180,0],
			accelaration: [100,10,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "わー",
			position: [0,230,0],
			accelaration: [250,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,430,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [0,400,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "参加募集中！",
			position: [30,130,0],
			accelaration: [190,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 9,
			life: 9
		}, {
			type: 'text',
			image: "わー",
			position: [-70,130,0],
			accelaration: [350,0,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "キャー",
			position: [50,300,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
        start: 9,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 9,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,500,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                rotation: 0.3,
                scale: 1.2
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[66] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/direction',
			force: [0,60,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "参加募集中！",
			position: [0,50,0],
			accelaration: [0,200,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,300,0],
			accelaration: [0,10,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [30,410,0],
			accelaration: [0,20,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "参加募集中！",
			position: [0,230,0],
			accelaration: [0,800,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,430,0],
			accelaration: [-30,600,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [0,400,0],
			accelaration: [-10,700,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [430,130,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 19,
			life: 19
		}, {
			type: 'text',
			image: "わー",
			position: [400,0,0],
			accelaration: [0,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "キャー",
			position: [350,0,0],
			accelaration: [5,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 23,
			life: 23
		}]
	},
	
	animation: {
        start: 12,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 12,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                scale: 1
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[67] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/spot',
			position: [580,380,0],
			force: 90.0,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [0,200,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [1300,300,0],
			accelaration: [0,-10,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [30,410,0],
			accelaration: [0,20,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "参加募集中！",
			position: [0,230,0],
			accelaration: [0,800,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "参加募集中！",
			position: [700,490,0],
			accelaration: [-30,600,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [300,400,0],
			accelaration: [-10,700,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "参加募集中！",
			position: [50,450,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [430,130,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 19,
			life: 19
		}, {
			type: 'text',
			image: "わー",
			position: [400,0,0],
			accelaration: [0,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "キャー",
			position: [350,0,0],
			accelaration: [5,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 23,
			life: 23
		}]
	},
	
	animation: {
        start: 12,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 12,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [600,400,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                scale: 1
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[68] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/direction',
			force: [-30,-70,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [900,500,0],
			accelaration: [0,-100,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ひょわー",
			position: [1000,500,0],
			accelaration: [0,-80,0],
			mass: 1,
			color: '25,204,28',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [1200,610,0],
			accelaration: [0,20,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "べー",
			position: [1000,230,0],
			accelaration: [0,800,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "ららららら",
			position: [900,330,0],
			accelaration: [-30,600,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [200,700,0],
			accelaration: [-10,-70,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [0,-100,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ぎゃーーー",
			position: [430,130,0],
			accelaration: [0,-70,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 19,
			life: 19
		}, {
			type: 'text',
			image: "わー",
			position: [400,0,0],
			accelaration: [0,-110,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "参加募集中！",
			position: [350,0,0],
			accelaration: [5,-20,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 23,
			life: 23
		}]
	},
	
	animation: {
        start: 12,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 12,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                scale: 1
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[69] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/spot',
			position: [600,400,0],
			force: 0.0,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [0,50,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '32, 32, 224',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,100,0],
			accelaration: [210,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [-30,180,0],
			accelaration: [100,10,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "わー",
			position: [0,230,0],
			accelaration: [250,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,30,0],
			accelaration: [200,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [50,30,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [-100,0,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [30,130,0],
			accelaration: [190,0,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 9,
			life: 9
		}, {
			type: 'text',
			image: "わー",
			position: [-70,130,0],
			accelaration: [350,0,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "キャー",
			position: [50,300,0],
			accelaration: [100,0,0],
			mass: 1,
			color: '128,128, 255',
			opacity: 1,
			maxLife: 3,
			life: 3
		}]
	},
	
	animation: {
        start: 9,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 9,
			cluster: {
				center: [500,400,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                scale: 3,
                rotation: 4.2
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[70] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/direction',
			force: [0,-6,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "参加募集中！",
			position: [0,50,0],
			accelaration: [-40,-200,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "開催！！",
			position: [-20,300,0],
			accelaration: [0,-10,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "ワー",
			position: [30,410,0],
			accelaration: [0,20,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "参加募集中！",
			position: [0,-230,0],
			accelaration: [0,800,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "おーーーー",
			position: [-30,30,0],
			accelaration: [-30,-30,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "わー",
			position: [0,400,0],
			accelaration: [-10,-50,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 7,
			life: 7
		}, {
			type: 'text',
			image: "はなび",
			position: [50,130,0],
			accelaration: [50,-30,0],
			mass: 1,
			color: '64,255,192',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "どーーーーーーーん",
			position: [430,130,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 19,
			life: 19
		}, {
			type: 'text',
			image: "わー",
			position: [400,0,0],
			accelaration: [0,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 10,
			life: 10
		}, {
			type: 'text',
			image: "キャー",
			position: [350,0,0],
			accelaration: [5,10,0],
			mass: 1,
			color: '82, 244, 2',
			opacity: 1,
			maxLife: 23,
			life: 23
		}]
	},
	
	animation: {
        start: 12,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 12,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                scale: 1
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
model[71] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [0,0,0],
		mass: 1,
		source: [{
			type: 'wind/direction',
			force: [0,-6,0],
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "アブプロはじまるよー！",
			position: [250,0,0],
			accelaration: [0,100,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "開催！！",
			position: [30,0,0],
			accelaration: [0,20,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "スタート",
			position: [30,410,0],
			accelaration: [0,20,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 15,
			life: 15
		}, {
			type: 'text',
			image: "参加募集開始",
			position: [-10,400,0],
			accelaration: [-5,20,0],
			mass: 1,
			color: '250,0,95',
			opacity: 1,
			maxLife: 17,
			life: 17
		}, {
			type: 'text',
			image: "用意！",
			position: [-30,30,0],
			accelaration: [-30,-30,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: 20,
			life: 20
		}, {
			type: 'text',
			image: "申込はお早めに",
			position: [0,400,0],
			accelaration: [-10,-50,0],
			mass: 1,
			color: '255,96,20',
			opacity: 1,
			maxLife: 17,
			life: 17
		}]
	},
	
	animation: {
        start: 8,
        end: 100,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 100,
		frame: [{
			time: 8,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [0,0,0],
				accelaration: [0,0,0],
				mass: 1,
			}
		},{
			time: 100,
			cluster: {
                scale: 1
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
/*
model[2] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [50,0,0],
		mass: 1,
		source: [],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [30,50,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,128,128',
			opacity: 1,
			maxLife: Math.POSITIVE_INFINITY,
			life: Math.POSITIVE_INFINITY
		}, {
			type: 'text',
			image: "ワン",
			position: [50,70,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '255,64,128',
			opacity: 1,
			maxLife: Math.POSITIVE_INFINITY,
			life: Math.POSITIVE_INFINITY
		}]
	},
	
	animation: {
        start: 0,
        end: 5,
		interpolation: 'liner',
		returnTo: 0,
		maxTime: 20,
		frame: [{
			time: 0,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [50,1350,0],
				accelaration: [0,0,0],
			}
		},{
			time: 5,
			cluster: {
				position: [50,100,0]
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};

model[3] = {
	init: {
		boundary: 'circle',
		center: [0,0,0],
		scale: 1.0,
		rotation: 0,
		position: [50,0,0],
		mass: 1,
		source: [{
			type: 'wind/spot',
			position: [50,100,0],
			force: 0.0,
			mass: Math.POSITIVE_INFINITY
		}],
		particle: [{
			type: 'text',
			image: "ABPro2011",
			position: [30,100,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '32, 32, 224',
			opacity: 1,
			maxLife: 5,
			life: 5
		}, {
			type: 'text',
			image: "ワン",
			position: [70,100,0],
			accelaration: [0,0,0],
			mass: 1,
			color: '128,128,255',
			opacity: 1,
			maxLife: 5,
			life: 5
		}]
	},
	
	animation: {
        start: 5,
        end: 10,
		interpolation: 'liner',
		returnTo: null,
		maxTime: 20,
		frame: [{
			time: 5,
			cluster: {
				center: [0,0,0],
				scale: 1.0,
				rotation: 0,
				position: [50,100,0],
				accelaration: [0,0,0],
			}
		}, {
			time: 10,
			cluster: {
			}
		}],
		key: null,
		time: null
	},
	
	cluster: null,
};
*/
