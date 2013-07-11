#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile, isExternal) {
    var file;
    if(!isExternal) {
	file = cheerio.load(fs.readFileSync(htmlfile));
	 console.log(file);
    }
    else {
	console.log('External running');
	rest.get(htmlfile.toString()).on('success', function(res) {
	    console.log(res + "test");
	    file = cheerio.load(res);
	     console.log(file);
	})
	.on('error', function(err) {
	    console.log('ERROR. Can not get file from', htmlfile,". Exiting...");
	    process.exit(1);
	});
    }
    return file;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, isExternal) {
    $ = cheerioHtmlFile(htmlfile, isExternal);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'Path to external url')
	.parse(process.argv);
    var fileToCheck = program.url || program.file;
    var isExternal = (program.url)? true: false;
    var checkJson = checkHtmlFile(fileToCheck, program.checks, isExternal); //make url a string
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
