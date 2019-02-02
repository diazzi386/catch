window.onload = function () {
	Game._STORY.start();
	Game._STORY.advance();
	Cork.IO.init(Game);
	Cork.IO.parser = new Game.parser(Game._STORY);

	for (var i = 0; i < Cork.IO.buffer.length; i++)
		Cork.IO.write(Cork.IO.buffer[i]);

	Cork.IO.get('input').onsubmit = function() {
		var command = Cork.IO.get('command').value;
		if (command.length == 0)
			return false;
		Cork.IO.buffer.length = 0;
		Cork.IO.write("> " + command, Theme.done);
		Cork.IO.get('command').value = "";
		Cork.IO.parser.parse(command.toLowerCase());
		Game._STORY.advance();

		for (var i = 0; i < Cork.IO.buffer.length; i++)
			Cork.IO.write(Cork.IO.buffer[i]);
		return false;
	}
}

window.onerror = function (msg, url, line, col, error) {
	Cork.IO.error("line " + line + " in file " + url);
}