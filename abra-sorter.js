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
    "border-top-color",
    "border-top-style",
    "border-top-width",
    "border-right-color",
    "border-right-style",
    "border-right-width",
    "border-bottom-color",
    "border-bottom-style",
    "border-bottom-width",
    "border-left-color",
    "border-left-style",
    "border-left-width",
    "border-image-source",
    "border-image-slice",
    "border-image-width",
    "border-image-outset",
    "border-image-repeat",
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

function jsonToCss(json) {
    var css = "";

    for (var objCSS of json.css) {
        css += "\n" + objCSS.selector.trim() + " {\n";
        for (var property of objCSS.properties) {
            css += "    " + property.property + ": " + property.value + ";\n";
        }
        css += "}\n";
    }

    return css;
}

function compareProperties(a, b) {
    var indexA = order.indexOf(a.property);
    var indexB = order.indexOf(b.property);
    if (indexA < indexB) {
        return -1;
    } else if (indexA > indexB) {
        return 1;
    } else {
        return 0;
    }

    return indexA > indexB;
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

function sortProperties(properties) {
    properties = removeDuplicate(properties);
    properties = properties.sort(compareProperties);
//    properties = shortHandCSS(properties);
    return properties;
}

function matchProperty(property) {
    return this == property.property;
}

function shortHandCSS(properties) {
    for (var shortHand of shortHands) {
        var cnt = 0;
        for (var i = 0; i < properties.length; i++) {
            if (shortHand.indexOf(properties[i].property) != -1) {
                cnt++;
            }
        }
        if (cnt == 4) {
            var value = "",
                index;
            for (var i = 1; i < shortHand.length; i++) {
                index = properties.findIndex(matchProperty, shortHand[i]);
                value += " " + properties[index].value;
            }
            var property = {
                "property": shortHand[0],
                "value": value.trim()
            }
            properties.splice(index - 3, 4, property);

        } else if (cnt == 2) {
            var value = "",
                index;
            var all = properties.findIndex(matchProperty, shortHand[0]),
                top = properties.findIndex(matchProperty, shortHand[1]),
                right = properties.findIndex(matchProperty, shortHand[2]),
                bottom = properties.findIndex(matchProperty, shortHand[3]),
                left = properties.findIndex(matchProperty, shortHand[4]);

            if (top != -1 && bottom != -1) {
                var topVal = properties[top].value;
                var bottomVal = properties[bottom].value;
                if (topVal == bottomVal) {
                    value = topVal + " 0";
                } else {
                    value = topVal + " 0 " + bottomVal + " 0";
                }
                var property = {
                    "property": shortHand[0],
                    "value": value.trim()
                }
                properties.splice(top, 2, property);
            } else if (right != -1 && left != -1) {
                var rightVal = properties[right].value;
                var leftVal = properties[left].value;
                if (rightVal == leftVal) {
                    value = "0 " + rightVal;
                } else {
                    value = "0 " + rightVal + " 0 " + leftVal;
                }
                var property = {
                    "property": shortHand[0],
                    "value": value.trim()
                }
                properties.splice(right, 2, property);
            } else {
                var topVal = top == -1 ? 0 : properties[top].value;
                var rightVal = right == -1 ? 0 : properties[right].value;
                var bottomVal = bottom == -1 ? 0 : properties[bottom].value;
                var leftVal = left == -1 ? 0 : properties[left].value;
                var value = topVal + " " + rightVal + " " + bottomVal + " " + leftVal;
                var property = {
                    "property": shortHand[0],
                    "value": value.trim()
                }
                var index = -1;
                if (top > -1) {
                    index = top;
                } else if (right > -1) {
                    index = right;
                } else if (bottom > -1) {
                    index = bottom;
                } else {
                    index = left;
                }
                properties.splice(index, 0, property);
                if (left > -1) properties.splice(left + 1, 1);
                if (bottom > -1) properties.splice(bottom + 1, 1);
                if (right > -1) properties.splice(right + 1, 1);
                if (top > -1) properties.splice(top + 1, 1);
            }
        }
    }
    return properties;
}

function cssToJson(cssToSort) {
    var json = {
        "css": []
    };
    if (cssToSort.indexOf("{") == -1 ||
        cssToSort.indexOf("}") == -1 ||
        cssToSort.replace(/[^}]/g, "").length != cssToSort.replace(/[^{]/g, "").length) return null;

    var maxloop = cssToSort.length;
    var loopTimes = 0;
    while (cssToSort.indexOf("}") != -1 && loopTimes < maxloop) {
        loopTimes++;
        if (loopTimes == maxloop) return null;
        var css = cssToSort.substring(0, cssToSort.indexOf("}") + 1),
            jsonCSS = {
                "selector": null,
                "properties": [],
            };


        jsonCSS.selector = css.substring(0, css.indexOf("{"));
        css = css.substring(css.indexOf("{") + 1).trim();

        var innerLoopTimes = 0;
        while (css.indexOf("}") != 0 && innerLoopTimes < maxloop) {
            innerLoopTimes++;
            if (innerLoopTimes == maxloop) return null;
            var property = css.substring(0, css.indexOf(":"));
            css = css.substring(css.indexOf(":") + 1).trim();
            var value = css.substring(0, css.indexOf(";"));
            css = css.substring(css.indexOf(";") + 1).trim();
            jsonCSS.properties.push({
                "property": property,
                "value": value
            });
        }

        cssToSort = cssToSort.substring(cssToSort.indexOf("}") + 1).trim();
        jsonCSS.properties = sortProperties(jsonCSS.properties);
        json.css.push(jsonCSS);
    }
    return json;
}

function sortCSS(cssToSort) {
    var sortedCSS = "";
    cssToSort = cssToSort.trim();
    var cssJson = cssToJson(cssToSort);
    if (cssJson == null) return null;
    sortedCSS = jsonToCss(cssJson);
    return sortedCSS;
}
