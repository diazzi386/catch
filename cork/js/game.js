Game = {
	_STORY: null,
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
				Game.say(Game.handle_value(target[before]));
				return true;
			}
		}
		
		if (typeof (target[action]) == "function") {
			target[action](actor);
		} else {
			Game.say(Game.handle_value(target[action]));
		}

		var after = "after" + action;
		if (target[after]) {
			if (typeof (target[after]) == "function") {
				target[after](actor);
			} else {
				Game.say(Game.handle_value(target[after]));
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
				return Game.random_pick(value);
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

Game.Story = function (title) {
	this.title = title || "Untitled";
	this.author = "Anonymous";
	this.date = new Date(2010, 3, 10);
	this.tagline = "A text adventure";
	this.blurb = "";
	this.about = "See also: help, credits.";
	this.credits = "Based on the Jiffo library by David A. Wheeler, which was based on the Jaiffa library by Felix Pleșoianu.";
	this.player = new Game.Actor("yourself");
	this.player.altname("myself", "me");
	this.version = null;
	this.first_room = null;
};

Game.Story.prototype = {
	start: function () {
		this.player.move(this.first_room);
		this.turns = 0;
		this.ended = false;
		Game.say(this.blurb + "\n\n");
		Game.say(this.title + "\n"
			+ this.tagline + " by " + this.author + "\n"
			+ "(first time players please type 'help')\n\n"
			+ this.date.toString().split(" ").slice(0, 4).join(" "));
		Game.handle_action(this, "$look", this.player);
	}, advance: function () {
		if (this.ended) return;
		
		var actors = Game._REGISTRY[this.title].ACTORS;
		for (var i in actors) actors[i].act();

		var objects = this.player.scope();
		for (var i = 0; i < objects.length; i++) {
			if (objects[i] && objects[i].heremsg)
				Game.say(Game.handle_value(
					objects[i].heremsg));
		}
		
		this.turns++;
	}, the_end: function (message) {
		this.ended = true;
		Game.say("*** " + message + " ***");
	},
	// Intransitive verbs.
	$look: function (actor) {
		Game.handle_action(actor.location, "$examine", actor);
	}, $cork: function (actor) {
		Game.say("At your service!");
	}, $inventory: function (actor) {
		Game.say("You are carrying: " + Game.list(actor.children) + ".");
	}, $wait: function (actor) {
		Game.say("You wait. Time passes.");
	}, $help: function (actor) {
		Game.say("Direct the game with one- to three-word commands.");
		Game.say("For example: 'look', 'pick up key', 'examine it',"
			+ " 'inventory', 'go north'. Some of these have"
			+ " abbreviations: 'l', 't key', 'x', 'i', 'n'.");
		Game.say("But do try any other command that makes sense."
			+ " E.g. many objects have an 'use' verb.");
		Game.say("See also: about, credits.");
	}, $about: function (actor) {
		Game.say(this.about);
	}, $credits: function (actor) {
		Game.say(this.credits);
	}, $version: function (actor) {
		Game.say(this.version);
	}
};

Game.Story.prototype.$l = Game.Story.prototype.$look;
Game.Story.prototype.$i = Game.Story.prototype.$inventory;
Game.Story.prototype.$inv = Game.Story.prototype.$inventory;
Game.Story.prototype.$v = Game.Story.prototype.$version;

Game.ObjectMixin = function() {
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
			Game.say(this.describe()
				|| "You see nothing special.");
		} else {
			Game.say("It's too dark to see much.");
		}
	};

	this.$x = this.$l = this.$look = this.$look_at =
		function (actor) {
			Game.handle_action(this, "$examine", actor);
		};
	
	this.$search = "You find nothing worth mentioning.";
	this.$look_in = function (actor) {
		Game.handle_action(this, "$search", actor);
	};
};

