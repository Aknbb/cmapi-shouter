/* eslint-disable */
const EditorUtils = {
    editor: undefined,
    reservedKeywords: [
        '"channel"',
        '"title"',
        '"labels"',
        '"message"',
    ],
};

EditorUtils.init = editor => {
    EditorUtils.editor = editor;
    EditorUtils.setLineHeightOptions();
    EditorUtils.removeMenuButtons();
    EditorUtils.mutateButtonTooltips();
    EditorUtils.changeFormatButtonFunction();
    EditorUtils.addClearButton();
    EditorUtils.addSearchButton();
    EditorUtils.addReplaceButton();
    EditorUtils.overrideShortcuts();
    EditorUtils.setTheme();
    EditorUtils.resetText();
};
const removeElementList = [
    'jsoneditor-compact',
    'jsoneditor-sort',
    'jsoneditor-transform',
    'jsoneditor-poweredBy',
];
const tooltipList = {
    'jsoneditor-format': 'Format (Ctrl-Alt-L)',
    'jsoneditor-repair': 'Repair (Ctrl-Alt-K)',
    'jsoneditor-undo': 'Undo (Ctrl-Z)',
};

EditorUtils.emptyText = `{
  
}`;

EditorUtils.removeMenuButtons = () => {
    const menu = EditorUtils.editor.menu;
    removeElementList.forEach(elementClassName => {
        const domNode = document.getElementsByClassName(elementClassName);
        if (domNode.length === 1) {
            menu.removeChild(domNode[0]);
        }
    });
};

EditorUtils.changeFormatButtonFunction = () => {
    const repairButton = document.getElementsByClassName('jsoneditor-format')[0];
    repairButton.onclick = () => {
        try {
            EditorUtils.editor.repair();
            EditorUtils.editor.format();
            EditorUtils.editor._onChange();
        } catch (err) {
            console.log(err);
        }
    };
};

EditorUtils.mutateButtonTooltips = () => {
    Object.keys(tooltipList).forEach(elementClassName => {
        const domNode = document.getElementsByClassName(elementClassName);
        if (domNode.length === 1) {
            domNode[0].title = tooltipList[elementClassName];
        }
    });

};

EditorUtils.addClearButton = () => {
    const buttonClear = document.createElement('button');
    buttonClear.type = 'button';
    buttonClear.className = 'jsoneditor-clear';
    buttonClear.title = 'Clear (Alt-C)';
    const menu = document.getElementsByClassName('jsoneditor-menu')[0];
    menu.insertBefore(buttonClear, menu.childNodes[2]);
    buttonClear.onclick = () => {
        try {
            EditorUtils.resetText();
        } catch (err) {
            console.log(err);
        }
    };
};

EditorUtils.addSearchButton = () => {
    const buttonSearch = document.createElement('button');
    buttonSearch.type = 'button';
    buttonSearch.className = 'jsoneditor-search';
    buttonSearch.title = 'Search (Ctrl-F)';
    const menu = document.getElementsByClassName('jsoneditor-menu')[0];
    menu.insertBefore(buttonSearch, menu.childNodes[2]);
    buttonSearch.onclick = () => {
        EditorUtils.editor.aceEditor.execCommand('find');
    };
};

EditorUtils.addReplaceButton = () => {
    const buttonSearch = document.createElement('button');
    buttonSearch.type = 'button';
    buttonSearch.className = 'jsoneditor-replace';
    buttonSearch.title = 'Replace (Alt-R)';
    const menu = document.getElementsByClassName('jsoneditor-menu')[0];
    menu.insertBefore(buttonSearch, menu.childNodes[3]);
    buttonSearch.onclick = () => {
        EditorUtils.editor.aceEditor.execCommand('replace');
    };
};

EditorUtils.overrideShortcuts = () => {
    const commands = EditorUtils.editor.aceEditor.commands;
    const commandList = commands.byName;
    commands.addCommand({
        name: 'format',
        bindKey: {win: 'Ctrl-Alt-L', mac: 'Command-Option-L'},
        exec: function () {
            try {
                EditorUtils.editor.repair();
                EditorUtils.editor.format();
                EditorUtils.editor._onChange();
            } catch (err) {
                console.log(err);
            }
        },
        readOnly: true,
    });
    commands.addCommand({
        name: 'repair',
        bindKey: {win: 'Ctrl-Alt-K', mac: 'Command-Option-K'},
        exec: function () {
            try {
                EditorUtils.editor.repair();
                EditorUtils.editor._onChange();
            } catch (err) {
                console.log(err);
            }
        },
        readOnly: true,
    });
    commandList.find.bindKey = {win: 'Ctrl-F', mac: 'Command-F'};
    commands.addCommand(commandList.find);
    commandList.replace.bindKey = {win: 'Alt-R', mac: 'Option-R'};
    commands.addCommand(commandList.replace);
    commands.addCommand({
        name: 'clear',
        bindKey: {win: 'Alt-C', mac: 'Option-C'},
        exec: function () {
            try {
                EditorUtils.resetText();
            } catch (err) {
                console.log(err);
            }
        },
        readOnly: true,
    });
};

