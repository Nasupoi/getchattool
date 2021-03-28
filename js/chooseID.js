var ApiKey ="";
const GET_CHAT_ID_URL = "https://www.googleapis.com/youtube/v3/videos?";
const GET_CHAT_INFO_URL = "https://www.googleapis.com/youtube/v3/liveChat/messages?";

const REPLACE_URL_STRING = "https://www.youtube.com/watch?v=";
const CHECK_URLSTRING = "^https:\\/\\/www\\.youtube\\.com\\/watch\\?v=";


const CHECK_STRING1 = "^([0-9a-zA-Z]{3})-([0-9a-zA-Z]{3})-([0-9a-zA-Z]{3})$";
const CHECK_STRING2 = "^([0-9a-zA-Z]{3}) ([0-9a-zA-Z]{3}) ([0-9a-zA-Z]{3})$";
const CHECK_STRING3 = "^([0-9a-zA-Z]{3})ｰ([0-9a-zA-Z]{3})ｰ([0-9a-zA-Z]{3})$";
const CHANGE_STRING1 = "^[0-9]+:([0-9a-zA-Z]{3})-([0-9a-zA-Z]{3})-([0-9a-zA-Z]{3})$";
const CHANGE_STRING2 = "^[0-9]+:([0-9a-zA-Z]{3}) ([0-9a-zA-Z]{3}) ([0-9a-zA-Z]{3})$";
const CHANGE_STRING3 = "^[0-9]+:([0-9a-zA-Z]{3})ｰ([0-9a-zA-Z]{3})ｰ([0-9a-zA-Z]{3})$";


const INPUT_APIKEY_EEROR = "API keyは必須項目です。API keyを入力してください。";
const INPUT_VIDEOURL_EEROR ="Live URLは必須項目です。Live URLを入力してください。"
const INPUT_COMMENT_TERM_ERROR = "Get comments intervalは5以上の数値を入力してください。";

const NOTVALID_APIKEY_EEROR = "API keyが不正です。入力したAPI keyに誤りがないか確認してください。";
const NOTGET_VIDEOINFO_EEROR = "入力されたLive URLからビデオ情報が取得できませんでした。入力したURLに誤りがないか確認してください。";
const NOTLIVE_VIDEO_EEROR = "入力されたLive URLは現在ライブ配信されていません。入力したURLに誤りがないか確認してください。";

const NOTVALID_VIDEOURL_EEROR ="Live URLが不正です。入力したURLに誤りがないか確認してください。"
const SO_SHORT_GET_TERM_EEROR = "取得間隔が短すぎます。取得間隔をより長く設定してください。"
const MAX_EEROR = "YouTubeからの情報取得可能回数の上限に達しました。情報取得可能回数の上限は太平洋時間（PT）の午前 0 時にリセットされます。"

const NO_ROW_IN_TABLE = "<div>抽選対象の情報がありません。</div>";

const SYSTEM_EEROR = "システムエラーが発生しました。"


const APIERROR_ApiKey = "API key not valid. Please pass a valid API key.";
const APIERROR_FAST = "The request was sent too soon after the previous one. This error occurs when API requests to retrieve messages are being sent more frequently than YouTube's refresh rates, which unnecessarily wastes bandwidth and quota.";
const APIERROR_MAX = "The request cannot be completed because you have exceeded your <a href=\"/youtube/v3/getting-started#quota\">quota</a>."

const PLAY_TIME = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60]; //プレイ時間

var pageToken = 0;
var roopFlg = false;

document.getElementById("button_area").innerHTML = "<button type=\"button\" id=\"get_button\" onclick=\"clickGetButton()\"><img src=\"./img/Start.png\"></button>";

