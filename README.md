# node_detective
A command-line utility tool to detect what modules are required in a NodeJS application.
Searches all files in a nodeJS project and returns all the modules that are programatically required.

##Pre-requisites

Obviously you'll need Node and npm installed and running.

##Installing and Setting Up

Install the project dependencies:
```
npm install -g node_detective
```

##Using It

Example:
```
detective app.js
```
Options:
```
$ detective --help
USAGE: detective [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -d, --directory <ARG1> 	Directory to run on, by default runs in current directory
  -l, --list             	Returns 1 module per line for automatic grep use
  -o, --local            	Ignore ignore local requires, e.g: requires('./controller')
```

### Credits: 
This utility would not be possible without the work of: [node-detective](https://github.com/substack/node-detective)
#### License: MIT
#### Author: [Pedro Silva](https://github.com/pedro93)
