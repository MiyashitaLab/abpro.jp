// forked from hakim's "js on 2010-6-18" http://jsdo.it/hakim/fxVB
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
  
var SCREEN_CENTER_X = window.innerWidth * 0.5;
var SCREEN_CENTER_Y = window.innerHeight * 0.5;
  
var RADIUS = 70;
  
var RADIUS_SCALE = 1;
var RADIUS_SCALE_MIN = 0.3;
var RADIUS_SCALE_MAX = 1.5; 
  
var QUANTITY = 25;

var canvas;
var context;
var particles;
var cnt=0;
var arcflag = false;

var mouseX = SCREEN_WIDTH * 0.5;
var mouseY = SCREEN_HEIGHT * 0.5;
var mouseIsDown = false;
var t;
var f;

var presenter = new Array(50);

var wheeldata = 0;

var rotatedeg = 0;
var xdeg=10;
var ydeg=75;
var hoverflag=0;
var nowid;
var matstring="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!#$%&()=-+*<>?"
var Crack = function(x, y) {
	this.x = x;
	this.y = y;
	this.flag = 0;
	this.life = 80;
	this.turnpoint = this.life-(Math.floor(Math.random()*6)+2);
	this.speed=40;
	this.draw = function() {
		context.moveTo(this.x, this.y);
		context.lineTo(this.x+this.speed-this.speed*Math.abs(this.flag),this.y+this.speed*this.flag);
		context.closePath();
		context.stroke();
		this.x+=this.speed-this.speed*Math.abs(this.flag);
		this.y+=this.speed*this.flag;
		this.life--;
		if(this.life==this.turnpoint) {
			this.flag=(Math.abs(this.flag)-1)*(Math.floor(Math.random()*3)-1);
			this.turnpoint=this.life-(Math.floor(Math.random()*6)+2);
		}
	};
}
var Abstr = function(x,y) {
	this.x=x;
	this.y=y;
	this.str=0;
	this.life=0;
	this.draw = function() {
		if(navigator.userAgent.indexOf("Mozilla") == -1) {
			context.shadowColor = 'rgba(0,255,255,0.6)';
			context.shadowOffsetX = 1;
			context.shadowOffsetY = 1;
			context.shadowBlur =10;
		}
		context.fillStyle = 'rgb(0,255,180)';
		context.fillText(matstring[this.str],this.x,this.y);
		this.life--;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur =0;
	}
}
var abstr = new Array();
for(var i in abmat) {
	for(var j in abmat[i]) {
		if(abmat[i][j] == "■") {
			abstr.push(new Abstr(300+20*j,400+20*i));
		}
	}
}
var crac = new Array();
var Matrix = function(x,y) {
	this.x = x;
	this.y = y;
	this.speed = 20;
	this.life = 200;
	this.draw = function() {
		if(this.life%2==0) {
			if(navigator.userAgent.indexOf("Mozilla") == -1) {
				context.shadowColor = 'rgb(0,255,255)';
				context.shadowOffsetX = 1;
				context.shadowOffsetY = 1;
				context.shadowBlur =10;
			}
			context.fillStyle = 'rgb(0,255,180)';
			context.font="24px 'Times New Roman'";
			context.fillText(matstring[Math.floor(Math.random()*matstring.length)],this.x,this.y);
			for (var i in abstr){
				if(abstr[i].x == this.x && abstr[i].y == this.y) {
					abstr[i].str=(Math.floor(Math.random()*matstring.length));
					abstr[i].life=150;
				}
			}
			this.y+=this.speed;
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur =0;
		}
		this.life--;
	};
}
var mat = new Array();
var Hamon = function() {
	this.r = window.innerWidth/2;
	this.rr = 60;
	this.x = window.innerWidth/2;
	this.y = window.innerHeight/2;
	this.check = function() {
		this.r+=15;
		context.fillStyle = 'rgba('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+',1)';
		context.beginPath();
		var rn = new Array(6);
		for (var i=0;i<rn.length;i++){
			rn[i]=Math.random()*7;
			context.arc(Math.floor(Math.cos(rn[i])*this.r/this.rr)*this.rr+this.x, Math.floor(Math.sin(rn[i])*this.r/this.rr)*this.rr+this.y, this.rr/2, 0,Math.PI*2, true);
		}
		var rn2 = new Array(6);
		for (var i=0;i<rn.length;i++){
			rn[i]=Math.random()*7;
			context.arc(Math.floor(Math.cos(rn2[i])*(this.r-this.rr)/this.rr)*this.rr+this.x, Math.floor(Math.sin(rn2[i])*(this.r-this.rr)/this.rr)*this.rr+this.y, this.rr/2, 0,Math.PI*2, true);
		}
		var rn3 = new Array(6);
		for (var i=0;i<rn.length;i++){
			rn[i]=Math.random()*7;
			context.arc(Math.floor(Math.cos(rn3[i])*(this.r-this.rr*2)/this.rr)*this.rr+this.x, Math.floor(Math.sin(rn3[i])*(this.r-this.rr*2)/this.rr)*this.rr+this.y, this.rr/2, 0,Math.PI*2, true);
		}
		context.fill();
	}
}
var hamon = new Hamon();

	var Blocks = function() {
		this.x = window.innerWidth;
		this.check = function() {
			this.x+=60;
			this.w=80;
			this.h=80;
			context.strokeStyle="rgb(0,255,180)";
			context.lineWidth=2;
			context.shadowColor = 'rgb(0,255,255)';
			context.shadowOffsetX = 1;
			context.shadowOffsetY = 1;
			context.shadowBlur =5;
  			context.beginPath();
			for(var i=0;i<10;i++) {
  				context.strokeRect(this.x, Math.floor(Math.random()*window.innerHeight), Math.floor(Math.random()*this.w), Math.floor(Math.random()*this.h));
			}
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur =0;
		}
	}
	var blocks = new Blocks();


	var Rndtext = function(str) {
		this.str = str;
		this.cnt = 0;
		this.speed = 5;
		this.check = function() {
			document.getElementById("testtext").innerText="";
			this.cnt++;
			for(var i=0;i<this.str.length && i<this.cnt/this.speed;i++) {
				document.getElementById("testtext").innerText += this.str[i];
			}
			if(this.str.length-1>this.cnt/this.speed) {
				document.getElementById("testtext").innerText += matstring[Math.floor(Math.random()*matstring.length)];
			}
		}
	}
	var rndtext = new Rndtext("Welcome_to_the_website_of_ABPro2012!");

	var Lightarc = function(rr) {
		this.r = window.innerWidth/2;
		this.rr = rr;
		this.x = Math.floor(Math.random()*window.innerWidth);
		this.y = Math.floor(Math.random()*window.innerHeight/4)+window.innerHeight/3;
		this.color = 'rgba('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+',1)';
		this.life = 200;
		this.check = function() {
			this.x+=this.rr/3;/*
			context.fillStyle = "rgb(0,0,0)";
			context.beginPath();
			context.arc(this.x-this.rr/3, this.y, this.rr/2+2, 0,Math.PI*2, true);
			context.fill();*/
			context.fillStyle = this.color;
			context.beginPath();
			context.arc(this.x, this.y, this.rr/2, 0,Math.PI*2, true);
			context.fill();
			this.life--;
		}
	}
	var lightarc = new Array();



  window.onload = init();

  function init() {

    canvas = document.getElementById( 'world' );
    
    if (canvas && canvas.getContext) {
      context = canvas.getContext('2d');
      
      // Register event listeners
      document.addEventListener('mousemove', documentMouseMoveHandler, false);
      document.addEventListener('mousedown', documentMouseDownHandler, false);
      document.addEventListener('mouseup', documentMouseUpHandler, false);
      document.addEventListener('touchstart', documentTouchStartHandler, false);
      document.addEventListener('touchmove', documentTouchMoveHandler, false);
		document.addEventListener("DOMMouseScroll", function(e){wheel(e);});
      window.addEventListener('resize', windowResizeHandler, false);
      
      createParticles();
      
      windowResizeHandler();
		setTimeout(init2,500);
    }
  }

	function init2() {
		t=document.getElementById("Info_tab");
		f=document.getElementById("Info_tab");


　		//var ring = document.getElementById('ring');
/*
		for(var i=0;i<presenter.length;i++) {
		presenter[i] = document.getElementById("presenter"+i);
		//presenter[i].id = "presenter"+i;
		presenter[i].className = "presenters";
		//ring.appendChild(presenter[i]);
	}

		setInterval( rotate, 100);*/
    	setInterval( loop, 1000 / 60 );
		//setInterval(limit.draw, 1000);
	}