//チャット情報の取得および取得したコース情報の表示
function getChat() {
	console.log("===start_getChat===");	
	var videoId = "";
	//入力されたVideoIdの取得
	var inputVideoURL = document.getElementById("videoId").value;
	var regex = new RegExp(CHECK_URLSTRING);
	
	//入力されたURLのチェック
	if (inputVideoURL) {
		if (regex.test(inputVideoURL)) {
			videoId = inputVideoURL.replace(REPLACE_URL_STRING, "");
		} else {
			clickStopButton(true);
			document.getElementById("error").innerHTML = NOTVALID_VIDEOURL_EEROR;
			document.getElementById("videoId_error_img").style.display = "inline";
			return;
		}
	} else {
		clickStopButton(true);
		document.getElementById("error").innerHTML = INPUT_VIDEOURL_EEROR;
		document.getElementById("videoId_error_img").style.display = "inline";
		return;
	}
	
	console.log("videoID:" + videoId);
	
	//入力された取得間隔のチェック
	var timer = document.getElementById("get_term").value;
	if (timer === "") {
		timer = 5000;
		document.getElementById("get_term").value = 5;
	} else if (timer >= 5) {
		timer = Number(timer) * 1000;
	} else {
		clickStopButton(true);
		document.getElementById("error").innerHTML = INPUT_COMMENT_TERM_ERROR;
		document.getElementById("get_term_error_img").style.display = "inline";
		return;
	}
	
	//videoIdからチャットIDを取得し、チャット情報を取得する
	getChatData(videoId);
	
	//繰り返し取得
	var intervalId = setInterval(function () {
			if (roopFlg) {
				//videoIdからチャットIDを取得し、チャット情報を取得する
				var chatData = getChatData(videoId);
			} else {
				clearInterval(intervalId);
			}
		}, timer);
	console.log("===end_getChat===");
}

//videoIdからチャットIDを取得し、チャット情報を返却する：完了
function getChatData(videoId) {
	var getChatId = new XMLHttpRequest();
	var chatId;
	var reqestURL = GET_CHAT_ID_URL + "key=" + ApiKey + "&id=" + videoId + "&part=liveStreamingDetails";
	console.log("getChatIdRequestURL:" + reqestURL);
	
	getChatId.open("GET", reqestURL, true);
	getChatId.responseType = "json";
	
	getChatId.onload = function () {
		var data = getChatId.response;
		console.log(data);
		if (data["error"]) {
			switch (data["error"]["message"]) {
				case APIERROR_ApiKey :
					clickStopButton(true);
					document.getElementById("error").innerHTML = NOTVALID_APIKEY_EEROR;
					document.getElementById("api_key_error_img").style.display = "inline";
					return;
				case APIERROR_MAX :
					clickStopButton(true);
					document.getElementById("error").innerHTML = MAX_EEROR;
					return;
				default :
					clickStopButton(true);
					document.getElementById("error").innerHTML = SYSTEM_EEROR;
					return;					
			}
		}
		
		if (!(data["items"].length === 0)) {
			var liveStreamingDetails = data["items"][0]["liveStreamingDetails"];
			
			if (liveStreamingDetails["activeLiveChatId"]) {
				chatId = liveStreamingDetails["activeLiveChatId"];//チャットIDの取得
				console.log("chatId:" + chatId);
				
				getChatInfo(chatId);//チャット情報の取得
			} else {
				clickStopButton(true);
				document.getElementById("error").innerHTML = NOTLIVE_VIDEO_EEROR;
				document.getElementById("videoId_error_img").style.display = "inline";
				console.log("配信できていません");
			}
		} else {
			clickStopButton(true);
			document.getElementById("error").innerHTML = NOTGET_VIDEOINFO_EEROR;
			document.getElementById("videoId_error_img").style.display = "inline";
			console.log("chatIdの取得失敗");
		}
	}
	getChatId.send();
}

//チャットIdからチャット情報を取得：完了
function getChatInfo(chatId) {
	var getChatInfo = new XMLHttpRequest();
	var chatInfo = [];
	var reqestURL = GET_CHAT_INFO_URL + "key=" + ApiKey + "&liveChatId=" + chatId + "&part=id,snippet,authorDetails";
	
	if (!(pageToken === 0)) {
		reqestURL = reqestURL + "&pageToken=" + pageToken;
	}
	console.log("getChatInfoRequestURL:" + reqestURL);
	
	getChatInfo.open("GET", reqestURL, true);
	getChatInfo.responseType = "json";
	
	getChatInfo.onload = function () {
		var data = getChatInfo.response;
		var chatArray = data["items"];
		console.log(data);
		
		if (data["error"]) {
			switch (data["error"]["message"]) {
				case APIERROR_FAST :
					clickStopButton(true);
					document.getElementById("error").innerHTML = SO_SHORT_GET_TERM_EEROR;
					document.getElementById("get_term_error_img").style.display = "inline";
					return;
				case APIERROR_MAX :
					clickStopButton(true);
					document.getElementById("error").innerHTML = MAX_EEROR;
					return;
				default :
					clickStopButton(true);
					document.getElementById("error").innerHTML = SYSTEM_EEROR;
					return;					
			}
		}
	
		for (var i = 0; i < chatArray.length; i++) {
			var chatData = [];
			if (checkCourseID(chatArray[i]["snippet"]["displayMessage"])) {
				chatData.push(chatArray[i]["authorDetails"]["displayName"]);
				chatData.push(chatArray[i]["snippet"]["displayMessage"]);
				chatData.push("add");
				chatData.push(chatArray[i]["authorDetails"]["channelId"]);
				chatData.push(chatArray[i]["authorDetails"]["profileImageUrl"]);
				chatInfo.push(chatData);
			}else if (changeCourseIDcheck(chatArray[i]["snippet"]["displayMessage"])) {
				chatData.push(chatArray[i]["authorDetails"]["displayName"]);
				chatData.push(chatArray[i]["snippet"]["displayMessage"]);
				chatData.push("change");
				chatData.push(chatArray[i]["authorDetails"]["channelId"]);
				chatInfo.push(chatData);
			}
		}	
		//取得したチャット情報の表示処理
		if (chatInfo.length > 0) viewCourseID(chatInfo);
		pageToken = data["nextPageToken"];		
	}
	
	getChatInfo.send();
}

