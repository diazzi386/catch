var Cork = {};

Cork._VERSION = "0.3.0";
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
	}, title: function (game) {
		if (game._STORY && game._STORY.title)
		document.title = game._STORY.title + ' - Play IF on CORK!';
		Cork.IO.get('title').innerHTML = game._STORY.title;
	}, score: function () {
		Cork.IO.get('score').innerHTML = "MOVES 000 / SCORE 0000";
	}, achievement: function (no, message) {
		message = message ? message + ": " : "";
		Cork.IO.write(message + "+" + no + " POINTS!", Theme.achievement);
	}, error: function (message) {
		Cork.IO.write("CORK IO SERVICE: ERROR " + message + ", please contact <a>bugs@cork.world</a>", Theme.error);
		return false;
	}, warning: function (message) {
		Cork.IO.write("CORK IO SERVICE: Warning " + message + ", please contact <a>bugs@cork.world</a>", Theme.warning);
		return false;
	}, init: function (game) {
		Cork.Theme.load();
		Cork.IO.title(game);
		// Cork.IO.score();
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