var Gaz = function() {
	this.img = new Image();
	this.flag = false;
	//this.img.src = "img/"+printf("[%03d]¥n", gaz.lengths)+".jpg?" + new Date().getTime();
	this.img.src = "img/"+gaz.length+".jpg?" + new Date().getTime();
	/* 画像が読み込まれるのを待ってから処理を続行 */
	this.img.onload = function() {
		this.flag = true;
	}
	this.w = 140;
	this.h = 105;
	this.x = this.w*(gaz.length%Math.floor(1920/(this.w-5)));
	this.y = Math.floor(gaz.length/(1920/(this.w-5)))*this.h;
	this.draw = function() {
		if(mouseX > this.x && mouseX < this.x+this.w && mouseY > this.y && mouseY < this.y+this.h) {
			context.drawImage(this.img,this.x,this.y,this.w,this.h);
		}
		else if(mouseX > this.x-this.w && mouseX < this.x+this.w*2 && mouseY > this.y-this.h && mouseY < this.y+this.h*2) {
			context.save();
			context.globalAlpha = 0.01;
			context.drawImage(this.img,this.x,this.y,this.w,this.h);
			context.restore();
		}
	}
}
var gaz = new Array();
for(var i=0;i<146;i++) {
	gaz.push(new Gaz());
}