//チャットのコースIDフォーマットチェック:完了
function checkCourseID(Id) {
	var regex1 = new RegExp(CHECK_STRING1);
	var regex2 = new RegExp(CHECK_STRING2);
	var regex3 = new RegExp(CHECK_STRING3);
	if (regex1.test(Id) || regex2.test(Id) || regex3.test(Id)){
//	if (true || regex2.test(Id) || regex3.test(Id)){
		return true;
	} else {
		return false;
	}
}

//チャットのコースIDの変更フォーマットチェック:完了
function changeCourseIDcheck(Id) {
	var regex1 = new RegExp(CHANGE_STRING1);
	var regex2 = new RegExp(CHANGE_STRING2);
	var regex3 = new RegExp(CHANGE_STRING3);
	if (regex1.test(Id) || regex2.test(Id) || regex3.test(Id)){
		return true;
	} else {
		return false;
	}
}

//コース情報の表示処理：完了
function viewCourseID(chatData) {
	console.log("===start_viewCourseID===");
	//テーブル取得
	var courseTable = document.getElementById("courseId_table");
	//同じ方のコメント最大件数取得
    const maxCommentNum = Math.floor(document.getElementById("max_comment_num").value);
	//チャット情報分の繰り返し
	
	chatData.forEach(function(elem, index){
		var commentedNum = 0;
		for (var i = 1; i < courseTable.rows.length;i++) {
			if (elem[3] === courseTable.rows[i].cells[4].childNodes[0].defaultValue) commentedNum++;
			if (elem[2] === "change" && elem[3] === courseTable.rows[i].cells[4].childNodes[0].defaultValue) {
				var changeNum = elem[1].split(":");
				if (changeNum[0] == i) {
					courseTable.rows[i].cells[2].innerHTML = changeNum[1];
				}
			}
		}
		if (commentedNum < maxCommentNum || maxCommentNum ===0) {
			if (elem[2] === "add") {
				// 行を行末に追加
				var row = courseTable.insertRow(-1);
			
				// セルの挿入
				var num = row.insertCell(-1);
				var userName = row.insertCell(-1);
				var courseId = row.insertCell(-1);
				var checkBox = row.insertCell(-1);
				var channelId = row.insertCell(-1);

				// セルの内容入力
				num.innerHTML = courseTable.rows.length - 1;
				userName.innerHTML = "<img class=\"user_icon\" src=\"" + elem[4] + "\">  " + elem[0] + "</img>";
				courseId.innerHTML = elem[1];
				checkBox.innerHTML = "<input type=\"checkbox\">";
				channelId.innerHTML = "<input type=\"hidden\" value=\"" + elem[3] + "\">";
			}
		}
	});
	console.log("===end_viewCourseID===");
}

//コース抽選:完了
function chooseCourseInfo() {
	console.log("===start_chooseCourseID===");
	//テーブル取得
	var courseTable = document.getElementById("courseId_table");
	
	if (courseTable.rows.length <= 1) {//テーブルにレコードが存在しない場合
		return;
	} else {//テーブルにレコードが存在する場合
		var recordInfo = [];
		//チェックボックスにチェックがついていないレコード情報の取得
		for (var i = 0; i < courseTable.rows.length;i++) {
			var recordElem = [];
			if (!(i === 0)) {//1行目はヘッダ行のため、無視
				if (!(courseTable.rows[i].cells[3].childNodes[0].checked)) {
					recordElem.push(courseTable.rows[i].cells[1].innerHTML, courseTable.rows[i].cells[2].innerHTML);
					recordInfo.push(recordElem);
				}
			}
		}
		
		var random = Math.floor(Math.random() * (recordInfo.length));//乱数生成
		var resultElem = recordInfo[random];
		var courseInfo = [resultElem[0], resultElem[1]];
	}
	console.log("===end_chooseCourseID===");
	return courseInfo;
}

