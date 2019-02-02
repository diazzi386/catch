Cork = {
	GAME: null,
	_ROOM: null,
	_REGISTRY: {},
	// output_buffer: [],
	say: function (message) {
		Cork.IO.buffer.push(message);
	}, list: function (objects) {
		if (objects && objects.length > 0)
			return objects.join(", ");
		else
			return "nothing of note";
	}, find_in_scope: function (objects, word) {
		for (var i = 0; i < objects.length; i++) {
			if (!objects[i]) continue;
			var names = objects[i].names;
			for (var j = 0; j < names.length; j++) {
				if (word == names[j]) {
					return objects[i];
				}
			}
		}
		return null;
	}, handle_action: function(target, action, actor) {
		if (!target[action]) return false;

		var objects = actor.scope();
		for (var i = 0; i < objects.length; i++) {
			if (objects[i] && objects[i].react_before) {
				objects[i].react_before(actor, action, target);
			}
		}

		var before = "before" + action;
		if (target[before]) {
			if (typeof (target[before]) == "function") {
				if (target[before](actor)) return true;
			} else {
				Cork.say(Cork.handle_value(target[before]));
				return true;
			}
		}
		
		if (typeof (target[action]) == "function") {
			target[action](actor);
		} else {
			Cork.say(Cork.handle_value(target[action]));
		}

		var after = "after" + action;
		if (target[after]) {
			if (typeof (target[after]) == "function") {
				target[after](actor);
			} else {
				Cork.say(Cork.handle_value(target[after]));
			}
		}

		var objects = actor.scope();
		for (var i = 0; i < objects.length; i++) {
			if (objects[i] && objects[i].react_after) {
				objects[i].react_after(actor, action, target);
			}
		}

		return true;
	}, handle_value: function(value) {
		if (typeof (value) == "function") {
			return value();
		} else if (typeof (value) == "object") {
			if (value.constructor == Array) {
				return Cork.random_pick(value);
			} else {
				return value.toString();
			}
		} else {
			return value;
		}
	}, random_pick: function(list) {
		var pick = Math.floor(Math.random() * list.length);
		return list[pick];
	}
};

Cork.Story = function (title) {
	this.title = title || "Untitled";
	this.author = "Anonymous";
	this.date = new Date(2010, 3, 10);
	this.tagline = "A text adventure";
	this.blurb = "";
	this.about = "See also: help, credits.";
	this.credits = "A GAME by Felix Pleșoianu";
	this.player = new Cork.Actor("yourself");
	this.player.altname("myself", "me");
	this.version = null;
	this.first_room = null;
	this.license = 
		"The MIT License (MIT)\n" +
		"Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
		"of this software and associated documentation files (the \"Software\"), to deal\n" +
		"in the Software without restriction, including without limitation the rights\n" +
		"to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
		"copies of the Software, and to permit persons to whom the Software is\n" +
		"furnished to do so, subject to the following conditions:\n\n" +
		"The above copyright notice and this permission notice shall be included in all\n" +
		"copies or substantial portions of the Software.\n\n" +
		"THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n" +
		"IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
		"FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
		"AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
		"LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
		"OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
		"SOFTWARE.\n\n";
};

