
// 設定
var PATH = "http://abpro.jp/img/countdown";
var INTERVAL = 7;
var numberImage = new Array();

// 各種関数
function showDate() {
	// カウントダウン計算
	var d1 = new Date();
	var d2 = new Date(2011, 7, 17, 0, 0, 0, 0);
	var mill = parseInt(d2.getTime()) - parseInt(d1.getTime());
	var t = parseInt(d2.getTime()) - parseInt(d1.getTime());
    if (mill < 0) mill = 0;
    if (t < 0) t = 0;
	//var millisecond = t % 60000;
	t = Math.floor(t / 1000);
	var second = t % 60;
	t = Math.floor(t / 60);
	var minute = t % 60;
	t = Math.floor(t / 60);
	var hour = t % 24;
	t = Math.floor(t / 24);
	var date = t;

	// 不親切なカウントダウン
	$("#numbers").text(mill);

	// 親切なカウントダウン
	$("#countdownDetail").text("※だいたい" + date + "日" + hour + "時間" + minute + "分" + second + "秒です。");

	// Twitterのカウントダウン
	//$("#socialBtns > a").attr("data-text", "ABPro2011申し込み開始まであと" + mill + "ミリ秒です。 #abpro2011");
}

// 実行
$(document).ready(function () {
	//preload();
	setInterval("showDate()", INTERVAL);
});




//-------popup------//

$(function(){
	/* デフォルト */
	$('#dialog').jqm();
});