/**
 * CSS-JSON Converter for JavaScript
 * Converts CSS to JSON and back.
 * Version 2.1
 *
 * Released under the MIT license.
 *
 * Copyright (c) 2013 Aram Kocharyan, http://aramk.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions
 of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

var CSSJSON = new function () {

    var base = this;

    base.init = function () {
        // String functions
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };

        String.prototype.repeat = function (n) {
            return new Array(1 + n).join(this);
        };
    };
    base.init();

    var selX = /([^\s\;\{\}][^\;\{\}]*)\{/g;
    var endX = /\}/g;
    var lineX = /([^\;\{\}]*)\;/g;
    var commentX = /\/\*[\s\S]*?\*\//g;
    var lineAttrX = /([^\:]+):([^\;]*);/;

    // This is used, a concatenation of all above. We use alternation to
    // capture.
    var altX = /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+\;(?!\s*\*\/))/gmi;

    // Capture groups
    var capComment = 1;
    var capSelector = 2;
    var capEnd = 3;
    var capAttr = 4;

    var isEmpty = function (x) {
        return typeof x == 'undefined' || x.length == 0 || x == null;
    };

    var isCssJson = function (node) {
        return !isEmpty(node) ? (node.attributes && node.children) : false;
    }

    /**
     * Input is css string and current pos, returns JSON object
     *
     * @param cssString
     *            The CSS string.
     * @param args
     *            An optional argument object. ordered: Whether order of
     *            comments and other nodes should be kept in the output. This
     *            will return an object where all the keys are numbers and the
     *            values are objects containing "name" and "value" keys for each
     *            node. comments: Whether to capture comments. split: Whether to
     *            split each comma separated list of selectors.
     */
    base.toJSON = function (cssString, args) {
        var node = {
            children: {},
            attributes: {}
        };
        var match = null;
        var count = 0;

        if (typeof args == 'undefined') {
            var args = {
                ordered: false,
                comments: false,
                stripComments: false,
                split: false
            };
        }
        if (args.stripComments) {
            args.comments = false;
            cssString = cssString.replace(commentX, '');
        }

        while ((match = altX.exec(cssString)) != null) {
            if (!isEmpty(match[capComment]) && args.comments) {
                // Comment
                var add = match[capComment].trim();
                node[count++] = add;
            } else if (!isEmpty(match[capSelector])) {
                // New node, we recurse
                var name = match[capSelector].trim();
                // This will return when we encounter a closing brace
                var newNode = base.toJSON(cssString, args);
                if (args.ordered) {
                    var obj = {};
                    obj['name'] = name;
                    obj['value'] = newNode;
                    // Since we must use key as index to keep order and not
                    // name, this will differentiate between a Rule Node and an
                    // Attribute, since both contain a name and value pair.
                    obj['type'] = 'rule';
                    node[count++] = obj;
                } else {
                    if (args.split) {
                        var bits = name.split(',');
                    } else {
                        var bits = [name];
                    }
                    for (i in bits) {
                        var sel = bits[i].trim();
                        if (sel in node.children) {
                            for (var att in newNode.attributes) {
                                node.children[sel].attributes[att] = newNode.attributes[att];
                            }
                        } else {
                            node.children[sel] = newNode;
                        }
                    }
                }
            } else if (!isEmpty(match[capEnd])) {
                // Node has finished
                return node;
            } else if (!isEmpty(match[capAttr])) {
                var line = match[capAttr].trim();
                var attr = lineAttrX.exec(line);
                if (attr) {
                    // Attribute
                    var name = attr[1].trim();
                    var value = attr[2].trim();
                    if (args.ordered) {
                        var obj = {};
                        obj['name'] = name;
                        obj['value'] = value;
                        obj['type'] = 'attr';
                        node[count++] = obj;
                    } else {
                        if (name in node.attributes) {
                            var currVal = node.attributes[name];
                            if (!(currVal instanceof Array)) {
                                node.attributes[name] = [currVal];
                            }
                            node.attributes[name].push(value);
                        } else {
                            node.attributes[name] = value;
                        }
                    }
                } else {
                    // Semicolon terminated line
                    node[count++] = line;
                }
            }
        }

        return node;
    };

    /**
     * @param node
     *            A JSON node.
     * @param depth
     *            The depth of the current node; used for indentation and
     *            optional.
     * @param breaks
     *            Whether to add line breaks in the output.
     */
    base.toCSS = function (node, depth, breaks) {
        var cssString = '';
        if (typeof depth == 'undefined') {
            depth = 0;
        }
        if (typeof breaks == 'undefined') {
            breaks = false;
        }
        if (node.attributes) {
            for (i in node.attributes) {
                var att = node.attributes[i];
                if (att instanceof Array) {
                    for (var j = 0; j < att.length; j++) {
                        cssString += strAttr(i, att[j], depth);
                    }
                } else {
                    cssString += strAttr(i, att, depth);
                }
            }
        }
        if (node.children) {
            var first = true;
            for (i in node.children) {
                if (breaks && !first) {
                    cssString += '\n';
                } else {
                    first = false;
                }
                cssString += strNode(i, node.children[i], depth);
            }
        }
        return cssString;
    };

    /**
     * @param data
     *            You can pass css string or the CSSJS.toJSON return value.
     * @param id (Optional)
     *            To identify and easy removable of the style element
     * @param replace (Optional. defaults to TRUE)
     *            Whether to remove or simply do nothing
     * @return HTMLLinkElement
     */
    base.toHEAD = function (data, id, replace) {
        var head = document.getElementsByTagName('head')[0];
        var xnode = document.getElementById(id);
        var _xnodeTest = (xnode !== null && xnode instanceof HTMLStyleElement);

        if (isEmpty(data) || !(head instanceof HTMLHeadElement)) return;
        if (_xnodeTest) {
            if (replace === true || isEmpty(replace)) {
                xnode.removeAttribute('id');
            } else return;
        }
        if (isCssJson(data)) {
            data = base.toCSS(data);
        }

        var node = document.createElement('style');
        node.type = 'text/css';

        if (!isEmpty(id)) {
            node.id = id;
        } else {
            node.id = 'cssjson_' + timestamp();
        }
        if (node.styleSheet) {
            node.styleSheet.cssText = data;
        } else {
            node.appendChild(document.createTextNode(data));
        }

        head.appendChild(node);

        if (isValidStyleNode(node)) {
            if (_xnodeTest) {
                xnode.parentNode.removeChild(xnode);
            }
        } else {
            node.parentNode.removeChild(node);
            if (_xnodeTest) {
                xnode.setAttribute('id', id);
                node = xnode;
            } else return;
        }

        return node;
    };

    // Alias

    if (typeof window != 'undefined') {
        window.createCSS = base.toHEAD;
    }

    // Helpers

    var isValidStyleNode = function (node) {
        return (node instanceof HTMLStyleElement) && node.sheet.cssRules.length > 0;
    }

    var timestamp = function () {
        return Date.now() || +new Date();
    };

    var strAttr = function (name, value, depth) {
        return '\t'.repeat(depth) + name + ': ' + value + ';\n';
    };

    var strNode = function (name, value, depth) {
        var cssString = '\t'.repeat(depth) + name + ' {\n';
        cssString += base.toCSS(value, depth + 1);
        cssString += '\t'.repeat(depth) + '}\n';
        return cssString;
    };

};

