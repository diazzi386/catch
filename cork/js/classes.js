function story(name) {
	Cork.GAME = new Cork.Story(name);
	if (!Cork._REGISTRY[name]) {
		Cork._REGISTRY[name] = {
			ROOMS: {},
			THINGS: {},
			ACTORS: {},
			EXITS: {},
			DOORS: {}
		};
	}
	return Cork.GAME;
}

function room(name, description) {
	if (Cork._REGISTRY[Cork.GAME.title].ROOMS[name]) {
		return Cork._REGISTRY[Cork.GAME.title].ROOMS[name];
	} else {
		var new_room = new Cork.Room(name, description);
		Cork._REGISTRY[Cork.GAME.title].ROOMS[name] = new_room;
		if (Cork.GAME.first_room == null) {
			Cork.GAME.first_room = new_room;
		}
		return new_room;
	}
}

function current(room) {
	if (room instanceof Cork.Room) {
		Cork._ROOM = room;
	}
	return Cork._ROOM;
}

function thing(name, description) {
	if (Cork._REGISTRY[Cork.GAME.title].THINGS[name]) {
		return Cork._REGISTRY[Cork.GAME.title].THINGS[name];
	} else {
		var new_thing = new Cork.Thing(name, description);
		Cork._REGISTRY[Cork.GAME.title].THINGS[name] = new_thing;
		if (Cork._ROOM != null) new_thing.move(Cork._ROOM);
		return new_thing;
	}
}

function actor(name, description) {
	if (Cork._REGISTRY[Cork.GAME.title].ACTORS[name]) {
		return Cork._REGISTRY[Cork.GAME.title].ACTORS[name];
	} else {
		var new_actor = new Cork.Actor(name, description);
		Cork._REGISTRY[Cork.GAME.title].ACTORS[name] = new_actor;
		if (Cork._ROOM != null) new_actor.move(Cork._ROOM);
		return new_actor;
	}
}

function exit(name, description) {
	if (Cork._REGISTRY[Cork.GAME.title].EXITS[name]) {
		return Cork._REGISTRY[Cork.GAME.title].EXITS[name];
	} else {
		var new_exit = new Cork.Exit(name, description);
		Cork._REGISTRY[Cork.GAME.title].EXITS[name] = new_exit;
		if (Cork._ROOM != null) new_exit.move(Cork._ROOM);
		return new_exit;
	}
}

function door(name, description) {
	if (Cork._REGISTRY[Cork.GAME.title].DOORS[name]) {
		return Cork._REGISTRY[Cork.GAME.title].DOORS[name];
	} else {
		var new_door = new Cork.Door(name, description);
		Cork._REGISTRY[Cork.GAME.title].DOORS[name] = new_door;
		//if (Cork._ROOM != null) new_door.move(Cork._ROOM);
		return new_door;
	}
}

function say(message) {
	Cork.say(message);
}