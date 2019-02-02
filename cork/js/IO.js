Cork._VERSION = "0.3.5";
Cork._BUILD = "FEB, 2019";

Cork.IO = {
	READY: false,
	buffer: [],
	parser: null,
	scroll: function () {
		Cork.IO.get('output').scrollTop = Cork.IO.get('output').scrollHeight;
	}, clear: function () {
		Cork.IO.get('output').innerHTML = "";
	}, get: function (id) {
		return document.getElementById(id);
	}, write: function (string, cname) {
		if (string == undefined || string == "") string = ""; //
		string = "<p" + (cname == undefined? "" : " class='" + cname + "'" ) + ">" + string + "</p>";
		Cork.IO.get('output').innerHTML += string;
		Cork.IO.scroll();
	}, title: function () {
		if (Cork.GAME && Cork.GAME.title)
		document.title = Cork.IO.get('title').innerHTML = Cork.GAME.title + " - " + Cork.GAME.tagline + " by " + Cork.GAME.author;
	}, score: function () {
		Cork.IO.get('score').innerHTML = Cork._VERSION;
	}, achievement: function (no, message) {
		/*
		message = message ? message + ": " : "";
		Cork.IO.write(message + "+" + no + " POINTS!", Theme.achievement);
		*/
	}, error: function (message) {
		Cork.IO.write("CORK IO SERVICE: ERROR " + message + ", please contact <a>bugs@cork.world</a>", Theme.error);
		return false;
	}, warning: function (message) {
		Cork.IO.write("CORK IO SERVICE: Warning " + message + ", please contact <a>bugs@cork.world</a>", Theme.warning);
		return false;
	}, init: function () {
		Cork.Theme.load();
		Cork.IO.title();
		Cork.IO.score();
	}
};

Cork.Theme = {
	load: function () {
		if (!window.Theme)
			Theme = {};
		Theme.body = Theme.body || '';
		Theme.title = Theme.title || "";
		Theme.output = Theme.output || "";
		Theme.input = Theme.input || "";
		Theme.done = Theme.done || "uc";
		Theme.blink = Theme.blink || "";
		Theme.block = Theme.block || "_";
		Theme.error = Theme.error || "";
		Theme.warning = Theme.warning || "";
		Theme.score = Theme.score || "";
		Theme.achievement = Theme.achievement || "";
		Cork.Theme.apply();
	}, apply: function () {
		document.body.className = Theme.body;
		Cork.IO.get('output').className = Theme.output;
		Cork.IO.get('title').className = Theme.title;
		Cork.IO.get('score').className = Theme.score;
		Cork.IO.get('command').className = Theme.input;
	}
};
