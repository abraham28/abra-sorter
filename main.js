/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4 */
/*global define, $, brackets, window */


define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),

        EditorManager = brackets.getModule("editor/EditorManager"),
        Editor = brackets.getModule("editor/Editor").Editor,

        DocumentManager = brackets.getModule("document/DocumentManager"),
        COMMAND_ID = "abra-sorter.sortcss",

        start,
        end,
        isSelection = false;
    require("abra-sorter");

    function replaceCSS(css) {
        var editor = EditorManager.getCurrentFullEditor(),
            doc = DocumentManager.getCurrentDocument(),
            cursor = editor.getCursorPos(),
            scroll = editor.getScrollPos();

        doc.batchOperation(function () {
            if (isSelection) {
                doc.replaceRange(css, start, end);
            } else {
                doc.setText(css);
            }
            editor.setCursorPos(cursor);
            editor.setScrollPos(scroll.x, scroll.y);
        });
        console.log('abra has sorted your css');
    }

    function abraSort() {
        var editor = EditorManager.getCurrentFullEditor(),
            selectedText = editor.getSelectedText(),
            selection = editor.getSelection(),
            cssToSort,
            sortedCSS;

        start = selection.start;
        end = selection.end;

        if (selectedText.length > 0 && selectedText.trim() != "") {
            isSelection = true;
            cssToSort = selectedText.trim();
            sortedCSS = sortCSS(cssToSort);
            if (sortedCSS != null) replaceCSS(sortedCSS)
            else console.log("abra said you might have a syntax error that's why sorting failed.");
        } else {
            console.log("abra wants you to select something to sort.");
            //            cssToSort = DocumentManager.getCurrentDocument().getText().trim();
        }
    }

    CommandManager.register("let abra sort your css", COMMAND_ID, abraSort);
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(COMMAND_ID, [{
            key: "Ctrl-Alt-Shift-c",
            platform: "win"
    },
        {
            key: "Ctrl-Alt-Shift-c",
            platform: "mac"
                                  }]);
});