var order = [
    "display",
    "float",
    "clear",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "z-index",
    "min-width",
    "max-width",
    "width",
    "min-height",
    "max-height",
    "height",
    "overflow",
    "overflow-wrap",
    "overflow-x",
    "overflow-y",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border",
    "border-top",
    "border-top-color",
    "border-top-style",
    "border-top-width",
    "border-right",
    "border-right-color",
    "border-right-style",
    "border-right-width",
    "border-bottom",
    "border-bottom-color",
    "border-bottom-style",
    "border-bottom-width",
    "border-left",
    "border-left-color",
    "border-left-style",
    "border-left-width",
    "border-image-source",
    "border-image-slice",
    "border-image-width",
    "border-image-outset",
    "border-image-repeat",
    "border-radius",
    "border-collapse",
    "border-spacing",
    "background",
    "background-image",
    "background-position-x",
    "background-position-y",
    "background-size",
    "background-repeat-x",
    "background-repeat-y",
    "background-attachment",
    "background-origin",
    "background-clip",
    "background-color",
    "color",
    "font",
    "font-size",
    "font-style",
    "font-variant-ligatures",
    "font-variant-caps",
    "font-variant-numeric",
    "font-variant-east-asian",
    "font-weight",
    "line-height",
    "font-stretch",
    "font-family",
    "text-align",
    "text-align-last",
    "vertical-align",
    "line-height",
    "white-space",
    "text-indent",
    "text-decoration",
    "letter-spacing",
    "word-break",
    "word-wrap",
    "list-style",
    "ime-mode",
    "content",
    "cursor",
    "zoom",
    "opacity",
    "filter",
    "transform",
];


var shortHands = [
    [
        "margin",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
    ],
    [
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
    ]
];

function compareProperties(a, b) {
    var indexA = order.indexOf(a.property);
    var indexB = order.indexOf(b.property);
    if(indexA == -1) return 1;
    if(indexB == -1) return -1;
    if(indexA > indexB) return 1;
    if(indexA < indexB) return -1;
    return 0;
}

