// File:           huntsman.js
// Created:        09-Sep-2013
// Creator:        Malcolm Inglis
// $Revision: 134 $
// $Id: huntsman.js 134 2014-03-05 04:20:29Z autoPublisher $
//==================================================================================
// COPYRIGHT (c) 1995-2011 CSG SYSTEMS INTERNATIONAL, INC. AND/OR ITS AFFILIATES ( CSG ).
// ALL RIGHTS RESERVED.
//
// THIS SOFTWARE AND RELATED INFORMATION IS CONFIDENTIAL AND PROPRIETARY TO CSG
// AND MAY NOT BE DISCLOSED, COPIED, MODIFIED, OR OTHERWISE USED EXCEPT IN
// ACCORDANCE WITH THE LICENSE AGREEMENT ENTERED INTO WITH CSG. THIS INFORMATION
// IS PROTECTED BY INTERNATIONAL COPYRIGHT LAWS AND ANY UNAUTHORIZED USE THEREOF
// MAY VIOLATE COPYRIGHT, TRADEMARK, AND OTHER LAWS. ANY UNAUTHORIZED USE OF THIS
// SOFTWARE AND/OR INFORMATION WILL AUTOMATICALLY TERMINATE YOUR RIGHT TO USE THIS
// SOFTWARE AND/OR INFORMATION.
//==================================================================================
//
// USAGE:
//       include this file in html page
//
// DESCRIPTION:
//       This script provides functions to match the input terms with the contents
//       that comes from JSON file.
//       It listens the 'click' event on 'huntsman-submit' html element and outputs
//       the searching results to 'huntsman-output' html element
//

