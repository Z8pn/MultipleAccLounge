// ==UserScript==
// @name                CS:GO Lounge Multiple Accounts
// @namespace           CS:GO Lounge Multiple Accounts
// @author              made by 14k (http://steamcommunity.com/id/xozyain/) edited by Z8pn(http://steamcommunity.com/id/z8pn-senpai)
// @include             /^http(s)?://(www.)?csgolounge.com//
// @include             /^http(s)?://(www.)?dota2lounge.com//
// @require             http://code.jquery.com/jquery-2.1.1.js
// @require             https://raw.githubusercontent.com/carhartl/jquery-cookie/master/src/jquery.cookie.js
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               GM_deleteValue
// ==/UserScript==

	var users = {};
	var profiles = {}
	/////
	function QuickRegEx(regex,data) {
		match = data.match(regex);
		if (match == null)
		{
			return -1;
		}
		return match[1];
	}
	function GetUserCurrent() {
		var user = {
			//PHPSESSID:	$.cookie('PHPSESSID'),
			id:			$.cookie('id'),
			//tkz:		$.cookie('tkz'),
			token:		$.cookie('token'),
			success:	true
		};
		if (typeof(user.id) == "undefined")
		{
			user.success = false;
		}
		return user;
	}
	function SaveUserCurrent(callback) {
		var user = GetUserCurrent();
		console.log("FIRST");
		if (user.success)
		{
			console.log("SECOND");
			delete user.success;
			GetUserList(function(){
				console.log("THIRD");
				users[user.id]	= user;
				GM_setValue("user_profiles",users);
				callback();
			});
		}
		else {
			callback();
		}
	}
	
	function GetUserList(callback) {
		if (GM_getValue("user_profiles","null") != "null") {
			users = GM_getValue("user_profiles");
			
		}
		callback();
	}
	function CheckProfiles(callback) {
		users_count = Object.keys(users).length;
		$.each(users,function(steam_id,user){
			if (typeof(profiles[user.id]) == "undefined")
			{
				GetProfile(user.id,function(profile){
					profiles[profile.id] = profile;
				});
			}
		});
		callback();
	}
	function GetProfileList(callback) {
		if (GM_getValue("profiles_profiles","null") != "null") {
			profiles = GM_getValue("profiles_profiles");
			
		}
		callback();
	}
	function SaveProfileList(callback) {
		GetProfileList(function(){
			CheckProfiles(function(){
				GM_setValue("profiles_profiles",profiles);
				callback();
			});
		});
	}
	function GetProfile(steam_id,callback) {
		profile = {};
		$.ajax({
			 url: 'http://csgolounge.com/profile?id='+steam_id,
			 success: function(page) {
				 profile.id		= steam_id;
				 profile.name	= QuickRegEx(/href=\"http\:\/\/steamcommunity\.com\/profiles\/\d+\/\"\sclass=\"user\">\s+<b>(.*?)<\/b>/i,page);
				 profile.pic	= QuickRegEx(/<img\ssrc=\"(.*?)\"\salt=\"Avatar\"\s\/>/i,page);
				 callback(profile);
			 },
			 async:   false
		});          
	}
	function SetUserCurrent(steam_id,callback) {
		if (typeof(users[steam_id]) != "undefined")
		{
			if (steam_id != $.cookie('id'))
			{
				$.each(users[steam_id],function(key,value){
					$.cookie(key,value,{ expires: 30, path: '/' });
				});
			}
			callback();
		}
	}
	function LogOutUser(callback) {
		$.get('/logout',function(){
			callback();
		});
	}
	function LogOutAndSetUser(steam_id,callback) {
		LogOutUser(function(){
			SetUserCurrent(steam_id,function(){
				callback();
			});
		});
	}
	function ShowUi(){
		//style
		$('head').append(
			'<style>'+
				'#switch_accounts_ui {position:absolute;top:-1000px;left:-1000px;}'+
				'#switch_accounts_ui {padding:5px 5px 2px 5px;  float: left;color: #CCC;border-radius: 5px;box-shadow: 0px 1px 2px #888;background:#252525;}'+
				'.sa_account {cursor: pointer;height:40px;color:#252525;border-radius:5px;margin:5px 0px 5px 0px;padding:2px;box-shadow: 0px 1px 2px #888;background:#D7D7D7}'+
				'.sa_account.logged {border:2px solid #ff8a00 !important;}'+
				'.sa_account.active {border:2px solid #FFF;}'+
				'.sa_account.notactive {border:2px solid #CCC;}'+
				'.sa_account .sa_avatar {float:left;}'+
				'.sa_account .sa_avatar img {height:40px;}'+
				'.sa_account .sa_meta {margin-left:50px;}'+
				'.sa_account .sa_meta .sa_name {height:20px;font-size:20px; padding-right:5px;}'+
				'.sa_account .sa_meta .sa_steamid {height:12px;font-size:12px; padding-right:5px;}'+
				'.sa_clear {font-size:12px;cursor: pointer}'+
			'</style>'
		);
		//menu item
		$('#menu').append('<li><a id="switch_account" href="#"><img src="http://csgolounge.com/img/profile.png" alt="Sign in as..."><span>Change User</span></a></li>');
		//switch account ui
		$('body').append('<div id=switch_accounts_ui></div>');
		$("#switch_account").parent().mouseenter(function() {
			$('#switch_accounts_ui').clearQueue();
			MenuPosition = $(this).position();
			$('#switch_accounts_ui').css('top',MenuPosition.top + $('#menu li:first').height());
			$('#switch_accounts_ui').css('left',MenuPosition.left);
		}).mouseleave(function(){
			$('#switch_accounts_ui').delay(150).queue(function(next){
				$('#switch_accounts_ui').css('top','-1000px');
				$('#switch_accounts_ui').css('left','-1000px');
				next();
			});
		});
		$('#switch_accounts_ui').mouseenter(function() {
			$('#switch_accounts_ui').clearQueue();
		}).mouseleave(function(){
			$('#switch_accounts_ui').delay(150).queue(function(next){
				$('#switch_accounts_ui').css('top','-1000px');
				$('#switch_accounts_ui').css('left','-1000px');
				next();
			});
		});
		//fill switch account ui
		var ClassActive = ' notactive';
		$.each(users,function(steam_id,user){
			if ($.cookie('id') == user.id) { ClassActive = ' logged'; }
			$('#switch_accounts_ui').append('<div class="sa_account'+ClassActive+'" steam_id='+user.id+'><div class=sa_avatar><img src='+profiles[user.id].pic+'></div><div class=sa_meta><div class=sa_name>'+profiles[user.id].name+'</div><div class=sa_steamid>'+user.id+'</div></div></div>');
			ClassActive = ' notactive';
		});
		$('.sa_account').click(function(){
			LogOutAndSetUser($(this).attr('steam_id'),function(){
				location.reload();
			});
		});
		$('.sa_account').mouseenter(function() {
			if ($(this).hasClass('notactive'))
			{
				$(this).removeClass('notactive').addClass('active')
			}
		}).mouseleave(function(){
			if ($(this).hasClass('active'))
			{
				$(this).removeClass('active').addClass('notactive')
			}
		});
		//clear data ui
		$('#switch_accounts_ui').append('<div class=sa_clear>Clear data...</div>');
		$('.sa_clear').click(function(){
			AreYouSure = 'Ara you sure about this?';
			if ($(this).text() != AreYouSure)
			{
				$(this).text(AreYouSure);
			}
			else {
					GM_deleteValue("profiles_profiles");
					GM_deleteValue("user_profiles");
					location.reload();
			}
		});
		//img fix
		$('.sa_account .sa_avatar img').error(function(){
			$(this).attr('src','http://media.steampowered.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg');
		});
		}
	SaveUserCurrent(function(){
		GetUserList(function(){
			SaveProfileList(function(){
				ShowUi();
			});
		});
	});
	
