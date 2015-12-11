#!/usr/bin/env node

'use strict';

var stdio = require('stdio');
var detective = require('detective');
var fs = require('fs');
var path = require('path');
var recursive = require('recursive-readdir');
var Q = require('q');
var _ = require('lodash');

var options = stdio.getopt({
    'directory': {key: 'd', default: '', description: 'Directory to run on, by default runs in current directory', args: 1},
    'list': {key: 'l', description: "Returns 1 module per line for automatic grep use"},
    'local': {key: 'o', description: "Ignore ignore local requires, e.g: requires(./something)"}
});
   
readDir(validatePath(), ['node_modules']).then(function(results){
    if(options.list){
       results.forEach(function(a){console.log(a);});
    } else {
       console.log(results);
    }
});

function readDir(path, ignoreList) {
    var deferred = Q.defer();
    recursive(path, ignoreList, function(err, files){
       	var filePromises = files.map(function(file) {return readFile(file);});
        Q.allSettled(filePromises).then(function (requires) {
           
            var results = _.uniq(_.flattenDeep(requires.filter(function(require){
                 return require.state == 'fulfilled'  
            }).map(function(a){
                return a.value;   
            })));
            deferred.resolve(results);
        });
    });
    return deferred.promise;
};

function readFile(file) {
    var deferred = Q.defer();
    fs.readFile(file, function (err, data) {
        if (err) throw err;
        var requires = detective(data);
        if(requires.length == 0) {
            deferred.reject();
        } else {
            if(options.local){
                 requires = _.remove(requires, function(module){
                    return module.charAt(0) !== '.';
                });
            }
            deferred.resolve(requires);            
        }
    });
	return deferred.promise;
};

function validatePath() {
    var searchPath = "";

    if(!path.isAbsolute(options.directory)) {
        searchPath = path.resolve(path.join(__dirname + '/' + options.directory));
    } else {
        searchPath = path.resolve(options.directory);
    }
    path.resolve( searchPath ) == path.normalize( searchPath );
    
    return searchPath;
}