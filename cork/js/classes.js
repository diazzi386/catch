function story(name) {
	Game._STORY = new Game.Story(name);
	if (!Game._REGISTRY[name]) {
		Game._REGISTRY[name] = {
			ROOMS: {},
			THINGS: {},
			ACTORS: {},
			EXITS: {},
			DOORS: {}
		};
	}
	return Game._STORY;
}

function room(name, description) {
	if (Game._REGISTRY[Game._STORY.title].ROOMS[name]) {
		return Game._REGISTRY[Game._STORY.title].ROOMS[name];
	} else {
		var new_room = new Game.Room(name, description);
		Game._REGISTRY[Game._STORY.title].ROOMS[name] = new_room;
		if (Game._STORY.first_room == null) {
			Game._STORY.first_room = new_room;
		}
		return new_room;
	}
}

function current(room) {
	if (room instanceof Game.Room) {
		Game._ROOM = room;
	}
	return Game._ROOM;
}

function thing(name, description) {
	if (Game._REGISTRY[Game._STORY.title].THINGS[name]) {
		return Game._REGISTRY[Game._STORY.title].THINGS[name];
	} else {
		var new_thing = new Game.Thing(name, description);
		Game._REGISTRY[Game._STORY.title].THINGS[name] = new_thing;
		if (Game._ROOM != null) new_thing.move(Game._ROOM);
		return new_thing;
	}
}

function actor(name, description) {
	if (Game._REGISTRY[Game._STORY.title].ACTORS[name]) {
		return Game._REGISTRY[Game._STORY.title].ACTORS[name];
	} else {
		var new_actor = new Game.Actor(name, description);
		Game._REGISTRY[Game._STORY.title].ACTORS[name] = new_actor;
		if (Game._ROOM != null) new_actor.move(Game._ROOM);
		return new_actor;
	}
}

function exit(name, description) {
	if (Game._REGISTRY[Game._STORY.title].EXITS[name]) {
		return Game._REGISTRY[Game._STORY.title].EXITS[name];
	} else {
		var new_exit = new Game.Exit(name, description);
		Game._REGISTRY[Game._STORY.title].EXITS[name] = new_exit;
		if (Game._ROOM != null) new_exit.move(Game._ROOM);
		return new_exit;
	}
}

function door(name, description) {
	if (Game._REGISTRY[Game._STORY.title].DOORS[name]) {
		return Game._REGISTRY[Game._STORY.title].DOORS[name];
	} else {
		var new_door = new Game.Door(name, description);
		Game._REGISTRY[Game._STORY.title].DOORS[name] = new_door;
		//if (Game._ROOM != null) new_door.move(Game._ROOM);
		return new_door;
	}
}

function say(message) {
	Game.say(message);
}