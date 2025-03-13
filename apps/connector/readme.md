1. Build the Connector
2. In the ./dist-connector/package.json change
	- "name": "autochrome-connector"
    - "version": "0.0.?"
    - "bin": {"autochrome-connector": "./main.js"}
3. In the ./dist-connector/main.js add the "#!/usr/bin/env node" at the top.
4. publish with the "npm publish" command
