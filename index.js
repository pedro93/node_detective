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
    'local': {key: 'o', description: "Ignore ignore local requires, e.g: requires(./something)"},
    'version': {key: 'v', description: "Returns version number"}
});

run();

function run(){
    checkOptions();
    var path = validatePath();
    if(isDirectory(path)){
        readDir(path, ['node_modules']).then(function(results){
            if(options.list){
               results.forEach(function(a){console.log(a);});
           } else {
               console.log(results);
           }
       });
    } else {
        readFile(path).then(function(result){
            if(options.list){
               results.forEach(function(a){console.log(a);});
           } else {
               console.log(result);
           }
       });
    }
}


function readDir(path, ignoreList) {
    var deferred = Q.defer();
    recursive(path, ignoreList, function(err, files){
        var filePromises = files.map(function(file) {return readFile(file);});
        Q.allSettled(filePromises).then(function (result) {

            var results = _.uniq(_.flattenDeep(result.filter(function(require){
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
    if(isJavascriptFile(file)){
        fs.readFile(file, function (err, data) {
            if (err) throw err;
            var result = detective(data);
            if(result.length == 0) {
                deferred.reject();
            } else {
                if(options.local){
                   result = _.remove(result, function(module){
                    return module.charAt(0) !== '.';
                });
               }
               deferred.resolve(result);            
           }
       });    
    } else{
        deferred.reject();
    }
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

function isDirectory(path_string) {
    return fs.lstatSync(path_string).isDirectory();
}

function isJavascriptFile(file_path){
    return path.extname(file_path) === '.js';
}

function checkOptions(){
    if(options.version){
        try {
            var j = JSON.parse(fs.readFileSync(path.join(__dirname, './package.json')) + '');
            console.log(j.version);
        } catch (ex) {
            log.info('error reading version', ex);
        }
        process.exit();
    }
}