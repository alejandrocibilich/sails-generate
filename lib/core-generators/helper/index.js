/**
 * Module dependencies
 */

var path = require('path');
var _ = require('lodash');
var inventDescription = require('../../invent-description');


/**
 * sails-generate-helper
 *
 * Usage:
 * `sails generate helper <name>`
 *
 * @type {Dictionary}
 */

module.exports = {


  //  ╔╗ ╔═╗╔═╗╔═╗╦═╗╔═╗
  //  ╠╩╗║╣ ╠╣ ║ ║╠╦╝║╣
  //  ╚═╝╚═╝╚  ╚═╝╩╚═╚═╝ooo
  before: function (scope, done){


    var roughName;

    // Accept --name
    if (scope.name) {
      roughName = scope.name;
    }
    // Or otherwise the first serial arg is the "roughName" of the helper we want to create.
    else if (_.isArray(scope.args)) {

      // If more than one serial args were provided, they'll constitute the helper friendly name
      // and we'll combine them to form the base name.
      if (scope.args.length >= 2) {
        // However, note that we first check to be sure no dots or slashes were used
        // (if so, this would throw things off)
        if (scope.args[0].match(/[\/\.]/)) {
          return done(new Error(
            'Too many serial arguments: A "." or "/" was specified in the name for this new helper, but extra words were provided too.\n' +
            '(should be provided like either `db.lookups.get-search-results` or `Get search results`).'
          ));
        }
        scope.friendlyName = scope.args.join(' ');
        roughName = _.camelCase(scope.friendlyName);
      }
      // Otherwise, we'll infer an appropriate friendly name further on down. and just use the
      // first serial arg as our "roughName".
      else if (scope.args[0] && _.isString(scope.args[0])) {
        roughName = scope.args[0];
      }

    }//>-

    if (!roughName) {
      return done(new Error(
        'Missing argument: Please provide a name for the new helper.\n' +
        '(should be "verby" and use the imperative mood; e.g. `view-profile` or `sign-up`).'
      ));
    }

    // Now get our helperName.
    // Be kind -- transform slashes to dots when creating the helperName.
    scope.helperName = roughName.replace(/\/+/g, '.');
    // Then split on dots and make sure each segment is using camel-case before recombining.
    scope.helperName = _.map(scope.helperName.split('.'), function (segment){
      return _.camelCase(segment);
    }).join('.');

    // After transformation, the helperName must contain only letters, numbers, and dots--
    // and start with a lowercased letter.
    if (!scope.helperName.match(/^[a-z][a-zA-Z0-9.]*$/)) {
      return done( new Error('The name `' + scope.helperName + '` is invalid. '+
                           'Helper names must start with a lower-cased letter and contain only '+
                           'letters, numbers, and dots.'));
    }

    // Then get our `relPath` (filename / path).
    // When building the relPath, we convert any dots to slashes.
    scope.relPath = scope.helperName.replace(/\.+/g, '/');
    // Then split on slashes and make sure each segment is using kebab-case before recombining.
    scope.relPath = _.map(scope.relPath.split('/'), function (segment){
      // One exception: Don't kebab-case stuff like "v1".
      if (segment.match(/[a-z]+[0-9]+/)) { return segment; }
      return _.kebabCase(segment);
    }).join('/');
    // (And of course, finally, we tack on `.js` at the end-- we're not barbarians after all.)
    scope.relPath += '.js';

    // Grab the filename for potential use in our template.
    scope.filename = path.basename(scope.relPath);

    // Identify the helper "stem" for use below.
    // (e.g. "get-stuff-and-things" from "db.lookups.get-stuff-and-things")
    var helperStem = _.last(scope.helperName.split('.'));

    // Attempt to invent a description, if there isn't one already.
    if (_.isUndefined(scope.description)) {
      scope.description = inventDescription(scope.helperName);
    }//>-

    _.defaults(scope, {
      friendlyName: scope.friendlyName || _.map(_.words(helperStem), function (word, i){ if (i===0) { return _.capitalize(word); } else { return word[0].toLowerCase() + word.slice(1); } }).join(' '),
      description: scope.description || '',
      inferredSuccessOutputFriendlyName: '',
      verbose: false
    });

    // If helperStem begins with "get", then make an assumption about what to generate.
    // (set up the success exit with an inferred `outputFriendlyName`)
    if (helperStem.match(/^get/i)) {
      var inferredNounPhraseWords = _.map(_.words(helperStem).slice(1), function (word, i){ if (i===0) { return _.capitalize(word); } else { return word[0].toLowerCase() + word.slice(1); } });
      scope.inferredSuccessOutputFriendlyName = inferredNounPhraseWords.join(' ');
    }//>-

    // console.log('output friendly name:',scope.inferredSuccessOutputFriendlyName);
    // console.log('friendly name:',scope.friendlyName);

    return done();

  },


  //  ╔═╗╔═╗╔╦╗╔═╗╦═╗
  //  ╠═╣╠╣  ║ ║╣ ╠╦╝
  //  ╩ ╩╚   ╩ ╚═╝╩╚═ooo
  after: function (scope, done) {
    return done();
  },


  //  ╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╔═╗
  //   ║ ╠═╣╠╦╝║ ╦║╣  ║ ╚═╗
  //   ╩ ╩ ╩╩╚═╚═╝╚═╝ ╩ ╚═╝
  targets: {

    './api/helpers/:relPath': { template: 'helper.template' }

  },


  //  ╔╦╗╔═╗╔╦╗╔═╗╦  ╔═╗╔╦╗╔═╗╔═╗  ╔╦╗╦╦═╗╔═╗╔═╗╔╦╗╔═╗╦═╗╦ ╦
  //   ║ ║╣ ║║║╠═╝║  ╠═╣ ║ ║╣ ╚═╗   ║║║╠╦╝║╣ ║   ║ ║ ║╠╦╝╚╦╝
  //   ╩ ╚═╝╩ ╩╩  ╩═╝╩ ╩ ╩ ╚═╝╚═╝  ═╩╝╩╩╚═╚═╝╚═╝ ╩ ╚═╝╩╚═ ╩
  templatesDirectory: path.resolve(__dirname,'./templates'),

};
