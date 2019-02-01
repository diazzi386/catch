var Cork = {
	Theme: {
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
		}
	}, IO: {
		READY: false,
		scroll: function () {
			Cork.IO.get('output').scrollTop = Cork.IO.get('output').scrollHeight;
		}, clear: function () {
			Cork.IO.get('output').innerHTML = "";
		}, get: function (id) {
			return document.getElementById(id);
		}, last: function (name) {
			var a = document.getElementsByClassName(name);
			a = a[a.length - 1];
			if (a) return a;
			else return "";
		}, write: function (string, cname) {
			if (Array.isArray(string)) {
				for (var i in string)
					Cork.IO.write(string[i]);
				return;
			}
			if (string == undefined || string == "") string = " ";
			string = "<p" + (cname == undefined? "" : " class='" + cname + "'" ) + ">" + string + "</p>";
			Cork.IO.get('output').innerHTML += string;
			Cork.IO.scroll();
		}, title: function () {
			document.title = Memory.TITLE + ' - Play IF on CORK!';
			Cork.IO.get('title').innerHTML = Memory.TITLE;
		}, score: function () {
			var M = Memory.COMMANDS.length;
			var S = Memory.SCORE;
			Cork.IO.get('score').innerHTML = "MOVES ";

			if (M == 0)
				Cork.IO.get('score').innerHTML += "000";
			else if (M < 10)
				Cork.IO.get('score').innerHTML += "00" + M;
			else if (M < 100)
				Cork.IO.get('score').innerHTML += "0" + M;
			else if (M < 1000)
				Cork.IO.get('score').innerHTML += "" + M;

			Cork.IO.get('score').innerHTML += " / SCORE ";
			if (S == 0)
				Cork.IO.get('score').innerHTML += "000";
			else if (S < 10)
				Cork.IO.get('score').innerHTML += "00" + S;
			else if (S < 100)
				Cork.IO.get('score').innerHTML += "0" + S;
			else if (S < 1000)
				Cork.IO.get('score').innerHTML += "" + S;
		}, achievement: function (no, message) {
			message = message ? message + ": " : "";
			Cork.IO.write(message + "+" + no + " POINTS!", Theme.achievement);
		}, blink: function (mode) {
			if (Cork.IO.get('input'))
				Cork.IO.get('input').parentNode.removeChild(Cork.IO.get('input'));
			var BLINK = { OFF: 0, ON: 1, FIX: 2 };
			if (mode == BLINK.OFF)
				return;
			if (mode == BLINK.FIX)
				Cork.IO.get('output').innerHTML +=
					"<p id='input' class='" + Theme.input + "'><span id='command'>"
					+ "</span><span class='" + Theme.blink + "'>" + Theme.block + "</span></p>";
			else
				Cork.IO.get('output').innerHTML +=
					"<p id='input' class='" + Theme.input + "'><span id='command'>"
					+ "</span><span class='blinking " + Theme.blink + "'>" + Theme.block + "</span></p>";
			Cork.IO.score();
			Cork.IO.READY = true;
		}, error: function (no, opt) {
			var code;
			if (no == 210) // missing
				code = "missing definition of room";
			else if (no == 220)
				code = "missing definition of item";
			else if (no == 230)
				code = "missing definition of character";
			else if (no == 900)
				code = opt || "programming";
			else {
				no = no || 100;
				code = "generic";
			}

			Cork.IO.write("CORK IO SERVICE: ERROR "
				+ (no < 900 ? "no. " + no + ": " + code : "on " + opt) + ", please contact <a>bugs@cork.world</a>", Theme.error);
			return false;
		}, warning: function (no, opt) {
			var code;
			if (no == 200)
				code = "work in progress";
			else {
				no = no || 100;
				code = "generic";
			}

			Cork.IO.write("CORK IO SERVICE: Warning no. " + no + ": " + code + ", please contact <a>bugs@cork.world</a>", Theme.warning);
			return false;
		}, listen: function () {
			document.body.addEventListener('keydown', function (event) {
				event.preventDefault ? event.preventDefault() : (event.returnValue = false);
				var k = event.keyCode ? event.keyCode : event.which;
				
				if (!Cork.IO.READY)
					return;
								
				if (Rooms[ROOM].AUTO && Rooms[ROOM].actions && Rooms[ROOM].actions["*"]) {
					return Rooms[ROOM].actions["*"]();
				};			

				if (k == 8) { // delete
					var s = Cork.IO.get('command').innerHTML;
					Cork.IO.get('command').innerHTML = s.substring(0, s.length - 1);
					if (event.target == document.body)
						event.preventDefault();
					return false;
				} else if (k == 46) { // canc
					Cork.IO.get('command').innerHTML = "";
					return;
				} else if (k >= 65 && k <= 90) { // letters
					Cork.IO.get('command').innerHTML += String.fromCharCode(k);
					return;
				} else if (k >= 48 && k <= 57) { // numbers
					Cork.IO.get('command').innerHTML += String.fromCharCode(k);
					return;
				} else if (k >= 96 && k <= 105) { // numbers
					Cork.IO.get('command').innerHTML += String.fromCharCode(k - 48);
					return;
				} else if (k == 38) { // arrow up
					if (Memory.COMMANDS.length >= 1)
						return Cork.IO.get('command').innerHTML = Memory.COMMANDS[Memory.COMMANDS.length - 1].toUpperCase();
					else
						return;
				} else if (k == 40) { // arrow down
					return Cork.IO.get('command').innerHTML = "";
				} else if (k == 32) { // space
					Cork.IO.get('command').innerHTML += String.fromCharCode(k);
					return;
				} else if (k != 13) return;

				// ENTER
				var input = Cork.IO.get('command').innerHTML;
				input = input.replace(/\s\s+/g, ' ').toLowerCase();
				if (input == "") return;
				
				Cork.IO.parse(input);

				Cork.IO.score();
				Cork.IO.blink();
			}, false);
			
			window.addEventListener('resize', function () {
				Cork.IO.scroll();
			}, false);
		}, parse: function (input) {
			var verb = undefined, object = undefined, type = undefined;
			var a, b, reg, exec;

			Cork.IO.write(input, Theme.done);
			Memory.COMMANDS.push(input);

			// Check for synonyms

			for (var i in Synonyms) {
				var a = Synonyms[i].split("/");
				for (var j in a) {
					reg = new RegExp("\\b" + a[j] + "\\b", "g");
					
					if (reg.test(input)) {
						input = input.replace(reg, a[0]);
					}
				}
			}
			
			for (var i in Commands) {
				if (!input.includes(i))
					continue;
				for (var j in Commands[i]) {
					if (!input.includes(j))
						continue;
					exec = Commands[i][j];
				}
				if (Commands[i]["*"])
					exec = exec || Commands[i]["*"];
				else if (Commands[i])
					exec = exec || Commands[i];
			}

			for (var i in Rooms[ROOM].actions) {
				if (!input.includes(i))
					continue;
				for (var j in Rooms[ROOM].actions[i]) {
					if (!input.includes(j))
						continue;
					exec = Rooms[ROOM].actions[i][j];
				}
				if (Rooms[ROOM].actions[i]["*"])
					exec = exec || Rooms[ROOM].actions[i]["*"];
			}

			exec = exec || Commands["sorry"];

			// input = input.replace(verb, "");

			exec(input);
		}
	}, Game: {
		ROOM: null,
		progress: function (room) {
			//Cork.IO.READY = false;

			if (!room)
				for (var i in Rooms)
					if (Rooms[i].START)
						room = i;

			if (!Rooms[room])
				return Cork.IO.error(210);

			if (ROOM && Rooms[ROOM] && Rooms[ROOM].after)
				Rooms[ROOM].after();

			if (Rooms[room].before) {
				if (!Rooms[room].before())
					return Cork.IO.blink();
			}
			
			if (ROOM)
				Cork.IO.write();
			ROOM = room;
			Commands["look"]["around"]();

			if (Rooms[ROOM].first) {
				Rooms[ROOM].first();
				delete Rooms[ROOM].first;
			}			
			
			/*
			if (Rooms[ROOM].AUTO) {
				Cork.IO.blink(2);
			} else*/
				Cork.IO.blink();
			// Cork.IO.READY = true;
		}, score: function (no, message) {
			if (no == 0)
				Memory.SCORE = 0;
			else
				Memory.SCORE += no;
			if (no != 0)
 				Cork.IO.achievement(no, message);
		}, begin: function (data) {
			Cork.IO.blink();
			Cork.Game.progress();
			Cork.IO.listen();
			Cork.IO.READY = true;
		}
	}, init: function () {
		Cork.IO.title();
		Cork.Game.score(0);
		Cork.Theme.load();
		Cork.Game.begin();
	}
};

window.onload = function () {
	Cork.init();
}

window.onerror = function (msg, url, line, col, error) {
	opt = "line " + line + " in file " + url;
	Cork.IO.error(900, opt);
	Cork.IO.blink();
}

var RAND = {
	pick: function (arr) {
		var n = Math.random();
		var l = arr.length;
		n = Math.floor(l*n);
		return arr[n];
	}
};

var ROOM;
var _VERSION = "0.3.0";
var _DATE = "JAN, 2019";