var Limit = function() {
	var d = new Date();
	var t = 1036800 - (d.getDate() * 86400 + d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds());//12日0時0分リミット計算
	this.draw = function() {
		t--;
		$("#timelimit")[0].innerText =""　+ Math.floor(t/3600) + ":" + Math.floor((t%3600)/60) + ":" + (t%60);
	}
}
var limit = new Limit();

function handle(delta) {
	if (delta < 0) // 下方向にまわした場合の処理
		wheeldata=10;
	else// 上方向にまわした場合の処理
		wheeldata=-10;
	document.body.scrollTop+=wheeldata;
}
/** Event handler for mouse wheel event.
 */
function wheel(event){
        var delta = 0;
        if (!event) /* For IE. */
                event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta/120;
                if (window.opera)
                        delta = -delta;
        } else if (event.detail) { /** Mozilla case. */
                delta = -event.detail/3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta)
                handle(delta);
        if (event.preventDefault) {
                event.preventDefault();
        }
        event.returnValue = false;
}
/** Initialization code. 
 * If you use your own event management code, change it as required.
 */
if (window.addEventListener) window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;

  function createParticles() {
    particles = [];
    
    for (var i = 0; i < QUANTITY; i++) {
      var particle = {
        size: 1,
        position: { x: mouseX, y: mouseY },
        offset: { x: 0, y: 0 },
        shift: { x: mouseX, y: mouseY },
        speed: 0.01+Math.random()*0.04,
        targetSize: 1,
        fillColor: '#' + (Math.random() * 0x0000ff + 0x0000ff | 0).toString(16),
        orbit: RADIUS*.3 + (RADIUS * .7 * Math.random())
      };
      
      particles.push( particle );
    }
  }

  function documentMouseMoveHandler(event) {
    mouseX = event.clientX  + document.body.scrollLeft;
    mouseY = event.clientY  + document.body.scrollTop;
  }
  
  function documentMouseDownHandler(event) {
    mouseIsDown = true;
  }
  
  function documentMouseUpHandler(event) {
    mouseIsDown = false;
  }

  function documentTouchStartHandler(event) {
    if(event.touches.length == 1) {
      event.preventDefault();

      mouseX = event.touches[0].pageX - (window.innerWidth - SCREEN_WIDTH) * .5;;
      mouseY = event.touches[0].pageY - (window.innerHeight - SCREEN_HEIGHT) * .5;
    }
  }
  
  function documentTouchMoveHandler(event) {
    if(event.touches.length == 1) {
      event.preventDefault();

      mouseX = event.touches[0].pageX - (window.innerWidth - SCREEN_WIDTH) * .5;;
      mouseY = event.touches[0].pageY - (window.innerHeight - SCREEN_HEIGHT) * .5;
    }
  }
  
  function windowResizeHandler() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    
    SCREEN_CENTER_X = SCREEN_WIDTH * .5;
    SCREEN_CENTER_Y = SCREEN_HEIGHT * .5;
    
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
  }

	function loop() {
		//document.getElementById("main").innerText=""+particle.orbit;
		if( hoverflag>0 ) {
			RADIUS_SCALE += ( RADIUS_SCALE_MAX - RADIUS_SCALE ) * (0.2);
		} else {
			RADIUS_SCALE -= ( RADIUS_SCALE - RADIUS_SCALE_MIN ) * (0.05);
		}
		
		RADIUS_SCALE = Math.min( RADIUS_SCALE, RADIUS_SCALE_MAX );
		
		context.fillStyle = 'rgba(0,0,0,0.1)';
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		
		if(arcflag) {
			for (var i in gaz) {
				gaz[i].draw();
			}
		}
		for (i = 0, len = particles.length; i < len; i++) {
			var particle = particles[i];
			
			var lp = { x: particle.position.x, y: particle.position.y };
			
			// Rotation
			if(50 > particle.orbit) {
				particle.offset.x -= particle.speed;
				particle.offset.y -= particle.speed;
			}else {
				particle.offset.x += particle.speed;
				particle.offset.y += particle.speed;
			}
			
			// Follow mouse with some lag
			particle.shift.x += ( mouseX - particle.shift.x) * (particle.speed);
			particle.shift.y += ( mouseY - particle.shift.y) * (particle.speed);
			
			// Apply position
			particle.position.x = particle.shift.x + Math.cos(i + particle.offset.x) * (particle.orbit*RADIUS_SCALE);
			particle.position.y = particle.shift.y + Math.sin(i + particle.offset.y) * (particle.orbit*RADIUS_SCALE);
			
			// Limit to screen bounds
			particle.position.x = Math.max( Math.min( particle.position.x, SCREEN_WIDTH ), 0 );
			particle.position.y = Math.max( Math.min( particle.position.y, SCREEN_HEIGHT ), 0 );
			
			particle.size += ( particle.targetSize - particle.size ) * 0.05;
			
			if( Math.round( particle.size ) == Math.round( particle.targetSize ) ) {
				particle.targetSize = 1 + Math.random() * 7;
			}
			context.beginPath();
			context.shadowColor = 'rgb(0,255,255)';
			context.shadowOffsetX = 1;
			context.shadowOffsetY = 1;
			context.shadowBlur =5;
			context.fillStyle = particle.fillColor;
			context.strokeStyle = particle.fillColor;
			context.lineWidth = particle.size;
			context.moveTo(lp.x, lp.y);
			//context.moveTo(particle.position.x, particle.position.y);
			context.lineTo(particle.position.x, particle.position.y);
			context.stroke();
			context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
			context.fill();
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur =0;
		}
		for (var i in crac){
			crac[i].draw();
			if(crac[i].life < 0) {
				delete crac[i];
			}
		}
		for (var i in mat){
			mat[i].draw();
			if(mat[i].life < 0) {
				delete mat[i];
			}
		}
		for (var i in abstr){
			if(abstr[i].life>0) {
				abstr[i].draw();
			}
		}
		if(hamon.r<window.innerWidth/2) {
			hamon.check();
		}
		if(blocks.x<window.innerWidth && cnt%5==0) {
			blocks.check();
		}
		//context.fillStyle = "rgb(0,0,0)";
		//context.fillRect(0, window.innerHeight/3, window.innerWidth, window.innerHeight/4+window.innerHeight/3);
		for (var i in lightarc){
			lightarc[i].check();
			if(lightarc[i].life < 0) {
				delete lightarc[i];
			}
		}
		//document.getElementsByClassName("contents")[0].style.webkitTransition="all 0s ease-in-out";//-webkit-transition: all 0.5s ease-in-out;
		//document.getElementById("info").style.webkitTransform="rotateY("+(mouseX-window.innerWidth/2)/30+"deg) rotateX("+(window.innerHeight/2-mouseY)/30+"deg)";
		drawinfo();
		if(rndtext.str.length>rndtext.cnt/rndtext.speed) {
			rndtext.check();
		}
	}
	


	function menuhover(evt) {
		hoverflag=1;
		t = evt.target        || evt.toElement;    // mouseOver した要素
		f = evt.relatedTarget || evt.fromElement;  // mouseOut した要素
		if(t.id.split("_tab").length>1) {
			document.getElementById(t.id.split("_tab")[0]).style.background="rgba(0, 255, 255,0.5)";
			//if(t.id.split("menu")[1] = "bo") {
			//	boclick(evt);
			//}
		}
	}
	function menuout(evt) {
		hoverflag=0;
		t = evt.relatedTarget        || evt.toElement;    // mouseOver した要素
		f = evt.target               || evt.fromElement;  // mouseOut した要素
		if(f.id.split("_tab").length>1) {
			document.getElementById(f.id.split("_tab")[0]).style.background="rgba(22, 33, 90,0.3)";
		}
	}
	function drawinfo() {
		cnt++;
		document.getElementById("stsclass").innerText = ""
		for(var i=0;i<16-Math.floor(cnt/10).toString(2).length;i++) {
			document.getElementById("stsclass").innerText +="_";
		}
		for(var i=0;i<Math.floor(cnt/10).toString(2).length;i++) {
			if(Math.floor(cnt/10).toString(2)[i]=="1"){
				document.getElementById("stsclass").innerText += "|";
			} else {
				document.getElementById("stsclass").innerText += "_";
			}
		}
 		document.getElementById("stsclass").innerText += "¥nout_id:"+t.id+"¥nlast_id:"+f.id+"¥n¥nmouseX:"+mouseX+"¥nmouseY:"+mouseY;
 		document.getElementById("stsclass").innerText += "¥n¥nPageScroll:"+document.body.scrollTop;
	}

	function conhover(evt) {
	}
	function infoclick(evt) {
		document.getElementById("Info").style.MozTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Info").style.webkitTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Info").style.left="100px";
		document.getElementById("Presenter").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.left="550px";
		document.getElementById("Application").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.left="580px";
		document.getElementById("Program").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.left="660px";
		document.getElementById("Archive").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.left="610px";
		document.getElementById("Committee").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.left="660px";
		arcflag = false;
	}
	function boclick(evt) {
		document.getElementById("Info").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.left="-400px";
		document.getElementById("Presenter").style.MozTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Presenter").style.webkitTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Presenter").style.left="100px";
		document.getElementById("Application").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.left="550px";
		document.getElementById("Program").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.left="630px";
		document.getElementById("Archive").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.left="580px";
		document.getElementById("Committee").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.left="630px";
		arcflag = false;
	}
	function moclick(evt) {
		document.getElementById("Info").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.left="-470px";
		document.getElementById("Presenter").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.left="-400px";
		document.getElementById("Application").style.MozTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Application").style.webkitTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Application").style.left="100px";
		document.getElementById("Program").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.left="550px";
		document.getElementById("Archive").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.left="570px";
		document.getElementById("Committee").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.left="620px";
		arcflag = false;
	}
	function proclick(evt) {
		document.getElementById("Info").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.left="-480px";
		document.getElementById("Presenter").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.left="-470px";
		document.getElementById("Application").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.left="-420px";
		document.getElementById("Program").style.MozTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Program").style.webkitTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Program").style.left="80px";
		document.getElementById("Archive").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.left="540px";
		document.getElementById("Committee").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.left="580px";
		arcflag = false;
	}
	function arclick(evt) {
		document.getElementById("Info").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.left="-950px";
		document.getElementById("Presenter").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.left="-940px";
		document.getElementById("Application").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.left="-930px";
		document.getElementById("Program").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.left="-920px";
		document.getElementById("Archive").style.MozTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Archive").style.webkitTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Archive").style.left="100px";
		document.getElementById("Committee").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Committee").style.left="950px";
		arcflag = true;
	}
	function unclick(evt) {
		document.getElementById("Info").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Info").style.left="-490px";
		document.getElementById("Presenter").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Presenter").style.left="-470px";
		document.getElementById("Application").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Application").style.left="-440px";
		document.getElementById("Program").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Program").style.left="-350px";
		document.getElementById("Archive").style.MozTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.webkitTransform="rotateY("+ydeg+"deg) rotateX("+xdeg+"deg)";
		document.getElementById("Archive").style.left="-400px";
		document.getElementById("Committee").style.MozTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Committee").style.webkitTransform="rotateY(0deg) rotateX(0deg)";
		document.getElementById("Committee").style.left="100px";
		arcflag = false;
	}
	function rotate() {
		bi=-10
		if(mouseX < SCREEN_WIDTH/3) {
			rotatedeg+=(SCREEN_WIDTH/3-mouseX)/200;
		}else if(mouseX > SCREEN_WIDTH/3*2) {
			rotatedeg-=(mouseX-SCREEN_WIDTH/3*2)/200;
		}
		for(var i=0;i<presenter.length;i++) {
			//presenter[i].style.zIndex=Math.floor((Math.cos(Math.PI/180*(rotatedeg+(360/presenter.length)*i+bi))*10+10));
			presenter[i].style.zIndex=i;
			presenter[i].style.webkitTransform="rotateY("+(rotatedeg+(360/presenter.length)*i)+"deg) scale("+(Math.cos(Math.PI/180*(rotatedeg+(360/presenter.length)*i+bi))*0.35+0.65)+")";
			presenter[i].style.left=""+(Math.sin(Math.PI/180*(rotatedeg+(360/presenter.length)*i))*SCREEN_WIDTH*(Math.cos(Math.PI/180*(rotatedeg+(360/presenter.length)*i+bi))+2)/4*3+SCREEN_CENTER_X)+"px";
			presenter[i].style.top=""+(150*((i%2)*2-1)*(Math.cos(Math.PI/180*(rotatedeg+(360/presenter.length)*i+bi))*0.35+0.65)+300)+"px";
			//presenter[i].innerText=""+(rotatedeg+(360/presenter.length)*i)+"deg"
		}
	}
	function crackline() {
		crac.push(new Crack(0,Math.floor( Math.random() * 1000 )));
	}
	function matrixeffect() {
		for(var i=0;i<190;i++) {
			mat.push(new Matrix(Math.floor(Math.random()*(window.innerWidth/20))*20,(Math.floor(Math.random()*15)-20)*20));
			mat.push(new Matrix(Math.floor(Math.random()*(window.innerWidth/20))*20,(Math.floor(Math.random()*15)-40)*20));
		}
	}
	function hamoneffect() {
		hamon.r=0;
	}
	function blockseffect() {
		blocks.x=0;
	}
	function rndtexttest() {
		rndtext.cnt=0;
	}
	function lighteffect() {
		for(var i=0;i<10;i++) {
			for(var j=0;j<20;j++) {
				lightarc.push(new Lightarc(i*2));
				lightarc.push(new Lightarc(i*2));
			}
		}
	}

function draw3(x,y) {
	context.fillStyle = 'rgb(0,255,180)';
	context.beginPath();
	context.arc(x, y, 10, 0,Math.PI*2, true);
	context.fill();
}

function tojiru() {
	document.getElementsByTagName("body")[0].removeChild(document.getElementsByTagName("body")[0].childNodes.item(15)); 
}

infoclick();