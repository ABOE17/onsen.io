var async = require('async');
var globby = require('globby');
var fs = require('fs');
var nodePath = require('path');

function glob(src) {
  return new Promise(function(resolve, reject) {
    globby(src, function(error, paths) {
      return error ? reject(error) : resolve(paths);
    });
  });
}

function getTemplatePath(path) {
  if (path.match(/element\/[-._a-zA-Z0-9]+?.json$/)) {
    return __dirname + '/../src/misc/element-reference.html';
  } else if (path.match(/object\/[-._a-zA-Z0-9]+?.json$/)) {
    return __dirname + '/../src/misc/object-reference.html';
  } else {
    throw new Error('Invalid path: ' + path);
  }
}

function getExtensionPath(path) {
  var name = nodePath.basename(path, '.json');

  if (path.match(/element\/[-._a-zA-Z0-9]+?.json$/)) {
  } else if (path.match(/object\/[-._a-zA-Z0-9]+?.json$/)) {
    return __dirname + '/../2/OnsenUI/build/docs/angular1-binding/' + name + '.json';
  } else {
    throw new Error('Invalid path: ' + path);
  }
}

function setupFile(metalsmith, docPath) {
  return new Promise(function(resolve, reject) {
    metalsmith.readFile(getTemplatePath(docPath), function(error, file) {
      if (error) {
        return reject(error);
      }

      var doc = JSON.parse(fs.readFileSync(docPath));

      file.doc = doc;
      file.title = doc.name;
      file.name = doc.name;
      file.is2 = true;
      file.componentCategory = doc.category;

      resolve({doc: doc, file: file});
    });
  });
}

module.exports = function(lang) {

  return function(files, metalsmith, done) {

    // 2/OnsenUI/build/docs/angular1-binding/element/*.json
    // 2/OnsenUI/build/docs/angular1-binding/object/*.json

    // 2/OnsenUI/build/docs/core/element/*.json
    // 2/OnsenUI/build/docs/core/object/*.json

    var baseDir = nodePath.resolve(__dirname + '/../2/OnsenUI/build/docs/core/');
    glob([
      nodePath.join(baseDir, 'element', '*.json'),
      nodePath.join(baseDir, 'object', '*.json')
    ]).then(function(paths) {

      return Promise.all(paths.map(function(path) {
        return setupFile(metalsmith, path).then(function(result) {
          files['2/reference/' + result.doc.name + '.html'] = result.file;
        });
      }))

    }).then(function() {
      done();
    }).catch(function(error) {
      done(error);
    });
  }
};
