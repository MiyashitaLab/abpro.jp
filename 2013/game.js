enchant();

window.onload = function(){
	var game = new Game(700, 400);
	game.fps = 28
	//素材の読み込み
	game.preload('chara2.png');
	game.preload('apple.png');
	game.preload('toge.png');
	game.preload('rogo2.png');
	game.preload('rogo3.png');
	game.preload('rogoX.png');
	game.preload('toge.png');
	game.preload('tobi2.png');
	game.preload('to.png');

	game.preload('death.wav');
	game.preload('j1.mp3');
	game.preload('j2.mp3');
	game.preload('up.wav');

	//その他パラメータ
	var default_x = 50;
	var default_y = -300;
	var ground = 350;
	var shift_count = 0;
	var start_flag = 0;
	var click_counter = 0;
	var clear_count = 0;
	var apple_flag = 0;
	var eye_flag = 0;
	var toge2_flag = 0;
	var apple2_flag = 0;
	var to_flag = 0;
	var q = 3;

	game.onload = function(){
		//効果音death
		var sound_death = game.assets['death.wav'].clone();
		var sound_j1 = game.assets['j1.mp3'].clone();
		var sound_j2 = game.assets['j2.mp3'].clone();
		var sound_up = game.assets['up.wav'].clone();

		var scene = game.rootScene;

		//ロゴを表示
		var abpro_sprite = new Sprite(700, 310);
		abpro_sprite.image = game.assets['rogo2.png'];
		scene.addChild(abpro_sprite); 

		//クマを配置
		var kuma = new Sprite(32,32); 
		kuma.image = game.assets['chara2.png'];
		kuma.ys = 0;//加速度
		kuma.jump_flag = 0;
		kuma.jump_chat_z = 0;//Zでジャンプ

		//クマアニメーション用の設定
		kuma.frameIndex = 0;
		var frameList = [0,1,2];
		function kuma_anim(){
			if(game.frame %2 == 0){
				kuma.frameIndex ++;
				kuma.frameIndex %= frameList.length;
				kuma.frame = frameList[kuma.frameIndex];
			}
		}
		function kuma_stand_anim(){
			if(game.frame %2 == 0){
				kuma.frame = 4-kuma.frame;
			}
		}

		//リンゴを配置
		var apple = new Sprite(22,24); 
		apple.image = game.assets['apple.png'];
		//リンゴのアニメーション
		function apple_anim(){
			if(game.frame %2 == 0){
				apple.frame = 1 - apple.frame;
			}
		}
		//目を配置
		var eye = new Sprite(73,48); 
		eye.image = game.assets['rogoX.png'];
		//とげを配置
		var toge = new Sprite(32,32); 
		toge.image = game.assets['toge.png'];

		var toge1 = new Sprite(32,32); 
		toge1.image = game.assets['toge.png'];
		var toge2 = new Sprite(32,32); 
		toge2.image = game.assets['toge.png'];
		var toge3 = new Sprite(32,32); 
		toge3.image = game.assets['toge.png'];

		var tobi = new Sprite(328,127); 
		tobi.image = game.assets['tobi2.png'];

		var to = new Sprite(32,32); 
		to.image = game.assets['to.png'];

		//キーイベントリスナー
		document.onkeydown = function down(){
			//クマを上に動かす Z
			if(event.keyCode == 90 && start_flag == 1){
				if((kuma.jump_flag < 2) && (kuma.jump_chat_z == 0)){
					kuma.jump_flag++;
					kuma.jump_chat_z = 1;

					kuma.ys = -21 + kuma.jump_flag * 2;
				}
			}
			if(kuma.jump_flag == 0){
				sound_j1.play();
			}else{
				sound_j2.play();
			}
		}
		document.onkeyup = function up(){
			//Zを離すのを検知
			if(event.keyCode == 90 && start_flag == 1){
				kuma.jump_chat_z = 0;
			}
			//ジャンプ中以外で，左右が離されたら，フレームを０に戻す
			if((event.keyCode == 37) || (event.keyCode == 39)){
				kuma.frame = 0;
			}
		}

		//クリックでもジャンプ可能
		game.rootScene.addEventListener("touchstart", function(e) {
			//クマを上に動かす Z
			if((kuma.jump_flag < 2) && (kuma.jump_chat_z == 0)  && (start_flag == 1)){
				kuma.jump_flag++;
				kuma.jump_chat_z = 1;
				kuma.ys = -21 + kuma.jump_flag * 2;
				if(kuma.jump_flag == 0){
					sound_j1.play();
				}else{
					sound_j2.play();
				}
			}
		});
		game.rootScene.addEventListener("touchend", function(e) {
			if(start_flag == 1){
				kuma.jump_chat_z = 0;
			}else{
				click_counter++;
				if(click_counter > 4){
					start_flag = 1;
					var abpro_sprite = new Sprite(700, 310)
					abpro_sprite.image = game.assets['rogo3.png'];
					scene.addChild(abpro_sprite); 
					game.rootScene.addChild(eye);
					game.rootScene.addChild(apple);
					game.rootScene.addChild(toge);
					game.rootScene.addChild(toge1);
					game.rootScene.addChild(toge2);
					game.rootScene.addChild(toge3);
					game.rootScene.addChild(tobi);
					game.rootScene.addChild(to);
					game.rootScene.addChild(kuma);

					var label_goal = new Label("GOAL→");
					label_goal.x = 600;
					label_goal.y = 300;
					scene.addChild(label_goal);
					clear();
				}
			}
		});

		kuma.onenterframe = function(){
			//ジャンプ中の処理
			if(clear_flag == 0){
				if(kuma.jump_flag >= 1){
					this.y += this.ys;
					this.ys += 3;
					if(this.y > ground){
						this.jump_flag = 0;
						this.y = ground;
					}
				}
				//クマを右に動かす
				if(game.input.right) {
					this.scaleX = 1;
					this.x += 5;
					if(kuma.jump_flag == 0){
						kuma_anim();
					}
				}
				//クマを左に動かす
				else if(game.input.left) {
					this.scaleX = -1;
					this.x -= 5;
					if(kuma.jump_flag == 0){
						kuma_anim();
					}
				}else{
					kuma_stand_anim();
				}
			}else{
				kuma.frame = 3;
				clear_count++;
				if(clear_count > 30){
					clear();
					clear_flag = 0;
					clear_count = 0;
				}
			}
		}//kuma.onenterframe

		//リンゴのフレーム毎の処理
		apple.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.within(kuma, 16)){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
			}
			apple_anim()


			if( (kuma.x > 180) && (kuma.y < 300) && (apple_flag == 0)){
				apple_flag = 1;
				sound_up.play();
			}
			if(apple_flag == 1){
				apple.y -= 18;
			}
		}//apple.onenterframe

		eye.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.intersect(kuma)){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
				
			}
			if( (kuma.x > 420) == (eye_flag == 0) ){
				eye_flag = 1;
				sound_up.play();
			}
			if(eye_flag == 1){
				eye.y += 20;
			}
		}

		toge.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.within(kuma, 16) && clear_flag == 0){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
			}
		}
		toge1.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.within(kuma, 16) && clear_flag == 0){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
			}
		}
		toge2.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.within(kuma, 16) && clear_flag == 0){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
			}
			q = 0 - q;
			this.x = this.x + q;
			if( (kuma.x < 415) && (eye_flag == 1) && (toge2_flag == 0)){
				toge2_flag = 1;
				sound_up.play();
			}
			if(toge2_flag == 1){
				toge2.y -= 20;
			}

		}
		toge3.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.within(kuma, 16) && clear_flag == 0){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
			}
		}

		tobi.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.intersect(kuma) && clear_flag == 0){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
				clear_count = -90;

				var label_fin = new Label("ｆｉｎ．");
				label_fin.x = kuma.x + 30;
				label_fin.y = kuma.y + 10;
				scene.addChild(label_fin);
			}
			if( (kuma.x > 550) && (tobi_flag == 0) ){
				tobi_flag = 1;
				sound_up.play();
			}
			if( (tobi_flag == 1) && (tobi.x > 50) ){
				tobi.x -= 20;
			}
		}

		to.onenterframe = function(){
			//クマとの衝突判定をする
			if(this.intersect(kuma) && clear_flag == 0){
        			sound_death.play();
				//位置を初期化
				clear_flag = 1;
				clear_count = -30;
			}
			if( (kuma.x > 130) && (to_flag == 0) ){
				to_flag = 1;
				sound_up.play();
				//DOMを使ってみる
				var sampleNode=document.getElementById("target");
				sampleNode.innerHTML="　ABPro■は！";
			}
			if(to_flag == 1){
				to.y -= 20;
			}
		}

		//オブジェクトの初期化（死んだらここ）
		function clear(){
			kuma.x = 50;
			kuma.y = 350;
			apple.x = 200;
			apple.y = 300;
			toge.x = 195;
			toge.y = 350;

			toge1.x = 350;
			toge1.y = 350;
			toge2.x = 382;
			toge2.y = 350;
			toge3.x = 414;
			toge3.y = 350;

			tobi.x = 701;
			tobi.y = 250;

			to.x = 132;
			to.y = 400;

			eye.x = 443;
			eye.y = 44;
			
			apple_flag = 0;
			toge2_flag = 0;
			eye_flag = 0;
			to_flag = 0;
			tobi_flag = 0;
			clear_flag = 0;
			var sampleNode=document.getElementById("target");
			sampleNode.innerHTML="　ABProとは！";
		}

		//ゲームフレーム毎の処理
		game.onenterframe = function(){
		}//game.onenterframe

		//--------------------------------------------------------------------------------------
	}//game.onload

	game.start();
}//window.onload