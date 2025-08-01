// Cotton Candy Editor - Embeddable Version
import { EditorView, lineNumbers, tooltips, highlightActiveLine, drawSelection, dropCursor, rectangularSelection, crosshairCursor, keymap } from "@codemirror/view";
import { EditorState, StateEffect } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { rust } from "@codemirror/lang-rust";
import { php } from "@codemirror/lang-php";
import { xml } from "@codemirror/lang-xml";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { materialDark } from "@uiw/codemirror-theme-material";
import { nord } from "@uiw/codemirror-theme-nord";
import { solarizedDark } from "@uiw/codemirror-theme-solarized";
import { HighlightStyle, indentUnit, syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching, foldGutter } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { history, indentWithTab } from "@codemirror/commands";
import { linter } from "@codemirror/lint";
import { highlightSelectionMatches, search } from "@codemirror/search";

// Cotton Candy Theme Definition
const cottonCandyTheme = EditorView.theme({
    "&": { color: "#4a4a4a", backgroundColor: "#fff0f5" },
    ".cm-content": { padding: "10px", caretColor: "#d63384" },
    ".cm-focused": { outline: "none" },
    ".cm-editor": { fontSize: "14px" },
    ".cm-scroller": { fontFamily: "'Cascadia Code', 'Fira Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace" },
    ".cm-gutters": { backgroundColor: "#f8d7da", color: "#d63384", border: "none" },
    ".cm-lineNumbers": { color: "#d63384" },
    ".cm-activeLineGutter": { backgroundColor: "#f1c0c7" },
    ".cm-activeLine": { backgroundColor: "#fce4ec" },
    ".cm-selectionMatch": { backgroundColor: "#f8bbd9" },
    ".cm-searchMatch": { backgroundColor: "#ffc0cb", outline: "1px solid #ff69b4" },
    ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#ff1493" },
    ".cm-cursor": { borderLeftColor: "#d63384" },
    ".cm-tooltip": { backgroundColor: "#f8d7da", border: "1px solid #d63384" }
}, { dark: false });

const cottonCandyHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: "#d63384", fontWeight: "bold" },
    { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "#6f42c1" },
    { tag: [t.function(t.variableName), t.labelName], color: "#20c997" },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#fd7e14" },
    { tag: [t.definition(t.name), t.separator], color: "#495057" },
    { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "#6610f2" },
    { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#e83e8c" },
    { tag: [t.meta, t.comment], color: "#6c757d", fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.link, color: "#0d6efd", textDecoration: "underline" },
    { tag: t.heading, fontWeight: "bold", color: "#d63384" },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#20c997" },
    { tag: [t.processingInstruction, t.string, t.inserted], color: "#198754" },
    { tag: t.invalid, color: "#dc3545" }
]);

const cottonCandy = [cottonCandyTheme, syntaxHighlighting(cottonCandyHighlightStyle)];

// Language mappings
const languages = {
    javascript: javascript(),
    python: python(),
    html: html(),
    css: css(),
    java: java(),
    cpp: cpp(),
    markdown: markdown(),
    json: json(),
    sql: sql(),
    rust: rust(),
    php: php(),
    xml: xml()
};

// Theme mappings
const themes = {
    light: [],
    'cotton-candy': cottonCandy,
    dracula: dracula,
    'material-dark': materialDark,
    nord: nord,
    'solarized-dark': solarizedDark
};

// Main CottonCandyEditor class
class CottonCandyEditor {
    constructor(options = {}) {
        this.options = {
            parent: options.parent || document.body,
            theme: options.theme || 'light',
            language: options.language || 'javascript',
            value: options.value || '',
            readOnly: options.readOnly || false,
            showLineNumbers: options.showLineNumbers !== false,
            tabSize: options.tabSize || 4,
            wordWrap: options.wordWrap || false,
            ...options
        };

        this.callbacks = {};
        this.init();
    }

    init() {
        const extensions = this.getExtensions();
        
        this.state = EditorState.create({
            doc: this.options.value,
            extensions
        });

        this.view = new EditorView({
            state: this.state,
            parent: this.options.parent
        });

        // Apply theme styling to parent
        this.applyThemeClass();
    }

    getExtensions() {
        const extensions = [
            history(),
            foldGutter(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            search(),
            tooltips(),
            keymap.of([indentWithTab]),
            languages[this.options.language] || languages.javascript,
            EditorState.tabSize.of(this.options.tabSize),
            indentUnit.of(" ".repeat(this.options.tabSize)),
            themes[this.options.theme] || themes.light,
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.emit('change', this.getValue());
                }
            })
        ];

        if (this.options.showLineNumbers) {
            extensions.push(lineNumbers());
        }

        if (this.options.readOnly) {
            extensions.push(EditorState.readOnly.of(true));
        }

        return extensions;
    }

    applyThemeClass() {
        const parent = this.options.parent;
        if (parent && parent.classList) {
            // Remove existing theme classes
            parent.classList.remove('cotton-candy-light', 'cotton-candy-dark', 'cotton-candy-cotton-candy');
            
            // Add new theme class
            if (this.options.theme === 'cotton-candy') {
                parent.classList.add('cotton-candy-cotton-candy');
            } else if (['dracula', 'material-dark', 'nord', 'solarized-dark'].includes(this.options.theme)) {
                parent.classList.add('cotton-candy-dark');
            } else {
                parent.classList.add('cotton-candy-light');
            }
        }
    }

    // Public API methods
    getValue() {
        return this.view.state.doc.toString();
    }

    setValue(value) {
        this.view.dispatch({
            changes: { from: 0, to: this.view.state.doc.length, insert: value }
        });
        this.emit('change', value);
    }

    setTheme(theme) {
        if (themes[theme] !== undefined) {
            this.options.theme = theme;
            this.view.dispatch({
                effects: StateEffect.reconfigure.of(this.getExtensions())
            });
            this.applyThemeClass();
            this.emit('themeChange', theme);
        }
    }

    setLanguage(language) {
        if (languages[language]) {
            this.options.language = language;
            this.view.dispatch({
                effects: StateEffect.reconfigure.of(this.getExtensions())
            });
            this.emit('languageChange', language);
        }
    }

    getLanguage() {
        return this.options.language;
    }

    focus() {
        this.view.focus();
    }

    destroy() {
        this.view.destroy();
        const parent = this.options.parent;
        if (parent && parent.classList) {
            parent.classList.remove('cotton-candy-light', 'cotton-candy-dark', 'cotton-candy-cotton-candy');
        }
    }

    // Event system
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }
}

// Export for browser usage
if (typeof window !== 'undefined') {
    window.CottonCandyEditor = CottonCandyEditor;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CottonCandyEditor;
}

export default CottonCandyEditor;