Cork.Story.prototype = {
	start: function () {
		this.player.move(this.first_room);
		this.turns = 0;
		this.commands = [];
		this.ended = false;
		Cork.say(this.blurb + "\n\n");
		Cork.say(this.title + "\n"
			+ this.tagline + " by " + this.author + "\n"
			+ "(first time players please type 'help')\n\n"
			+ this.date.toString().split(" ").slice(0, 4).join(" "));
		Cork.handle_action(this, "$look", this.player);
	}, advance: function () {
		if (this.ended) return;
		
		var actors = Cork._REGISTRY[this.title].ACTORS;
		for (var i in actors) actors[i].act();

		var objects = this.player.scope();
		for (var i = 0; i < objects.length; i++) {
			if (objects[i] && objects[i].heremsg)
				Cork.say(Cork.handle_value(
					objects[i].heremsg));
		}
		
		this.turns++;
	}, the_end: function (message) {
		this.ended = true;
		Cork.say("*** " + message + " ***");
	},
	// Intransitive verbs.
	$look: function (actor) {
		Cork.handle_action(actor.location, "$examine", actor);
	}, $cork: function (actor) {
		Cork.say("At your service!");
	}, $inventory: function (actor) {
		Cork.say("You are carrying: " + Cork.list(actor.children) + ".");
	}, $wait: function (actor) {
		Cork.say("You wait. Time passes.");
	}, $help: function (actor) {
		Cork.say(
			"Direct the GAME with one- to three-word commands.\n"
			+ "For example: 'look', 'pick up key', 'examine it',"
			+ " 'inventory', 'go north'.\n"
			+ "Some of these have abbreviations, like"
			+ " 'l', 't key', 'x', 'i', 'n'.\n"
			+ "Feel free to try any other command that makes sense,"
			+ " e.g. many objects have an 'use' verb.\n"
			+ "See also: 'about', 'credits', 'license'.");
	}, $about: function (actor) {
		Cork.say(this.about);
	}, $credits: function (actor) {
		Cork.say(
			this.title + "\n" +
			this.tagline + " by " + this.author + "\n" +
			this.credits
		);
	}, $version: function (actor) {
		Cork.say(this.version);
	}, $score: function (actor) {
		Cork.say("Commands entered: " + this.turns + ".");
	}, $save: function (actor) {
		this.commands.pop();
		localStorage["save"] = this.commands;
		Cork.say("Saved.");
	}, $load: function () {
		if (!localStorage || !localStorage["save"])
			return Cork.say("No saved files found.");
		todo = localStorage["save"].split(",");
		for (var i = 0; i < todo.length; i++) {
			if (todo[i].toLowerCase().includes("load"))
				continue;
			Cork.IO.parser.parse(todo[i].toLowerCase())
		}
		localStorage["save"] = [];
	}, $license: function () {
		Cork.say(this.license);
	}
};

Cork.Story.prototype.$l = Cork.Story.prototype.$look;
Cork.Story.prototype.$i = Cork.Story.prototype.$inventory;
Cork.Story.prototype.$inv = Cork.Story.prototype.$inventory;
Cork.Story.prototype.$v = Cork.Story.prototype.$version;

Cork.ObjectMixin = function() {
	this.toString = function () {
		return this.name;
	};
	
	// Divide object name into words for the benefit of the parser.
	this.parse_name = function (name) {
		var split_name = name.toLowerCase().split(/\s+/);
		// TODO: implement stop words.
		this.altname.apply(this, split_name);
	};
	
	// Give the object some synonyms for the benefit of the parser.
	this.altname = function () {
		if (!this.names) this.names = [];
		for (var i = 0; i < arguments.length; i++) {
			this.names.push(arguments[i]);
		}
		return this;
	};
	
	this.desc = function (description) {
		this.description = description;
		return this;
	};

	this.is = function () {
		for (var i = 0; i < arguments.length; i++) {
			this[arguments[i]] = true;
		}
		return this;
	};

	this.isnt = function () {
		for (var i = 0; i < arguments.length; i++) {
			this[arguments[i]] = false;
		}
		return this;
	};

	this.has = function (what, howmuch) {
		this[what] = howmuch;
		return this;
	};

	this.describe = function () {
		return this.description || "";
	};

	this.$examine = function (actor) {
		if (!actor.location.dark) {
			Cork.say(this.describe()
				|| "You see nothing special.");
		} else {
			Cork.say("It's too dark to see much.");
		}
	};

	this.$x = this.$l = this.$look = this.$look_at =
		function (actor) {
			Cork.handle_action(this, "$examine", actor);
		};
	
	this.$search = "You find nothing worth mentioning.";
	this.$look_in = function (actor) {
		Cork.handle_action(this, "$search", actor);
	};
};