Game.ContainerMixin = function () {
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

Game.ThingMixin = function() {
	this.move = function (container) {
		if (this.location) this.location.removeChild(this);
		if (container) container.addChild(this);
		this.location = container;
		return this;
	};
	
	this.$take = function (actor) {
		if (this.location == actor) {
			Game.say("You already have that.");
		} else if (this.location != actor.location) {
			Game.say("I don't see that here.");
		} else if (this.portable) {
			this.move(actor);
			Game.say("Taken.");
		} else {
			Game.say("You can't.");
		}
	};

	this.$get = this.$grab = this.$pick_up = this.$t =
		function (actor) {
			Game.handle_action(this, "$take", actor);
		};
	
	this.$drop = function (actor) {
		for (var i = 0; i < actor.children.length; i++) {
			if (actor.children[i] == this) {
				this.move(actor.location);
				Game.say("Dropped.");
				return;
			}
		}
		Game.say("You don't have that.");
	}
	this.$throw = function (actor) {
		Game.handle_action(this, "$drop", actor);
	}
}

Game.Room = function (name, description) {
	this.name = name;
	this.description = description;
	this.parse_name(this.name);
	this.exits = [];
};

Game.ObjectMixin.apply(Game.Room.prototype);
Game.ContainerMixin.apply(Game.Room.prototype);

Game.Room.prototype.$examine = function (actor) {
	if (!actor.location.dark) {
		Game.say("\n" + actor.location.name + "\n"
			+ actor.location.describe());
		Game.say("You see: "
			+ Game.list(actor.location.children) + ".");
		Game.say("Obvious exits: "
			+ Game.list(actor.location.exits) + ".");
	} else {
		Game.say("It's dark, you can't see much at all.");
	}
};

Game.Exit = function (name, description) {
	this.name = name;
	this.description = description || "You see nothing special.";
	this.parse_name(this.name);
	this.move = function (room) {
		room.exits.push(this);
		return this;
	};
};

Game.Exit.prototype = {
	to: function (room) {
		this.target = room;
		return this;
	}, via: function (door) {
		this.door = door;
		return this;
	}, $go: function (actor) {
		if (this.door && this.door.locked) {
			if (actor.has(this.door.key)) {
				Game.say("(first unlocking the door)");
				this.door.locked = false;
			} else {
				Game.say("It's locked"
					+ " and you don't have the key.");
				return;
			}
		}
		if (this.door && this.door.travelmsg) {
			Game.say(this.door.travelmsg);
		} else if (this.travelmsg) {
			Game.say(this.travelmsg);
		}
		actor.move(this.target);
		Game.handle_action(actor.location, "$examine", actor);
	}, $lock: function (actor) {
		if (this.door) {
			if (actor.has(this.door.key)) {
				if (this.locked) {
					Game.say("Already locked.");
				} else {
					Game.say("You lock the door.");
					this.door.locked = true;
				}
			} else {
				Game.say("You don't have the key.");
			}
		} else {
			Game.say("There's nothing to lock");
		}
	}, $unlock: function (actor) {
		if (this.door) {
			if (actor.has(this.door.key)) {
				if (!this.locked) {
					Game.say("Already unlocked.");
				} else {
					Game.say("You unlock the door.");
					this.door.locked = false;
				}
			} else {
				Game.say("You don't have the key.");
			}
		} else {
			Game.say("There's nothing to unlock");
		}
	}, $open: function(actor) {
		Game.say("No need.");
	}, $close: function(actor) {
		Game.say("No need.");
	}
};
Game.ObjectMixin.apply(Game.Exit.prototype);
Game.ThingMixin.apply(Game.Exit.prototype);

Game.Door = function (name, description) {
	this.name = name;
	this.description = description || "You see nothing special.";
};
Game.ObjectMixin.apply(Game.Door.prototype);
Game.ThingMixin.apply(Game.Door.prototype);

Game.Actor = function (name, description) {
	this.name = name;
	this.parse_name(this.name);
	this.description = description || "You see nothing special.";
	this.portable = true;
};

Game.Actor.prototype = {
	act: function () { },
	scope: function () {
		return [].concat(
			this.location,
			this.location.children,
			this.location.exits,
			this.children);
	}, $talk_to: function (actor) {
		Game.say(this.name + " doesn't seem interested in talking.");
	}
};

Game.ObjectMixin.apply(Game.Actor.prototype);
Game.ThingMixin.apply(Game.Actor.prototype);
Game.ContainerMixin.apply(Game.Actor.prototype);

Game.Thing = function (name, description) {
	this.name = name;
	this.description = description || "You see nothing special.";
	this.parse_name(this.name);
};

Game.ObjectMixin.apply(Game.Thing.prototype);
Game.ThingMixin.apply(Game.Thing.prototype);

Game.parser = function (story) {
	this.story = story;
	this.it = undefined;
};

Game.parser.prototype = {
	parse: function (command) {
		// Game.say(this.story.turns + "> " + command);
		if (this.story.ended) {
			Game.say("Sorry, the story has ended.");
			return;
		}
		var words = command.split(" ");
		var player = this.story.player;
		if (words.length == 0) {
			Game.say("I beg your pardon?");
		} else if (words.length == 1 || words.length > 3) {
			var verb = words.join("_");
			var action = "$" + verb;
			if (Game.handle_action(this.story, action, player))
				return;
			else if (!this.handle_exit(verb, player))
				Game.say("I don't know how.");
		} else if (words.length == 3) {
			var verb = words.join("_");
			var action = "$" + verb;
			if (Game.handle_action(this.story, action, player)) {
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
			if (Game.handle_action(this.story, action, player)) {
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
			return Game.find_in_scope(objects, nouns[0]);
		}
	}, handle_exit: function (word, actor) {
		var exits = actor.location.exits;
		var exit = Game.find_in_scope(exits, word);
		if (exit != null) {
			Game.handle_action(exit, "$go", actor);
			return true;
		} else {
			return false;
		}
	}, handle_sentence: function (target, verb, actor) {
		var action = "$" + verb;
		if (target === undefined) {
			Game.say("I don't know what you mean by"
				+ " 'it' right now.");
		} else if (target === null) {
			Game.say("I don't see that here.");
		} else if (target[action] == null) {
			Game.say("I don't know how to "
				+ verb + " the " + target + ".");
			this.it = target;
		} else {
			Game.handle_action(target, action, actor);
			this.it = target;
		}
	}
};