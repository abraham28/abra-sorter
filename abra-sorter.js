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