function removeDuplicate(properties) {
    var unique = [];
    properties.forEach(function (property) {
        var index = unique.findIndex(matchProperty, property.property);
        if (index == -1) {
            unique.push(property);
        } else {
            unique.splice(index, 1, property);
        }
    });
    return unique;
}

function matchProperty(property) {
    return this == property.property;
}

function sortProperties(properties) {
    properties = removeDuplicate(properties);
    properties = properties.sort(compareProperties);
//    properties = shortHandCSS(properties);
    return properties;
}

// function shortHandCSS(properties) {
//     for (var shortHand of shortHands) {
//         var cnt = 0;
//         for (var i = 0; i < properties.length; i++) {
//             if (shortHand.indexOf(properties[i].property) != -1) {
//                 cnt++;
//             }
//         }
//         if (cnt == 4) {
//             var value = "",
//                 index;
//             for (var i = 1; i < shortHand.length; i++) {
//                 index = properties.findIndex(matchProperty, shortHand[i]);
//                 value += " " + properties[index].value;
//             }
//             var property = {
//                 "property": shortHand[0],
//                 "value": value.trim()
//             }
//             properties.splice(index - 3, 4, property);

//         } else if (cnt == 2) {
//             var value = "",
//                 index;
//             var all = properties.findIndex(matchProperty, shortHand[0]),
//                 top = properties.findIndex(matchProperty, shortHand[1]),
//                 right = properties.findIndex(matchProperty, shortHand[2]),
//                 bottom = properties.findIndex(matchProperty, shortHand[3]),
//                 left = properties.findIndex(matchProperty, shortHand[4]);

//             if (top != -1 && bottom != -1) {
//                 var topVal = properties[top].value;
//                 var bottomVal = properties[bottom].value;
//                 if (topVal == bottomVal) {
//                     value = topVal + " 0";
//                 } else {
//                     value = topVal + " 0 " + bottomVal + " 0";
//                 }
//                 var property = {
//                     "property": shortHand[0],
//                     "value": value.trim()
//                 }
//                 properties.splice(top, 2, property);
//             } else if (right != -1 && left != -1) {
//                 var rightVal = properties[right].value;
//                 var leftVal = properties[left].value;
//                 if (rightVal == leftVal) {
//                     value = "0 " + rightVal;
//                 } else {
//                     value = "0 " + rightVal + " 0 " + leftVal;
//                 }
//                 var property = {
//                     "property": shortHand[0],
//                     "value": value.trim()
//                 }
//                 properties.splice(right, 2, property);
//             } else {
//                 var topVal = top == -1 ? 0 : properties[top].value;
//                 var rightVal = right == -1 ? 0 : properties[right].value;
//                 var bottomVal = bottom == -1 ? 0 : properties[bottom].value;
//                 var leftVal = left == -1 ? 0 : properties[left].value;
//                 var value = topVal + " " + rightVal + " " + bottomVal + " " + leftVal;
//                 var property = {
//                     "property": shortHand[0],
//                     "value": value.trim()
//                 }
//                 var index = -1;
//                 if (top > -1) {
//                     index = top;
//                 } else if (right > -1) {
//                     index = right;
//                 } else if (bottom > -1) {
//                     index = bottom;
//                 } else {
//                     index = left;
//                 }
//                 properties.splice(index, 0, property);
//                 if (left > -1) properties.splice(left + 1, 1);
//                 if (bottom > -1) properties.splice(bottom + 1, 1);
//                 if (right > -1) properties.splice(right + 1, 1);
//                 if (top > -1) properties.splice(top + 1, 1);
//             }
//         }
//     }
//     return properties;
// }

function sortAttributes(attributes) {
    const properties = [];
    for (const property in attributes){
        properties.push({
            "property": property,
            "value": attributes[property]
        })
    }
    const sortedProperties = sortProperties(properties);
    const res = sortedProperties.reduce((a,b)=> (a[b.property]=b.value,a),{});
    return res;
}

function sortJSON(jsonCSS) {
    if(jsonCSS.attributes) {
        jsonCSS.attributes = sortAttributes(jsonCSS.attributes);
    }
    if(jsonCSS.children) {
        for(const selector in jsonCSS.children){
            sortJSON(jsonCSS.children[selector]);
        }
    }
    return jsonCSS;
}

function sortCSS(cssToSort) {
    var jsonCSS = CSSJSON.toJSON(cssToSort);
    var sortedJSON = sortJSON(jsonCSS);
    var sortedCSS = CSSJSON.toCSS(sortedJSON);
    return sortedCSS;
}