Cork.ContainerMixin = function () {
	this.addChild = function (object) {
		if (!this.children) this.children = [];
		for (var i = 0; i < this.children.length; i++)
			if (this.children[i] == object)
				return;
		this.children.push(object);
	};
	
	this.removeChild = function (object) {
		if (!this.children) return;
		for (var i = 0; i < this.children.length; i++) {
			if (this.children[i] == object) {
				this.children.splice(i, 1);
				return;
			}
		}
	};
	
	this.has = function (object) {
		if (!this.children) return false;
		for (var i = 0; i < this.children.length; i++) {
			if (this.children[i] == object) {
				return true;
			}
		}
		return false;
	};
};

Cork.ThingMixin = function() {
	this.move = function (container) {
		if (this.location) this.location.removeChild(this);
		if (container) container.addChild(this);
		this.location = container;
		return this;
	};
	
	this.$take = function (actor) {
		if (this.location == actor) {
			Cork.say("You already have that.");
		} else if (this.location != actor.location) {
			Cork.say("I don't see that here.");
		} else if (this.portable) {
			this.move(actor);
			Cork.say("Taken.");
		} else {
			Cork.say("You can't.");
		}
	};

	this.$get = this.$grab = this.$pick_up = this.$t =
		function (actor) {
			Cork.handle_action(this, "$take", actor);
		};
	
	this.$drop = function (actor) {
		for (var i = 0; i < actor.children.length; i++) {
			if (actor.children[i] == this) {
				this.move(actor.location);
				Cork.say("Dropped.");
				return;
			}
		}
		Cork.say("You don't have that.");
	}
	this.$throw = function (actor) {
		Cork.handle_action(this, "$drop", actor);
	}
}

Cork.Room = function (name, description) {
	this.name = name;
	this.description = description;
	this.parse_name(this.name);
	this.exits = [];
};

Cork.ObjectMixin.apply(Cork.Room.prototype);
Cork.ContainerMixin.apply(Cork.Room.prototype);

Cork.Room.prototype.$examine = function (actor) {
	if (!actor.location.dark) {
		Cork.say("\n" + actor.location.name + "\n"
			+ actor.location.describe());
		Cork.say("You see: "
			+ Cork.list(actor.location.children) + ".");
		Cork.say("Obvious exits: "
			+ Cork.list(actor.location.exits) + ".");
	} else {
		Cork.say("It's dark, you can't see much at all.");
	}
};

Cork.Exit = function (name, description) {
	this.name = name;
	this.description = description || "You see nothing special.";
	this.parse_name(this.name);
	this.move = function (room) {
		room.exits.push(this);
		return this;
	};
};

Cork.Exit.prototype = {
	to: function (room) {
		this.target = room;
		return this;
	}, via: function (door) {
		this.door = door;
		return this;
	}, $go: function (actor) {
		if (this.door && this.door.locked) {
			if (actor.has(this.door.key)) {
				Cork.say("(first unlocking the door)");
				this.door.locked = false;
			} else {
				Cork.say("It's locked"
					+ " and you don't have the key.");
				return;
			}
		}
		if (this.door && this.door.travelmsg) {
			Cork.say(this.door.travelmsg);
		} else if (this.travelmsg) {
			Cork.say(this.travelmsg);
		}
		actor.move(this.target);
		Cork.handle_action(actor.location, "$examine", actor);
	}, $lock: function (actor) {
		if (this.door) {
			if (actor.has(this.door.key)) {
				if (this.locked) {
					Cork.say("Already locked.");
				} else {
					Cork.say("You lock the door.");
					this.door.locked = true;
				}
			} else {
				Cork.say("You don't have the key.");
			}
		} else {
			Cork.say("There's nothing to lock");
		}
	}, $unlock: function (actor) {
		if (this.door) {
			if (actor.has(this.door.key)) {
				if (!this.locked) {
					Cork.say("Already unlocked.");
				} else {
					Cork.say("You unlock the door.");
					this.door.locked = false;
				}
			} else {
				Cork.say("You don't have the key.");
			}
		} else {
			Cork.say("There's nothing to unlock");
		}
	}, $open: function(actor) {
		Cork.say("No need.");
	}, $close: function(actor) {
		Cork.say("No need.");
	}
};
Cork.ObjectMixin.apply(Cork.Exit.prototype);
Cork.ThingMixin.apply(Cork.Exit.prototype);

