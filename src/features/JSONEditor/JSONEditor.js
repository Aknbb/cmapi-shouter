import React, {Component} from 'react';

import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import EditorUtils from './EditorUtils';

export default class JSONEditorComponent extends Component {
    constructor(props) {
        super(props);
        const {readOnly} = this.props;
        this.pointerEvents = readOnly ? 'none' : 'auto';
        this.updateHighlight = () => {
            if (this.props.searchText) {
                this.jsoneditor.aceEditor.findAll(this.props.searchText, {});
            }
            const lines = this.jsoneditor.aceEditor.selection.doc.$lines;
            const reversedKeywordRanges = EditorUtils.getReversedWordRanges(lines);
            reversedKeywordRanges.forEach(range => {
                for (let columnIndex = range[1]; columnIndex <= range[2]; columnIndex++) {
                    this.jsoneditor.aceEditor.multiSelect.substractPoint({row: range[0], column: columnIndex});
                }
            });
        };

        this.focusToRange = (range) => {
            this.jsoneditor.aceEditor.scrollToLine(range.start.row, true, false, function () {
            });
        };

    }

    componentDidMount() {
        EditorUtils.injectTheme();
        const readOnly = this.props.readOnly;
        const onEditable = readOnly ? () => false : undefined;
        const mainMenuBar = !readOnly;
        const statusBar = !readOnly;
        const options = {
            mode: 'code',
            onEditable,
            mainMenuBar,
            statusBar,
        };
        this.jsoneditor = new JSONEditor(this.container, options);
        if (readOnly) {
            this.jsoneditor.aceEditor.setTheme('ace/theme/aknbb');
            this.jsoneditor.aceEditor.setOptions({
                minLines: 20,
                maxLines: 20,
                highlightActiveLine: false,
                highlightGutterLine: false,
            });
            this.jsoneditor._setText(EditorUtils.emptyText, false);
            this.jsoneditor._onChange();
            this.jsoneditor.aceEditor.container.getElementsByClassName('ace_scroller')[0].style.pointerEvents = 'none';
            this.jsoneditor.aceEditor.renderer.$cursorLayer.element.style.display = 'none';
        } else {
            EditorUtils.init(this.jsoneditor);
        }
        if (this.props.text) {
            this.jsoneditor._setText(this.props.text, true);
            this.jsoneditor._onChange();
        }
        this.updateHighlight();
        if (this.props.focusRange) {
            this.focusToRange(this.props.focusRange);
        }
    }

    componentWillUnmount() {
        if (this.jsoneditor) {
            this.jsoneditor.destroy();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.text !== this.props.text) {
            this.jsoneditor._setText(this.props.text, true);
            this.jsoneditor._onChange();
        }
        this.updateHighlight();
        if (this.props.focusRange) {
            this.focusToRange(this.props.focusRange);
        }
    }

    render() {
        return (
            <div style={{marginTop: 10}} ref={elem => this.container = elem}/>
        );
    }
}