//プレイ時間抽選：完了
function choosePlayTime() {
	console.log("===start_choosePlayTime===");
	if (document.getElementById("play_time_flg").checked) {
		var random = Math.floor(Math.random() * (PLAY_TIME.length));//乱数生成
		console.log("===end_choosePlayTime===");
		return PLAY_TIME[random] + "分";
	} else {
		return "自由";
	}
}

//抽選結果表示：完了
function viewResult() {
	console.log("===start_viewResult===");
	//抽選結果取得
	var resultCourseInfo = chooseCourseInfo();//コース抽選結果
	var viewElement = document.getElementById("view_result");//抽選結果表示領域の取得
	
	if (resultCourseInfo) {//コース抽選結果が取得できた場合
		//抽選結果情報の取得
		var resultCourseUserName = resultCourseInfo[0];//コース投稿者名
		var resultCourseId = resultCourseInfo[1];//コースID
		var resultPlayTime = choosePlayTime();//プレイ時間結果
		
		//画面表示
		viewElement.innerHTML = "<div id=\"user_info\">" + resultCourseUserName + "様</div><div id=\"chat_info\">" + resultCourseId + "</div><div id=\"play_time\">プレイ時間：" + resultPlayTime + "</div>";
	} else {
		//レコードがないよを表示
		viewElement.innerHTML = NO_ROW_IN_TABLE;
	}
	
	console.log("【抽選結果】UserName:" + resultCourseUserName + ", CourseID:" + resultCourseId + ", PlayTime:" + resultPlayTime);
	console.log("===end_viewResult===");
}

//チェックが追加レコードを非表示にする
function clearCourseID(row = true) {
	//テーブル取得
	var courseTable = document.getElementById("courseId_table");
	var rowNum = courseTable.rows.length;
	for (var i = rowNum; i > 1; i-- ) {
		
		if (courseTable.rows[i-1].cells[3].childNodes[0].checked && row) {
			courseTable.rows[i-1].style.display ="none";
		} else if (!row) {
			courseTable.deleteRow(i - 1);
		}
	}
	if (!row) pageToken = 0;
}

//開始ボタン押下
function clickGetButton() {
	document.getElementById("error").innerHTML = "";
	var errorIconElements = document.getElementsByClassName("error_icon");
	for (var i = 0; i < errorIconElements.length; i++) {
		errorIconElements[i].style.display = "none";
	}
	
	ApiKey = document.getElementById("api_key").value;
	if (ApiKey) {
		if (!roopFlg) {
			document.getElementById("button_area").innerHTML = "<button type=\"button\" id=\"stop_button\" onclick=\"clickStopButton()\"><img src=\"./img/Stop.png\"></button>";
			disableSettingsParam(true);
			roopFlg = true;
			getChat();
		}
	} else {
		clickStopButton(true);
		document.getElementById("error").innerHTML = INPUT_APIKEY_EEROR;
		document.getElementById("api_key_error_img").style.display = "inline";
		return;
	}
}

function disableSettingsParam(disable) {
	document.getElementById("api_key").disabled = disable;
	document.getElementById("videoId").disabled = disable;
	document.getElementById("max_comment_num").disabled = disable;
	document.getElementById("get_term").disabled = disable;
	document.getElementById("clear_table").disabled = disable;
}

//終了ボタン押下
function clickStopButton(error=false) {
	document.getElementById("button_area").innerHTML = "<button type=\"button\" id=\"get_button\" onclick=\"clickGetButton()\"><img src=\"./img/Start.png\"></button>";
	disableSettingsParam(false);
	if (!error) clicked();
	roopFlg = false;
}

function btnDisable(){

  document.getElementById("get_button").disabled = true;

  clearInterval(statusDis);

}
function btnAble(){

  document.getElementById("get_button").disabled = false;

  clearInterval(statusAble);

}

function clicked(){

  statusDis  = setInterval(btnDisable , 1);

  statusAble = setInterval(btnAble , 5000);

}