;(function() {

    // type Word = String
    //      A Word is a String without spaces.

    // type Term = [String]
    //      A Term is an array of Strings without spaces, where asterisks (*)
    //      matches any character 0 or more times and question mark (?) matches
    //      any character 1 time

    var root = this;

    var version = '0.0.1';

    var debug = false;

    // Match the huntsman searching wildcard characters * and ?
    // into js regular expressions .* and .
    // Also escape other regular expression special characters
    var remap = { '*' : '.*', '?'  : '.', '\\' : '\\\\', '^' : '\\^',
                  '$' : '\\$', '.' : '\\.', '|' : '\\|', '+' : '\\+',
                  '(' : '\\(', ')' : '\\)', '[' : '\\[', ']' : '\\]',
                  '{' : '\\{', '}' : '\\}'
                };
    
    // Following common words are striped from the index file.
    // Remove them from terms as well for a higher matching possibility
    var common = [
                  'a', 'an', 'and', 'any', 'as',
                  'are', 'be', 'by', 'for', 'from',
                  'has', 'if', 'in', 'into', 'is',
                  'it', 'of', 'on', 'or', 'may',
                  'not', 'so', 'that', 'the', 'these',
                  'this', 'those', 'to', 'used', 'with',
                  'when', 'which', 'while'
                 ];

    // Makes an array out of the given array-like object (e.g. what's
    // returned from most DOM queries).
    var array = function( xs ) {
        return Array.prototype.slice.call( xs, 0 );
    };

    var getElementsByClass = function( el, className ) {
        return array( el.getElementsByClassName( className ) );
    };

    // Render index JSON data
    var install = function( index ) {
        getElementsByClass( document, 'huntsman' ).forEach(function( el ) {
            installElement( el, index );
        });
    };

    var installElement = function( rootEl, index ) {
        var termsEls  = getElementsByClass( rootEl, 'huntsman-terms' );
        var submitEls = getElementsByClass( rootEl, 'huntsman-submit' );
        var outputEls = getElementsByClass( rootEl, 'huntsman-output' );
        submitEls.forEach(function( el ) {
            // Create search callback
            el.addEventListener( 'click', function( ev ) {
                ev.preventDefault();
                outputEls.forEach( removeChildren );
                search({
                    index: index,
                    terms: extractTerms( termsEls ),
                    onMatch: addMatch( outputEls ),
                    onNoMatch: addNoMatches( outputEls )
                });
            });
        });
    };

    // Removes all children from the given element.
    var removeChildren = function( el ) {
        while ( el.lastChild ) {
            el.removeChild( el.lastChild );
        }
    };

    // :: [HTMLInputElement] -> [Term]
    // :: "aa bb c*d e?"     -> ['aa', 'bb', 'c.*d', 'e.']
    // Returns an array of terms taken from the given array of input elements.
    var extractTerms = function( els ) {
        return els.reduce( function( acc, el ) {
            var reexp = Object.keys(remap)
                              .map(function(key) { return "\\"+key;})
                              .join('');
            // Replace the matched pattern /[\*\?]/g 
            // with the corresponding characters of remap
            return acc.concat( el.value.replace(new RegExp("["+reexp+"]",'g'),
                                                function(match) { return remap[match]; })
                                       .split( ' ' )
                                       .filter(function(element) { 
                                                 return (common.indexOf(element.toLowerCase()) === -1); 
                                               }));
        }, [] );
    };


    // Handler passed into `search()` to add the matching entry to the DOM.
    // Example:
    // <div class="huntsman-result">
    //   <a href="11526.htm" target="BODY">biBmpStartAlone&amp;()
    //   </a>
    // </div>
    var addMatch = function( outputs ) {
        return function( entry ) {
            var result = document.createElement( 'div' );
            result.className = 'huntsman-result';
            var anchor = document.createElement( 'a' );
            anchor.href = entry.url;
            anchor.setAttribute('target','BODY');
            var text = document.createTextNode( entry.title );
            anchor.appendChild( text );
            result.appendChild( anchor );
            outputs.forEach( function( output ) {
                output.appendChild( result );
            } );
        };
    };

    // Handler passed into `search()` to call when there are no matches.
    // Example:
    // <div class="huntsman-no-result">No results found.</div>
    var addNoMatches = function( outputs ) {
        return function() {
            var div = document.createElement( 'div' );
            div.className = 'huntsman-no-result';
            var text = document.createTextNode( 'No results found.' );
            div.appendChild( text );
            outputs.forEach(function( output ) {
                output.appendChild( div );
            });
        };
    };

    // Searches the index and calls the given match handler when a match is
    // found, or the given no-match handler if there were no matches after
    // finishing.
    var search = function( options ) {
        var index = options.index;
        var terms = options.terms;
        var matched = false;
        var noMatchHandler = options.onNoMatch;
        var matchHandler = options.onMatch;
        index.forEach(function( entry ) {
            if(debug) {
                console.log('Start Matching:');
                console.log('terms: '+terms);
                console.log('words: '+entry.contents);
            }
            var matches = terms.filter( termMatcher( entry.contents ) );
            // Only a match if every term matched the entry.
            if ( matches.length == terms.length ) {
                matchHandler( entry );
                matched = true;
            }
        });
        if ( !matched ) {
            noMatchHandler();
        }
    };

    // :: [Word] -> Term -> Boolean
    // Given an array of words, returns a function that takes a term and
    // returns true if that term matches at least one word in the given array.
    var termMatcher = function( words ) {
        return function( term ) {
            return words.filter(wordMatcher( term )).length > 0;
        }
    };

    // :: Term -> Word -> Boolean
    // Returns a function that takes a word and returns true if the given
    // term matches that word, and false otherwise.
    var wordMatcher = function( term ) {
        return function( word ) {
            // Reduces to false if this word doesn't match the term.
            var pattern = new RegExp('^\\W*'+term+'\\W*$', 'i');
            var result = pattern.test(word);
            if(debug) {
                if (result) {
                    console.log(' '+term+' == '+word);
                } else {
                    console.log(' '+term+' <> '+word);
                }
            }
            return result;
        };
    };

    // Export the Huntsman object and attributes.
    root.huntsman = {
        version: version,
        getElementsByClass: getElementsByClass,
        install: install,
        installElement: installElement,
        extractTerms: extractTerms,
        termMatcher: termMatcher,
        wordMatcher: wordMatcher,
    };

}).call( this );

