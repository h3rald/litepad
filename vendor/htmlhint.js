(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.HTMLHint = {}));
  }(this, (function (exports) { 'use strict';
  
    class HTMLParser {
      constructor() {
        this._listeners = {};
        this._mapCdataTags = this.makeMap('script,style');
        this._arrBlocks = [];
        this.lastEvent = null;
      }
  
      makeMap(str) {
        var obj = {};
        var items = str.split(',');
  
        for (var i = 0; i < items.length; i++) {
          obj[items[i]] = true;
        }
  
        return obj
      }
  
      parse(html) {
        var self = this;
        var mapCdataTags = self._mapCdataTags;
  
        // eslint-disable-next-line
        var regTag = /<(?:\/([^\s>]+)\s*|!--([\s\S]*?)--|!([^>]*?)|([\w\-:]+)((?:\s+[^\s"'>\/=\x00-\x0F\x7F\x80-\x9F]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]*))?)*?)\s*(\/?))>/g,
          // eslint-disable-next-line
          regAttr = /\s*([^\s"'>\/=\x00-\x0F\x7F\x80-\x9F]+)(?:\s*=\s*(?:(")([^"]*)"|(')([^']*)'|([^\s"'>]*)))?/g,
          regLine = /\r?\n/g;
  
        var match;
        var matchIndex;
        var lastIndex = 0;
        var tagName;
        var arrAttrs;
        var tagCDATA;
        var attrsCDATA;
        var arrCDATA;
        var lastCDATAIndex = 0;
        var text;
        var lastLineIndex = 0;
        var line = 1;
        var arrBlocks = self._arrBlocks;
  
        self.fire('start', {
          pos: 0,
          line: 1,
          col: 1,
        });
  
        // Memory block
        function saveBlock(type, raw, pos, data) {
          var col = pos - lastLineIndex + 1;
          if (data === undefined) {
            data = {};
          }
          data.raw = raw;
          data.pos = pos;
          data.line = line;
          data.col = col;
          arrBlocks.push(data);
          self.fire(type, data);
  
          // eslint-disable-next-line
          var lineMatch;
          while ((lineMatch = regLine.exec(raw))) {
            line++;
            lastLineIndex = pos + regLine.lastIndex;
          }
        }
  
        while ((match = regTag.exec(html))) {
          matchIndex = match.index;
          if (matchIndex > lastIndex) {
            // Save the previous text or CDATA
            text = html.substring(lastIndex, matchIndex);
            if (tagCDATA) {
              arrCDATA.push(text);
            } else {
              // text
              saveBlock('text', text, lastIndex);
            }
          }
          lastIndex = regTag.lastIndex;
  
          if ((tagName = match[1])) {
            if (tagCDATA && tagName === tagCDATA) {
              // Output CDATA before closing the label
              text = arrCDATA.join('');
              saveBlock('cdata', text, lastCDATAIndex, {
                tagName: tagCDATA,
                attrs: attrsCDATA,
              });
              tagCDATA = null;
              attrsCDATA = null;
              arrCDATA = null;
            }
  
            if (!tagCDATA) {
              // End of label
              saveBlock('tagend', match[0], matchIndex, {
                tagName: tagName,
              });
              continue
            }
          }
  
          if (tagCDATA) {
            arrCDATA.push(match[0]);
          } else {
            if ((tagName = match[4])) {
              // Label start
              arrAttrs = [];
              var attrs = match[5];
              var attrMatch;
              var attrMatchCount = 0;
  
              while ((attrMatch = regAttr.exec(attrs))) {
                var name = attrMatch[1];
                var quote = attrMatch[2]
                  ? attrMatch[2]
                  : attrMatch[4]
                  ? attrMatch[4]
                  : '';
                var value = attrMatch[3]
                  ? attrMatch[3]
                  : attrMatch[5]
                  ? attrMatch[5]
                  : attrMatch[6]
                  ? attrMatch[6]
                  : '';
  
                arrAttrs.push({
                  name: name,
                  value: value,
                  quote: quote,
                  index: attrMatch.index,
                  raw: attrMatch[0],
                });
                attrMatchCount += attrMatch[0].length;
              }
  
              if (attrMatchCount === attrs.length) {
                saveBlock('tagstart', match[0], matchIndex, {
                  tagName: tagName,
                  attrs: arrAttrs,
                  close: match[6],
                });
  
                if (mapCdataTags[tagName]) {
                  tagCDATA = tagName;
                  attrsCDATA = arrAttrs.concat();
                  arrCDATA = [];
                  lastCDATAIndex = lastIndex;
                }
              } else {
                // If a miss match occurs, the current content is matched to text
                saveBlock('text', match[0], matchIndex);
              }
            } else if (match[2] || match[3]) {
              // Comment tag
              saveBlock('comment', match[0], matchIndex, {
                content: match[2] || match[3],
                long: match[2] ? true : false,
              });
            }
          }
        }
  
        if (html.length > lastIndex) {
          // End text
          text = html.substring(lastIndex, html.length);
          saveBlock('text', text, lastIndex);
        }
  
        self.fire('end', {
          pos: lastIndex,
          line: line,
          col: html.length - lastLineIndex + 1,
        });
      }
  
      addListener(types, listener) {
        var _listeners = this._listeners;
        var arrTypes = types.split(/[,\s]/);
        var type;
  
        for (var i = 0, l = arrTypes.length; i < l; i++) {
          type = arrTypes[i];
          if (_listeners[type] === undefined) {
            _listeners[type] = [];
          }
          _listeners[type].push(listener);
        }
      }
  
      fire(type, data) {
        if (data === undefined) {
          data = {};
        }
        data.type = type;
        var self = this;
        var listeners = [];
        var listenersType = self._listeners[type];
        var listenersAll = self._listeners['all'];
  
        if (listenersType !== undefined) {
          listeners = listeners.concat(listenersType);
        }
        if (listenersAll !== undefined) {
          listeners = listeners.concat(listenersAll);
        }
  
        var lastEvent = self.lastEvent;
        if (lastEvent !== null) {
          delete lastEvent['lastEvent'];
          data.lastEvent = lastEvent;
        }
  
        self.lastEvent = data;
  
        for (var i = 0, l = listeners.length; i < l; i++) {
          listeners[i].call(self, data);
        }
      }
  
      removeListener(type, listener) {
        var listenersType = this._listeners[type];
        if (listenersType !== undefined) {
          for (var i = 0, l = listenersType.length; i < l; i++) {
            if (listenersType[i] === listener) {
              listenersType.splice(i, 1);
              break
            }
          }
        }
      }
  
      fixPos(event, index) {
        var text = event.raw.substr(0, index);
        var arrLines = text.split(/\r?\n/);
        var lineCount = arrLines.length - 1;
        var line = event.line;
        var col;
  
        if (lineCount > 0) {
          line += lineCount;
          col = arrLines[lineCount].length + 1;
        } else {
          col = event.col + index;
        }
  
        return {
          line: line,
          col: col,
        }
      }
  
      getMapAttrs(arrAttrs) {
        var mapAttrs = {};
        var attr;
  
        for (var i = 0, l = arrAttrs.length; i < l; i++) {
          attr = arrAttrs[i];
          mapAttrs[attr.name] = attr.value;
        }
  
        return mapAttrs
      }
    }
  
    class Reporter {
      constructor(html, ruleset) {
        this.html = html;
        this.lines = html.split(/\r?\n/);
        var match = html.match(/\r?\n/);
  
        this.brLen = match !== null ? match[0].length : 0;
        this.ruleset = ruleset;
        this.messages = [];
  
        this.error = this.report.bind(this, 'error');
        this.warn = this.report.bind(this, 'warning');
        this.info = this.report.bind(this, 'info');
      }
  
      report(type, message, line, col, rule, raw) {
        var self = this;
        var lines = self.lines;
        var brLen = self.brLen;
        var evidence;
        var evidenceLen;
  
        for (var i = line - 1, lineCount = lines.length; i < lineCount; i++) {
          evidence = lines[i];
          evidenceLen = evidence.length;
          if (col > evidenceLen && line < lineCount) {
            line++;
            col -= evidenceLen;
            if (col !== 1) {
              col -= brLen;
            }
          } else {
            break
          }
        }
  
        self.messages.push({
          type: type,
          message: message,
          raw: raw,
          evidence: evidence,
          line: line,
          col: col,
          rule: {
            id: rule.id,
            description: rule.description,
            link: 'https://github.com/thedaviddias/HTMLHint/wiki/' + rule.id,
          },
        });
      }
    }
  
    var altRequire = {
      id: 'alt-require',
      description:
        'The alt attribute of an <img> element must be present and alt attribute of area[href] and input[type=image] must have a value.',
      init: function (parser, reporter) {
        var self = this;
        parser.addListener('tagstart', function (event) {
          var tagName = event.tagName.toLowerCase();
          var mapAttrs = parser.getMapAttrs(event.attrs);
          var col = event.col + tagName.length + 1;
          var selector;
  
          if (tagName === 'img' && !('alt' in mapAttrs)) {
            reporter.warn(
              'An alt attribute must be present on <img> elements.',
              event.line,
              col,
              self,
              event.raw
            );
          } else if (
            (tagName === 'area' && 'href' in mapAttrs) ||
            (tagName === 'input' && mapAttrs['type'] === 'image')
          ) {
            if (!('alt' in mapAttrs) || mapAttrs['alt'] === '') {
              selector = tagName === 'area' ? 'area[href]' : 'input[type=image]';
              reporter.warn(
                'The alt attribute of ' + selector + ' must have a value.',
                event.line,
                col,
                self,
                event.raw
              );
            }
          }
        });
      },
    };
  
    /**
     * testAgainstStringOrRegExp
     *
     * @param {string} value string to test
     * @param {string|RegExp} comparison raw string or regex string
     * @returns {boolean}
     */
    function testAgainstStringOrRegExp(value, comparison) {
      // If it's a RegExp, test directly
      if (comparison instanceof RegExp) {
        return comparison.test(value)
          ? { match: value, pattern: comparison }
          : false
      }
  
      // Check if it's RegExp in a string
      const firstComparisonChar = comparison[0];
      const lastComparisonChar = comparison[comparison.length - 1];
      const secondToLastComparisonChar = comparison[comparison.length - 2];
  
      const comparisonIsRegex =
        firstComparisonChar === '/' &&
        (lastComparisonChar === '/' ||
          (secondToLastComparisonChar === '/' && lastComparisonChar === 'i'));
  
      const hasCaseInsensitiveFlag = comparisonIsRegex && lastComparisonChar === 'i';
  
      // If so, create a new RegExp from it
      if (comparisonIsRegex) {
        const valueMatches = hasCaseInsensitiveFlag
          ? new RegExp(comparison.slice(1, -2), 'i').test(value)
          : new RegExp(comparison.slice(1, -1)).test(value);
  
        return valueMatches
      }
  
      // Otherwise, it's a string. Do a strict comparison
      return value === comparison
    }
  
    var attrLowercase = {
      id: 'attr-lowercase',
      description: 'All attribute names must be in lowercase.',
      init: function (parser, reporter, options) {
        var self = this;
        var exceptions = Array.isArray(options) ? options : [];
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
            var attrName = attr.name;
  
            if (
              !exceptions.find((exp) => testAgainstStringOrRegExp(attrName, exp)) &&
              attrName !== attrName.toLowerCase()
            ) {
              reporter.error(
                'The attribute name of [ ' + attrName + ' ] must be in lowercase.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          }
        });
      },
    };
  
    var attrSorted = {
      id: 'attr-sorted',
      description: 'Attribute tags must be in proper order.',
      init: function (parser, reporter) {
        var self = this;
        var orderMap = {};
        var sortOrder = [
          'class',
          'id',
          'name',
          'src',
          'for',
          'type',
          'href',
          'value',
          'title',
          'alt',
          'role',
        ];
  
        for (var i = 0; i < sortOrder.length; i++) {
          orderMap[sortOrder[i]] = i;
        }
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var listOfAttributes = [];
  
          for (var i = 0; i < attrs.length; i++) {
            listOfAttributes.push(attrs[i].name);
          }
  
          var originalAttrs = JSON.stringify(listOfAttributes);
          listOfAttributes.sort(function (a, b) {
            if (orderMap[a] == undefined && orderMap[b] == undefined) {
              return 0
            }
            if (orderMap[a] == undefined) {
              return 1
            } else if (orderMap[b] == undefined) {
              return -1
            }
            return orderMap[a] - orderMap[b] || a.localeCompare(b)
          });
  
          if (originalAttrs !== JSON.stringify(listOfAttributes)) {
            reporter.error(
              'Inaccurate order ' +
                originalAttrs +
                ' should be in hierarchy ' +
                JSON.stringify(listOfAttributes) +
                ' ',
              event.line,
              event.col,
              self
            );
          }
        });
      },
    };
  
    var attrNoDuplication = {
      id: 'attr-no-duplication',
      description: 'Elements cannot have duplicate attributes.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var attrName;
          var col = event.col + event.tagName.length + 1;
  
          var mapAttrName = {};
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
            attrName = attr.name;
  
            if (mapAttrName[attrName] === true) {
              reporter.error(
                'Duplicate of attribute name [ ' + attr.name + ' ] was found.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
            mapAttrName[attrName] = true;
          }
        });
      },
    };
  
    var attrUnsafeChars = {
      id: 'attr-unsafe-chars',
      description: 'Attribute values cannot contain unsafe chars.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
          // exclude \x09(\t), \x0a(\r), \x0d(\n)
          // eslint-disable-next-line
          var regUnsafe = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;
          var match;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
            match = attr.value.match(regUnsafe);
  
            if (match !== null) {
              var unsafeCode = escape(match[0])
                .replace(/%u/, '\\u')
                .replace(/%/, '\\x');
              reporter.warn(
                'The value of attribute [ ' +
                  attr.name +
                  ' ] cannot contain an unsafe char [ ' +
                  unsafeCode +
                  ' ].',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          }
        });
      },
    };
  
    var attrValueDoubleQuotes = {
      id: 'attr-value-double-quotes',
      description: 'Attribute values must be in double quotes.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
  
            if (
              (attr.value !== '' && attr.quote !== '"') ||
              (attr.value === '' && attr.quote === "'")
            ) {
              reporter.error(
                'The value of attribute [ ' +
                  attr.name +
                  ' ] must be in double quotes.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          }
        });
      },
    };
  
    var attrValueNotEmpty = {
      id: 'attr-value-not-empty',
      description: 'All attributes must have values.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
  
            if (attr.quote === '' && attr.value === '') {
              reporter.warn(
                'The attribute [ ' + attr.name + ' ] must have a value.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          }
        });
      },
    };
  
    var attrValueSingleQuotes = {
      id: 'attr-value-single-quotes',
      description: 'Attribute values must be in single quotes.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
  
            if (
              (attr.value !== '' && attr.quote !== "'") ||
              (attr.value === '' && attr.quote === '"')
            ) {
              reporter.error(
                'The value of attribute [ ' +
                  attr.name +
                  ' ] must be in single quotes.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          }
        });
      },
    };
  
    var attrWhitespace = {
      id: 'attr-whitespace',
      description:
        'All attributes should be separated by only one space and not have leading/trailing whitespace.',
      init: function (parser, reporter, options) {
        var self = this;
        var exceptions = Array.isArray(options) ? options : [];
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
  
          attrs.forEach(function (elem) {
            attr = elem;
            var attrName = elem.name;
  
            if (exceptions.indexOf(attrName) !== -1) {
              return
            }
  
            //Check first and last characters for spaces
            if (elem.value.trim(elem.value) !== elem.value) {
              reporter.error(
                'The attributes of [ ' +
                  attrName +
                  ' ] must not have trailing whitespace.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
  
            if (elem.value.replace(/ +(?= )/g, '') !== elem.value) {
              reporter.error(
                'The attributes of [ ' +
                  attrName +
                  ' ] must be separated by only one space.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          });
        });
      },
    };
  
    var doctypeFirst = {
      id: 'doctype-first',
      description: 'Doctype must be declared first.',
      init: function (parser, reporter) {
        var self = this;
  
        var allEvent = function (event) {
          if (
            event.type === 'start' ||
            (event.type === 'text' && /^\s*$/.test(event.raw))
          ) {
            return
          }
  
          if (
            (event.type !== 'comment' && event.long === false) ||
            /^DOCTYPE\s+/i.test(event.content) === false
          ) {
            reporter.error(
              'Doctype must be declared first.',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
  
          parser.removeListener('all', allEvent);
        };
  
        parser.addListener('all', allEvent);
      },
    };
  
    var doctypeHtml5 = {
      id: 'doctype-html5',
      description: 'Invalid doctype. Use: "<!DOCTYPE html>"',
      init: function (parser, reporter) {
        var self = this;
  
        function onComment(event) {
          if (
            event.long === false &&
            event.content.toLowerCase() !== 'doctype html'
          ) {
            reporter.warn(
              'Invalid doctype. Use: "<!DOCTYPE html>"',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
        }
  
        function onTagStart() {
          parser.removeListener('comment', onComment);
          parser.removeListener('tagstart', onTagStart);
        }
  
        parser.addListener('all', onComment);
        parser.addListener('tagstart', onTagStart);
      },
    };
  
    var headScriptDisabled = {
      id: 'head-script-disabled',
      description: 'The <script> tag cannot be used in a <head> tag.',
      init: function (parser, reporter) {
        var self = this;
        var reScript = /^(text\/javascript|application\/javascript)$/i;
        var isInHead = false;
  
        function onTagStart(event) {
          var mapAttrs = parser.getMapAttrs(event.attrs);
          var type = mapAttrs.type;
          var tagName = event.tagName.toLowerCase();
  
          if (tagName === 'head') {
            isInHead = true;
          }
  
          if (
            isInHead === true &&
            tagName === 'script' &&
            (!type || reScript.test(type) === true)
          ) {
            reporter.warn(
              'The <script> tag cannot be used in a <head> tag.',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
        }
  
        function onTagEnd(event) {
          if (event.tagName.toLowerCase() === 'head') {
            parser.removeListener('tagstart', onTagStart);
            parser.removeListener('tagend', onTagEnd);
          }
        }
  
        parser.addListener('tagstart', onTagStart);
        parser.addListener('tagend', onTagEnd);
      },
    };
  
    var hrefAbsOrRel = {
      id: 'href-abs-or-rel',
      description: 'An href attribute must be either absolute or relative.',
      init: function (parser, reporter, options) {
        var self = this;
  
        var hrefMode = options === 'abs' ? 'absolute' : 'relative';
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
  
            if (attr.name === 'href') {
              if (
                (hrefMode === 'absolute' && /^\w+?:/.test(attr.value) === false) ||
                (hrefMode === 'relative' &&
                  /^https?:\/\//.test(attr.value) === true)
              ) {
                reporter.warn(
                  'The value of the href attribute [ ' +
                    attr.value +
                    ' ] must be ' +
                    hrefMode +
                    '.',
                  event.line,
                  col + attr.index,
                  self,
                  attr.raw
                );
              }
              break
            }
          }
        });
      },
    };
  
    var idClassAdDisabled = {
      id: 'id-class-ad-disabled',
      description:
        'The id and class attributes cannot use the ad keyword, it will be blocked by adblock software.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var attrName;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
            attrName = attr.name;
  
            if (/^(id|class)$/i.test(attrName)) {
              if (/(^|[-_])ad([-_]|$)/i.test(attr.value)) {
                reporter.warn(
                  'The value of attribute ' +
                    attrName +
                    ' cannot use the ad keyword.',
                  event.line,
                  col + attr.index,
                  self,
                  attr.raw
                );
              }
            }
          }
        });
      },
    };
  
    var idClassValue = {
      id: 'id-class-value',
      description:
        'The id and class attribute values must meet the specified rules.',
      init: function (parser, reporter, options) {
        var self = this;
        var arrRules = {
          underline: {
            regId: /^[a-z\d]+(_[a-z\d]+)*$/,
            message:
              'The id and class attribute values must be in lowercase and split by an underscore.',
          },
          dash: {
            regId: /^[a-z\d]+(-[a-z\d]+)*$/,
            message:
              'The id and class attribute values must be in lowercase and split by a dash.',
          },
          hump: {
            regId: /^[a-z][a-zA-Z\d]*([A-Z][a-zA-Z\d]*)*$/,
            message:
              'The id and class attribute values must meet the camelCase style.',
          },
        };
        var rule;
  
        if (typeof options === 'string') {
          rule = arrRules[options];
        } else {
          rule = options;
        }
  
        if (rule && rule.regId) {
          var regId = rule.regId;
          var message = rule.message;
  
          if (!(regId instanceof RegExp)) {
            regId = new RegExp(regId);
          }
  
          parser.addListener('tagstart', function (event) {
            var attrs = event.attrs;
            var attr;
            var col = event.col + event.tagName.length + 1;
  
            for (var i = 0, l1 = attrs.length; i < l1; i++) {
              attr = attrs[i];
  
              if (attr.name.toLowerCase() === 'id') {
                if (regId.test(attr.value) === false) {
                  reporter.warn(
                    message,
                    event.line,
                    col + attr.index,
                    self,
                    attr.raw
                  );
                }
              }
  
              if (attr.name.toLowerCase() === 'class') {
                var arrClass = attr.value.split(/\s+/g);
                var classValue;
  
                for (var j = 0, l2 = arrClass.length; j < l2; j++) {
                  classValue = arrClass[j];
                  if (classValue && regId.test(classValue) === false) {
                    reporter.warn(
                      message,
                      event.line,
                      col + attr.index,
                      self,
                      classValue
                    );
                  }
                }
              }
            }
          });
        }
      },
    };
  
    var idUnique = {
      id: 'id-unique',
      description: 'The value of id attributes must be unique.',
      init: function (parser, reporter) {
        var self = this;
        var mapIdCount = {};
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var id;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
  
            if (attr.name.toLowerCase() === 'id') {
              id = attr.value;
  
              if (id) {
                if (mapIdCount[id] === undefined) {
                  mapIdCount[id] = 1;
                } else {
                  mapIdCount[id]++;
                }
  
                if (mapIdCount[id] > 1) {
                  reporter.error(
                    'The id value [ ' + id + ' ] must be unique.',
                    event.line,
                    col + attr.index,
                    self,
                    attr.raw
                  );
                }
              }
              break
            }
          }
        });
      },
    };
  
    var inlineScriptDisabled = {
      id: 'inline-script-disabled',
      description: 'Inline script cannot be used.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
          var attrName;
          var reEvent = /^on(unload|message|submit|select|scroll|resize|mouseover|mouseout|mousemove|mouseleave|mouseenter|mousedown|load|keyup|keypress|keydown|focus|dblclick|click|change|blur|error)$/i;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
            attrName = attr.name.toLowerCase();
  
            if (reEvent.test(attrName) === true) {
              reporter.warn(
                'Inline script [ ' + attr.raw + ' ] cannot be used.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            } else if (attrName === 'src' || attrName === 'href') {
              if (/^\s*javascript:/i.test(attr.value)) {
                reporter.warn(
                  'Inline script [ ' + attr.raw + ' ] cannot be used.',
                  event.line,
                  col + attr.index,
                  self,
                  attr.raw
                );
              }
            }
          }
        });
      },
    };
  
    var inlineStyleDisabled = {
      id: 'inline-style-disabled',
      description: 'Inline style cannot be used.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var attr;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
  
            if (attr.name.toLowerCase() === 'style') {
              reporter.warn(
                'Inline style [ ' + attr.raw + ' ] cannot be used.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          }
        });
      },
    };
  
    var inputRequiresLabel = {
      id: 'input-requires-label',
      description: 'All [ input ] tags must have a corresponding [ label ] tag. ',
      init: function (parser, reporter) {
        var self = this;
        var labelTags = [];
        var inputTags = [];
  
        parser.addListener('tagstart', function (event) {
          var tagName = event.tagName.toLowerCase();
          var mapAttrs = parser.getMapAttrs(event.attrs);
          var col = event.col + tagName.length + 1;
  
          if (tagName === 'input') {
            inputTags.push({ event: event, col: col, id: mapAttrs['id'] });
          }
  
          if (tagName === 'label') {
            if ('for' in mapAttrs && mapAttrs['for'] !== '') {
              labelTags.push({ event: event, col: col, forValue: mapAttrs['for'] });
            }
          }
        });
  
        parser.addListener('end', function () {
          inputTags.forEach(function (inputTag) {
            if (!hasMatchingLabelTag(inputTag)) {
              reporter.warn(
                'No matching [ label ] tag found.',
                inputTag.event.line,
                inputTag.col,
                self,
                inputTag.event.raw
              );
            }
          });
        });
  
        function hasMatchingLabelTag(inputTag) {
          var found = false;
          labelTags.forEach(function (labelTag) {
            if (inputTag.id && inputTag.id === labelTag.forValue) {
              found = true;
            }
          });
          return found
        }
      },
    };
  
    var scriptDisabled = {
      id: 'script-disabled',
      description: 'The <script> tag cannot be used.',
      init: function (parser, reporter) {
  
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          if (event.tagName.toLowerCase() === 'script') {
            reporter.error(
              'The <script> tag cannot be used.',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
        });
      },
    };
  
    var spaceTabMixedDisabled = {
      id: 'space-tab-mixed-disabled',
      description: 'Do not mix tabs and spaces for indentation.',
      init: function (parser, reporter, options) {
        var self = this;
        var indentMode = 'nomix';
        var spaceLengthRequire = null;
  
        if (typeof options === 'string') {
          var match = options.match(/^([a-z]+)(\d+)?/);
          indentMode = match[1];
          spaceLengthRequire = match[2] && parseInt(match[2], 10);
        }
  
        parser.addListener('text', function (event) {
          var raw = event.raw;
          var reMixed = /(^|\r?\n)([ \t]+)/g;
          var match;
  
          while ((match = reMixed.exec(raw))) {
            var fixedPos = parser.fixPos(event, match.index + match[1].length);
            if (fixedPos.col !== 1) {
              continue
            }
  
            var whiteSpace = match[2];
            if (indentMode === 'space') {
              if (spaceLengthRequire) {
                if (
                  /^ +$/.test(whiteSpace) === false ||
                  whiteSpace.length % spaceLengthRequire !== 0
                ) {
                  reporter.warn(
                    'Please use space for indentation and keep ' +
                      spaceLengthRequire +
                      ' length.',
                    fixedPos.line,
                    1,
                    self,
                    event.raw
                  );
                }
              } else {
                if (/^ +$/.test(whiteSpace) === false) {
                  reporter.warn(
                    'Please use space for indentation.',
                    fixedPos.line,
                    1,
                    self,
                    event.raw
                  );
                }
              }
            } else if (indentMode === 'tab' && /^\t+$/.test(whiteSpace) === false) {
              reporter.warn(
                'Please use tab for indentation.',
                fixedPos.line,
                1,
                self,
                event.raw
              );
            } else if (/ +\t|\t+ /.test(whiteSpace) === true) {
              reporter.warn(
                'Do not mix tabs and spaces for indentation.',
                fixedPos.line,
                1,
                self,
                event.raw
              );
            }
          }
        });
      },
    };
  
    var specCharEscape = {
      id: 'spec-char-escape',
      description: 'Special characters must be escaped.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('text', function (event) {
          var raw = event.raw;
          // TODO: improve use-cases for &
          // eslint-disable-next-line
          var reSpecChar = /([<>])|( \& )/g;
          var match;
  
          while ((match = reSpecChar.exec(raw))) {
            var fixedPos = parser.fixPos(event, match.index);
            reporter.error(
              'Special characters must be escaped : [ ' + match[0] + ' ].',
              fixedPos.line,
              fixedPos.col,
              self,
              event.raw
            );
          }
        });
      },
    };
  
    var srcNotEmpty = {
      id: 'src-not-empty',
      description: 'The src attribute of an img(script,link) must have a value.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          var tagName = event.tagName;
          var attrs = event.attrs;
          var attr;
          var col = event.col + tagName.length + 1;
  
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
  
            if (
              ((/^(img|script|embed|bgsound|iframe)$/.test(tagName) === true &&
                attr.name === 'src') ||
                (tagName === 'link' && attr.name === 'href') ||
                (tagName === 'object' && attr.name === 'data')) &&
              attr.value === ''
            ) {
              reporter.error(
                'The attribute [ ' +
                  attr.name +
                  ' ] of the tag [ ' +
                  tagName +
                  ' ] must have a value.',
                event.line,
                col + attr.index,
                self,
                attr.raw
              );
            }
          }
        });
      },
    };
  
    var styleDisabled = {
      id: 'style-disabled',
      description: '<style> tags cannot be used.',
      init: function (parser, reporter) {
        var self = this;
  
        parser.addListener('tagstart', function (event) {
          if (event.tagName.toLowerCase() === 'style') {
            reporter.warn(
              'The <style> tag cannot be used.',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
        });
      },
    };
  
    var tagPair = {
      id: 'tag-pair',
      description: 'Tag must be paired.',
      init: function (parser, reporter) {
        var self = this;
        var stack = [];
        var mapEmptyTags = parser.makeMap(
          'area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed,track,command,source,keygen,wbr'
        ); //HTML 4.01 + HTML 5
  
        parser.addListener('tagstart', function (event) {
          var tagName = event.tagName.toLowerCase();
          if (mapEmptyTags[tagName] === undefined && !event.close) {
            stack.push({
              tagName: tagName,
              line: event.line,
              raw: event.raw,
            });
          }
        });
  
        parser.addListener('tagend', function (event) {
          var tagName = event.tagName.toLowerCase();
  
          // Look up the matching start tag
          for (var pos = stack.length - 1; pos >= 0; pos--) {
            if (stack[pos].tagName === tagName) {
              break
            }
          }
  
          if (pos >= 0) {
            var arrTags = [];
            for (var i = stack.length - 1; i > pos; i--) {
              arrTags.push('</' + stack[i].tagName + '>');
            }
  
            if (arrTags.length > 0) {
              var lastEvent = stack[stack.length - 1];
              reporter.error(
                'Tag must be paired, missing: [ ' +
                  arrTags.join('') +
                  ' ], start tag match failed [ ' +
                  lastEvent.raw +
                  ' ] on line ' +
                  lastEvent.line +
                  '.',
                event.line,
                event.col,
                self,
                event.raw
              );
            }
            stack.length = pos;
          } else {
            reporter.error(
              'Tag must be paired, no start tag: [ ' + event.raw + ' ]',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
        });
  
        parser.addListener('end', function (event) {
          var arrTags = [];
  
          for (var i = stack.length - 1; i >= 0; i--) {
            arrTags.push('</' + stack[i].tagName + '>');
          }
  
          if (arrTags.length > 0) {
            var lastEvent = stack[stack.length - 1];
            reporter.error(
              'Tag must be paired, missing: [ ' +
                arrTags.join('') +
                ' ], open tag match failed [ ' +
                lastEvent.raw +
                ' ] on line ' +
                lastEvent.line +
                '.',
              event.line,
              event.col,
              self,
              ''
            );
          }
        });
      },
    };
  
    var tagSelfClose = {
      id: 'tag-self-close',
      description: 'Empty tags must be self closed.',
      init: function (parser, reporter) {
        var self = this;
        var mapEmptyTags = parser.makeMap(
          'area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed,track,command,source,keygen,wbr'
        ); //HTML 4.01 + HTML 5
  
        parser.addListener('tagstart', function (event) {
          var tagName = event.tagName.toLowerCase();
          if (mapEmptyTags[tagName] !== undefined) {
            if (!event.close) {
              reporter.warn(
                'The empty tag : [ ' + tagName + ' ] must be self closed.',
                event.line,
                event.col,
                self,
                event.raw
              );
            }
          }
        });
      },
    };
  
    var tagnameLowercase = {
      id: 'tagname-lowercase',
      description: 'All html element names must be in lowercase.',
      init: function (parser, reporter, options) {
        var self = this;
        var exceptions = Array.isArray(options) ? options : [];
  
        parser.addListener('tagstart,tagend', function (event) {
          var tagName = event.tagName;
          if (
            exceptions.indexOf(tagName) === -1 &&
            tagName !== tagName.toLowerCase()
          ) {
            reporter.error(
              'The html element name of [ ' + tagName + ' ] must be in lowercase.',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
        });
      },
    };
  
    var tagnameSpecialchars = {
      id: 'tagname-specialchars',
      description: 'All html element names must be in lowercase.',
      init: function (parser, reporter) {
        var self = this;
        var specialchars = /[^a-zA-Z0-9\-:_]/;
  
        parser.addListener('tagstart,tagend', function (event) {
          var tagName = event.tagName;
          if (specialchars.test(tagName)) {
            reporter.error(
              'The html element name of [ ' +
                tagName +
                ' ] contains special character.',
              event.line,
              event.col,
              self,
              event.raw
            );
          }
        });
      },
    };
  
    var titleRequire = {
      id: 'title-require',
      description: '<title> must be present in <head> tag.',
      init: function (parser, reporter) {
        var self = this;
        var headBegin = false;
        var hasTitle = false;
  
        function onTagStart(event) {
          var tagName = event.tagName.toLowerCase();
          if (tagName === 'head') {
            headBegin = true;
          } else if (tagName === 'title' && headBegin) {
            hasTitle = true;
          }
        }
  
        function onTagEnd(event) {
          var tagName = event.tagName.toLowerCase();
          if (hasTitle && tagName === 'title') {
            var lastEvent = event.lastEvent;
            if (
              lastEvent.type !== 'text' ||
              (lastEvent.type === 'text' && /^\s*$/.test(lastEvent.raw) === true)
            ) {
              reporter.error(
                '<title></title> must not be empty.',
                event.line,
                event.col,
                self,
                event.raw
              );
            }
          } else if (tagName === 'head') {
            if (hasTitle === false) {
              reporter.error(
                '<title> must be present in <head> tag.',
                event.line,
                event.col,
                self,
                event.raw
              );
            }
  
            parser.removeListener('tagstart', onTagStart);
            parser.removeListener('tagend', onTagEnd);
          }
        }
  
        parser.addListener('tagstart', onTagStart);
        parser.addListener('tagend', onTagEnd);
      },
    };
  
    var tagsTypings = {
      a: {
        selfclosing: false,
        attrsRequired: ['href', 'title'],
        redundantAttrs: ['alt'],
      },
      div: {
        selfclosing: false,
      },
      main: {
        selfclosing: false,
        redundantAttrs: ['role'],
      },
      nav: {
        selfclosing: false,
        redundantAttrs: ['role'],
      },
      script: {
        attrsOptional: [
          ['async', 'async'],
          ['defer', 'defer'],
        ],
      },
      img: {
        selfclosing: true,
        attrsRequired: ['src', 'alt', 'title'],
      },
    };
  
    var assign = function (target) {
      var _source;
  
      for (var i = 1; i < arguments.length; i++) {
        _source = arguments[i];
        for (var prop in _source) {
          target[prop] = _source[prop];
        }
      }
  
      return target
    };
  
    var tagsCheck = {
      id: 'tags-check',
      description: 'Checks html tags.',
      init: function (parser, reporter, options) {
        var self = this;
  
        if (typeof options !== 'boolean') {
          assign(tagsTypings, options);
        }
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var col = event.col + event.tagName.length + 1;
  
          var tagName = event.tagName.toLowerCase();
  
          if (tagsTypings[tagName]) {
            var currentTagType = tagsTypings[tagName];
  
            if (currentTagType.selfclosing === true && !event.close) {
              reporter.warn(
                'The <' + tagName + '> tag must be selfclosing.',
                event.line,
                event.col,
                self,
                event.raw
              );
            } else if (currentTagType.selfclosing === false && event.close) {
              reporter.warn(
                'The <' + tagName + '> tag must not be selfclosing.',
                event.line,
                event.col,
                self,
                event.raw
              );
            }
  
            if (currentTagType.attrsRequired) {
              currentTagType.attrsRequired.forEach(function (id) {
                if (Array.isArray(id)) {
                  var copyOfId = id.map(function (a) {
                    return a
                  });
                  var realID = copyOfId.shift();
                  var values = copyOfId;
  
                  if (
                    attrs.some(function (attr) {
                      return attr.name === realID
                    })
                  ) {
                    attrs.forEach(function (attr) {
                      if (
                        attr.name === realID &&
                        values.indexOf(attr.value) === -1
                      ) {
                        reporter.error(
                          'The <' +
                            tagName +
                            "> tag must have attr '" +
                            realID +
                            "' with one value of '" +
                            values.join("' or '") +
                            "'.",
                          event.line,
                          col,
                          self,
                          event.raw
                        );
                      }
                    });
                  } else {
                    reporter.error(
                      'The <' + tagName + "> tag must have attr '" + realID + "'.",
                      event.line,
                      col,
                      self,
                      event.raw
                    );
                  }
                } else if (
                  !attrs.some(function (attr) {
                    return id.split('|').indexOf(attr.name) !== -1
                  })
                ) {
                  reporter.error(
                    'The <' + tagName + "> tag must have attr '" + id + "'.",
                    event.line,
                    col,
                    self,
                    event.raw
                  );
                }
              });
            }
  
            if (currentTagType.attrsOptional) {
              currentTagType.attrsOptional.forEach(function (id) {
                if (Array.isArray(id)) {
                  var copyOfId = id.map(function (a) {
                    return a
                  });
                  var realID = copyOfId.shift();
                  var values = copyOfId;
  
                  if (
                    attrs.some(function (attr) {
                      return attr.name === realID
                    })
                  ) {
                    attrs.forEach(function (attr) {
                      if (
                        attr.name === realID &&
                        values.indexOf(attr.value) === -1
                      ) {
                        reporter.error(
                          'The <' +
                            tagName +
                            "> tag must have optional attr '" +
                            realID +
                            "' with one value of '" +
                            values.join("' or '") +
                            "'.",
                          event.line,
                          col,
                          self,
                          event.raw
                        );
                      }
                    });
                  }
                }
              });
            }
  
            if (currentTagType.redundantAttrs) {
              currentTagType.redundantAttrs.forEach(function (attrName) {
                if (
                  attrs.some(function (attr) {
                    return attr.name === attrName
                  })
                ) {
                  reporter.error(
                    "The attr '" +
                      attrName +
                      "' is redundant for <" +
                      tagName +
                      '> and should be ommited.',
                    event.line,
                    col,
                    self,
                    event.raw
                  );
                }
              });
            }
          }
        });
      },
    };
  
    var attrNoUnnecessaryWhitespace = {
      id: 'attr-no-unnecessary-whitespace',
      description: 'No spaces between attribute names and values.',
      init: function (parser, reporter, options) {
        var self = this;
        var exceptions = Array.isArray(options) ? options : [];
  
        parser.addListener('tagstart', function (event) {
          var attrs = event.attrs;
          var col = event.col + event.tagName.length + 1;
  
          for (var i = 0; i < attrs.length; i++) {
            if (
              exceptions.indexOf(attrs[i].name) === -1 &&
              /[^=](\s+=\s+|=\s+|\s+=)/g.test(attrs[i].raw.trim())
            ) {
              reporter.error(
                "The attribute '" +
                  attrs[i].name +
                  "' must not have spaces between the name and value.",
                event.line,
                col + attrs[i].index,
                self,
                attrs[i].raw
              );
            }
          }
        });
      },
    };
  
    var HTMLRules = /*#__PURE__*/Object.freeze({
      __proto__: null,
      altRequire: altRequire,
      attrLowercase: attrLowercase,
      attrSort: attrSorted,
      attrNoDuplication: attrNoDuplication,
      attrUnsafeChars: attrUnsafeChars,
      attrValueDoubleQuotes: attrValueDoubleQuotes,
      attrValueNotEmpty: attrValueNotEmpty,
      attrValueSingleQuotes: attrValueSingleQuotes,
      attrWhitespace: attrWhitespace,
      doctypeFirst: doctypeFirst,
      doctypeHTML5: doctypeHtml5,
      headScriptDisabled: headScriptDisabled,
      hrefAbsOrRel: hrefAbsOrRel,
      idClsasAdDisabled: idClassAdDisabled,
      idClassValue: idClassValue,
      idUnique: idUnique,
      inlineScriptDisabled: inlineScriptDisabled,
      inlineStyleDisabled: inlineStyleDisabled,
      inputRequiresLabel: inputRequiresLabel,
      scriptDisabled: scriptDisabled,
      spaceTabMixedDisabled: spaceTabMixedDisabled,
      specCharEscape: specCharEscape,
      srcNotEmpty: srcNotEmpty,
      styleDisabled: styleDisabled,
      tagPair: tagPair,
      tagSelfClose: tagSelfClose,
      tagnameLowercase: tagnameLowercase,
      tagnameSpecialChars: tagnameSpecialchars,
      titleRequire: titleRequire,
      tagsCheck: tagsCheck,
      attrNoUnnecessaryWhitespace: attrNoUnnecessaryWhitespace
    });
  
    class HTMLHintCore {
      constructor() {
        this.rules = {};
        this.defaultRuleset = {
          'tagname-lowercase': true,
          'attr-lowercase': true,
          'attr-value-double-quotes': true,
          'doctype-first': true,
          'tag-pair': true,
          'spec-char-escape': true,
          'id-unique': true,
          'src-not-empty': true,
          'attr-no-duplication': true,
          'title-require': true,
        };
      }
  
      addRule(rule) {
        this.rules[rule.id] = rule;
      }
  
      verify(html, ruleset) {
        if (ruleset === undefined || Object.keys(ruleset).length === 0) {
          ruleset = this.defaultRuleset;
        }
  
        // parse inline ruleset
        html = html.replace(/^\s*<!--\s*htmlhint\s+([^\r\n]+?)\s*-->/i, function (
          all,
          strRuleset
        ) {
          if (ruleset === undefined) {
            ruleset = {};
          }
  
          // eslint-disable-next-line
          strRuleset.replace(/(?:^|,)\s*([^:,]+)\s*(?:\:\s*([^,\s]+))?/g, function (
            all,
            key,
            value
          ) {
            if (value === 'false') {
              value = false;
            } else if (value === 'true') {
              value = true;
            }
            ruleset[key] = value === undefined ? true : value;
          });
  
          return ''
        });
  
        var parser = new HTMLParser();
        var reporter = new Reporter(html, ruleset);
  
        var rules = this.rules;
        var rule;
  
        for (var id in ruleset) {
          rule = rules[id];
          if (rule !== undefined && ruleset[id] !== false) {
            rule.init(parser, reporter, ruleset[id]);
          }
        }
  
        parser.parse(html);
  
        return reporter.messages
      }
  
      format(arrMessages, options) {
        options = options || {};
        var arrLogs = [];
        var colors = {
          white: '',
          grey: '',
          red: '',
          reset: '',
        };
  
        if (options.colors) {
          colors.white = '\x1b[37m';
          colors.grey = '\x1b[90m';
          colors.red = '\x1b[31m';
          colors.reset = '\x1b[39m';
        }
  
        var indent = options.indent || 0;
  
        arrMessages.forEach((hint) => {
          var leftWindow = 40;
          var rightWindow = leftWindow + 20;
          var evidence = hint.evidence;
          var line = hint.line;
          var col = hint.col;
          var evidenceCount = evidence.length;
          var leftCol = col > leftWindow + 1 ? col - leftWindow : 1;
          var rightCol =
            evidence.length > col + rightWindow ? col + rightWindow : evidenceCount;
  
          if (col < leftWindow + 1) {
            rightCol += leftWindow - col + 1;
          }
  
          evidence = evidence.replace(/\t/g, ' ').substring(leftCol - 1, rightCol);
  
          // add ...
          if (leftCol > 1) {
            evidence = '...' + evidence;
            leftCol -= 3;
          }
          if (rightCol < evidenceCount) {
            evidence += '...';
          }
  
          // show evidence
          arrLogs.push(
            colors.white +
              repeatStr(indent) +
              'L' +
              line +
              ' |' +
              colors.grey +
              evidence +
              colors.reset
          );
  
          // show pointer & message
          var pointCol = col - leftCol;
          // add double byte character
          //eslint-disable-next-line
          var match = evidence.substring(0, pointCol).match(/[^\u0000-\u00ff]/g);
          if (match !== null) {
            pointCol += match.length;
          }
  
          arrLogs.push(
            colors.white +
              repeatStr(indent) +
              repeatStr(String(line).length + 3 + pointCol) +
              '^ ' +
              colors.red +
              hint.message +
              ' (' +
              hint.rule.id +
              ')' +
              colors.reset
          );
        });
  
        return arrLogs
      }
    }
  
    // repeat string
    function repeatStr(n, str) {
      return new Array(n + 1).join(str || ' ')
    }
  
    const HTMLHint = new HTMLHintCore();
  
    Object.keys(HTMLRules).forEach((key) => {
      HTMLHint.addRule(HTMLRules[key]);
    });
  
    exports.HTMLHint = HTMLHint;
    exports.HTMLParser = HTMLParser;
    exports.HTMLRules = HTMLRules;
    exports.Reporter = Reporter;
  
    Object.defineProperty(exports, '__esModule', { value: true });
  
  })));