Cork.Door = function (name, description) {
	this.name = name;
	this.description = description || "You see nothing special.";
};
Cork.ObjectMixin.apply(Cork.Door.prototype);
Cork.ThingMixin.apply(Cork.Door.prototype);

Cork.Actor = function (name, description) {
	this.name = name;
	this.parse_name(this.name);
	this.description = description || "You see nothing special.";
	this.portable = true;
};

Cork.Actor.prototype = {
	act: function () { },
	scope: function () {
		return [].concat(
			this.location,
			this.location.children,
			this.location.exits,
			this.children);
	}, $talk_to: function (actor) {
		Cork.say(this.name + " doesn't seem interested in talking.");
	}
};

Cork.ObjectMixin.apply(Cork.Actor.prototype);
Cork.ThingMixin.apply(Cork.Actor.prototype);
Cork.ContainerMixin.apply(Cork.Actor.prototype);

Cork.Thing = function (name, description) {
	this.name = name;
	this.description = description || "You see nothing special.";
	this.parse_name(this.name);
};

Cork.ObjectMixin.apply(Cork.Thing.prototype);
Cork.ThingMixin.apply(Cork.Thing.prototype);

Cork.parser = function (story) {
	story = story || Cork.GAME;
	this.story = story;
	this.it = undefined;
};

Cork.parser.prototype = {
	parse: function (command) {
		// Cork.say(this.story.turns + "> " + command);
		Cork.GAME.commands.push(command);
		if (this.story.ended) {
			Cork.say("Sorry, the story has ended.");
			return;
		}
		var words = command.split(" ");
		var player = this.story.player;
		if (words.length == 0) {
			Cork.say("I beg your pardon?");
		} else if (words.length == 1 || words.length > 3) {
			var verb = words.join("_");
			var action = "$" + verb;
			if (Cork.handle_action(this.story, action, player))
				return;
			else if (!this.handle_exit(verb, player))
				Cork.say("I don't know how.");
		} else if (words.length == 3) {
			var verb = words.join("_");
			var action = "$" + verb;
			if (Cork.handle_action(this.story, action, player)) {
				return;
			} else {
				var verb = words[0] + "_" + words[1];
				var action = "$" + verb;
				var target = this.pick_target(words.slice(2));
				this.handle_sentence(target, verb, player);
			}
		} else if (words.length == 2) {
			var verb = words.join("_");
			var action = "$" + verb;
			if (Cork.handle_action(this.story, action, player)) {
				return;
			} else {
				verb = words[0];
				var target = this.pick_target(words.slice(1));
				this.handle_sentence(target, verb, player);
			}
		} else {
			var verb = words[0] + "_" + words[1];
			var target = this.pick_target(words[2]);
			this.handle_sentence(target, verb, player);
		}
	}, pick_target: function (nouns) {
		if (nouns[0] == "it") {
			return this.it;
		} else {
			var objects = this.story.player.scope();
			return Cork.find_in_scope(objects, nouns[0]);
		}
	}, handle_exit: function (word, actor) {
		var exits = actor.location.exits;
		var exit = Cork.find_in_scope(exits, word);
		if (exit != null) {
			Cork.handle_action(exit, "$go", actor);
			return true;
		} else {
			return false;
		}
	}, handle_sentence: function (target, verb, actor) {
		var action = "$" + verb;
		if (target === undefined) {
			Cork.say("I don't know what you mean by"
				+ " 'it' right now.");
		} else if (target === null) {
			Cork.say("I don't see that here.");
		} else if (target[action] == null) {
			Cork.say("I don't know how to "
				+ verb + " the " + target + ".");
			this.it = target;
		} else {
			Cork.handle_action(target, action, actor);
			this.it = target;
		}
	}
};