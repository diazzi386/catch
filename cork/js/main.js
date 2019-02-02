window.onload = function () {
	Cork.game.start();
	Cork.game.advance();
	Cork.IO.init();
	Cork.IO.parser = new Cork.parser();

	for (var i = 0; i < Cork.IO.buffer.length; i++)
		Cork.IO.write(Cork.IO.buffer[i]);

	Cork.IO.get('input').onsubmit = function() {
		var command = Cork.IO.get('command').value;
		if (command.length == 0)
			return false;
		Cork.IO.buffer.length = 0;
		Cork.IO.write("> " + command, Theme.done);
		Cork.IO.get('command').value = "";
		Cork.IO.parser.parse(command.toLowerCase().trim());
		Cork.game.advance();

		for (var i = 0; i < Cork.IO.buffer.length; i++)
			Cork.IO.write(Cork.IO.buffer[i]);
		return false;
	}
}

window.onerror = function (msg, url, line, col, error) {
	Cork.IO.error("line " + line + " in file " + url);
}