EditorUtils.setTextAsJson = (json) => {
    EditorUtils.editor.set(json);
};

EditorUtils.resetText = () => {
    EditorUtils.editor._setText(EditorUtils.emptyText, false);
    EditorUtils.editor._onChange();
};

EditorUtils.setText = (text) => {
    EditorUtils.editor._setText(text, true);
    EditorUtils.editor._onChange();
};

EditorUtils.getMessageAsJson = () => {
    try {
        return EditorUtils.editor.get();
    } catch (e) {
        return {};
    }

};

EditorUtils.setTheme = () => {
    EditorUtils.editor.aceEditor.setTheme('ace/theme/aknbb');
};

EditorUtils.setLineHeightOptions = () => {
    EditorUtils.editor.aceEditor.setOptions({minLines: 40, maxLines: 40});
};

EditorUtils.getReversedWordRanges = (lines) => {
    let lastFindIndex = 0;
    const ranges = [];
    EditorUtils.reservedKeywords.forEach(keyword => {
        for (let lineIndex = lastFindIndex; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (line.indexOf(keyword) > -1) {
                ranges.push([lineIndex, line.indexOf(keyword), line.indexOf(keyword) + keyword.length]);
                lastFindIndex = lineIndex;
                break;
            }
        }
    });
    return ranges;
};

EditorUtils.injectTheme = () => {
    window.ace.define('ace/theme/aknbb', ['require', 'exports', 'module', 'ace/lib/dom'], (acequire, exports) => {
        exports.isDark = true;
        exports.cssClass = 'ace-gruvbox';
        exports.cssText = '.ace-gruvbox .ace_gutter-active-line {\
background-color: #3C3836;\
}\
.ace-gruvbox {\
color: #EBDAB4;\
background-color: #303030;\
}\
.ace-gruvbox .ace_invisible {\
color: #504945;\
}\
.ace-gruvbox .ace_marker-layer .ace_selection {\
background: rgba(179, 101, 57, 0.75)\
}.ace-gruvbox .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #999999\
\
}\
.ace-gruvbox.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #002240;\
}\
.ace-gruvbox .ace_keyword {\
color: #8ec07c;\
}\
.ace-gruvbox .ace_comment {\
font-style: italic;\
color: #928375;\
}\
.ace-gruvbox .ace-statement {\
color: red;\
}\
.ace-gruvbox .ace_variable {\
color: #84A598;\
}\
.ace-gruvbox .ace_variable.ace_language {\
color: #D2879B;\
}\
.ace-gruvbox .ace_constant {\
color: #C2859A;\
}\
.ace-gruvbox .ace_constant.ace_language {\
color: #C2859A;\
}\
.ace-gruvbox .ace_constant.ace_numeric {\
color: #C2859A;\
}\
.ace-gruvbox .ace_string {\
color: #B8BA37;\
}\
.ace-gruvbox .ace_support {\
color: #F9BC41;\
}\
.ace-gruvbox .ace_support.ace_function {\
color: #F84B3C;\
}\
.ace-gruvbox .ace_storage {\
color: #8FBF7F;\
}\
.ace-gruvbox .ace_keyword.ace_operator {\
color: #EBDAB4;\
}\
.ace-gruvbox .ace_punctuation.ace_operator {\
color: yellow;\
}\
.ace-gruvbox .ace_marker-layer .ace_active-line {\
background: #3C3836;\
}\
.ace-gruvbox .ace_marker-layer .ace_selected-word {\
border-radius: 4px;\
border: 8px solid #3f475d;\
}\
.ace-gruvbox .ace_print-margin {\
width: 5px;\
background: #3C3836;\
}\
.ace-gruvbox .ace_indent-guide {\
background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNQUFD4z6Crq/sfAAuYAuYl+7lfAAAAAElFTkSuQmCC") right repeat-y;\
}';

        const dom = acequire('../lib/dom');
        dom.importCssString(exports.cssText, exports.cssClass);
    });
};

export default EditorUtils;
