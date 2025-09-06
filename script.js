// Removed basicSetup to avoid version conflicts
// import { basicSetup } from "codemirror";
import {
    EditorView,
    lineNumbers,
    gutter,
    GutterMarker,
    tooltips,
    highlightActiveLine,
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    keymap,
} from "@codemirror/view";
import { EditorState, StateEffect, Compartment } from "@codemirror/state";
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
import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { history, indentWithTab } from "@codemirror/commands";
import {
    indentUnit,
    syntaxHighlighting,
    defaultHighlightStyle,
    indentOnInput,
    bracketMatching,
    foldGutter,
} from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { highlightSelectionMatches, search } from "@codemirror/search";
import { colorPicker } from "@replit/codemirror-css-color-picker";
import { showMinimap } from "@replit/codemirror-minimap";

// Prettier (standalone) and core plugins
import prettier from "prettier/standalone";
import * as prettierPluginBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettierPluginHtml from "prettier/plugins/html";
import * as prettierPluginMarkdown from "prettier/plugins/markdown";
import * as prettierPluginTypescript from "prettier/plugins/typescript";
import * as prettierPluginFlow from "prettier/plugins/flow";
import * as prettierPluginPostcss from "prettier/plugins/postcss"; // css/scss/less
import * as prettierPluginYaml from "prettier/plugins/yaml";
import * as prettierPluginGraphql from "prettier/plugins/graphql";

console.log("script.js is running and initializing CodeMirror...");

// Define UI elements
const languageSelect = document.getElementById("language-select");
const themeSelect = document.getElementById("theme-select");
const fontSizeSelect = document.getElementById("font-size-select");
const fontFamilySelect = document.getElementById("font-family-select");
const saveButton = document.getElementById("save-button");
const formatButton = document.getElementById("format-button");
const copyButton = document.getElementById("copy-button");
const fileNameDisplay = document.getElementById("file-name-display");
const editorParent = document.getElementById("editor");
const header = document.querySelector("h1");

// Compartments for dynamic reconfiguration
const language = new Compartment();
const theme = new Compartment();
const editorTheme = new Compartment();
const linterCompartment = new Compartment();

// Cotton Candy Theme Definition
const cottonCandyTheme = EditorView.theme(
    {
        "&": {
            color: "#4a4a4a",
            backgroundColor: "#fff0f5",
        },
        ".cm-content": {
            padding: "10px",
            caretColor: "#ff1493",
        },
        ".cm-focused": {
            outline: "none",
        },
        ".cm-gutters": {
            backgroundColor: "#f8d7da",
            color: "#ff1493",
            border: "none",
        },
        ".cm-lineNumbers": {
            color: "#ff1493",
        },
        ".cm-activeLineGutter": {
            backgroundColor: "#f1c0c7",
        },
        ".cm-activeLine": {
            backgroundColor: "#fce4ec",
        },
        ".cm-selectionMatch": {
            backgroundColor: "#f8bbd9",
        },
        ".cm-searchMatch": {
            backgroundColor: "#ffc0cb",
            outline: "1px solid #ff69b4",
        },
        ".cm-searchMatch.cm-searchMatch-selected": {
            backgroundColor: "#ff1493",
        },
        ".cm-cursor": {
            borderLeftColor: "#ff1493",
        },
        ".cm-tooltip": {
            backgroundColor: "#f8d7da",
            border: "1px solid #ff1493",
        },
    },
    { dark: false }
);

const cottonCandyHighlightStyle = HighlightStyle.define([
    // Keywords - bright candy pink (extra bold for importance)
    { tag: t.keyword, color: "#ff1493", fontWeight: "900" },
    // Control flow keywords - hot pink (bold for importance)
    {
        tag: [t.controlKeyword, t.moduleKeyword, t.operatorKeyword],
        color: "#ff69b4",
        fontWeight: "bold",
    },
    // Function names - bright cyan (candy terminal style)
    { tag: [t.function(t.variableName), t.labelName], color: "#00bfff", fontWeight: "bold" },
    // Variable names - soft cyan
    { tag: [t.name, t.variableName], color: "#FF80A9", fontWeight: "500" },
    // Properties - bright yellow
    { tag: [t.propertyName], color: "#00A8AA" },
    // Deleted, character, macro names - lavender
    { tag: [t.deleted, t.character, t.macroName], color: "#dda0dd", fontWeight: "500" },
    // Strings - bright green (candy terminal classic)
    { tag: [t.processingInstruction, t.string, t.inserted], color: "#9795EB", fontWeight: "500" },
    // Numbers, constants - bright orange
    {
        tag: [t.color, t.constant(t.name), t.standard(t.name), t.number],
        color: "#32cd32",
        fontWeight: "bold",
    },
    // Types, classes - bright purple (important, so bold)
    {
        tag: [t.typeName, t.className, t.changed, t.annotation, t.modifier, t.self, t.namespace],
        color: "#9370db",
        fontWeight: "bold",
    },
    // Operators
    {
        tag: [t.operator, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
        color: "#00A8AA",
        fontWeight: "600",
    },
    // Comments - muted pink (italic for distinction)
    { tag: [t.meta, t.comment], color: "#ff91a4", fontStyle: "italic", fontWeight: "500" },
    // Boolean values - bright teal (bold for emphasis)
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#008080", fontWeight: "bold" },
    // Definitions, separators - medium gray
    { tag: [t.definition(t.name), t.separator], color: "#696969" },
    // Links - bright blue with underline
    { tag: t.link, color: "#32cd32", textDecoration: "underline", fontWeight: "bold" },
    // Headings - candy pink (bold for hierarchy)
    { tag: t.heading, fontWeight: "bold", color: "#ff1493" },
    // Emphasis and formatting
    { tag: t.strong, fontWeight: "bold", color: "#ff1493" },
    { tag: t.emphasis, fontStyle: "italic", color: "#ff69b4" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    // Invalid syntax - bright warning red (bold to draw attention)
    { tag: t.invalid, color: "#ff0000", fontWeight: "bold", backgroundColor: "#ffeeee" },
]);

const cottonCandy = [cottonCandyTheme, syntaxHighlighting(cottonCandyHighlightStyle)];

// Python-specific keyword override for more diverse highlighting
const pythonKeywordHighlight = HighlightStyle.define([
    // def, class
    { tag: t.definitionKeyword, color: "#9370db", fontWeight: "bold" },
    // if, else, for, while, try, except, finally, with, as
    { tag: t.controlKeyword, color: "#ff69b4", fontWeight: "bold" },
    // self
    { tag: t.self, color: "#9370db", fontWeight: "bold" },
    // True, False, None
    { tag: [t.bool, t.null], color: "#008080", fontWeight: "bold" },
    // import, from, in, and, or, not, is
    { tag: [t.moduleKeyword, t.operatorKeyword], color: "#ff1493", fontWeight: "bold" },
    // General keywords that don't fit above categories
    { tag: t.keyword, color: "#32cd32", fontWeight: "bold" },
]);

// Initial editor content
const initialDoc = `#!/usr/bin/env python3

import sys
from datetime import datetime

class Greeter:
    def __init__(self, name: str):
        self.name = name

    def greet(self) -> str:
        return f"Hello, {self.name}! Today is {datetime.now():%A, %B %d, %Y}."

def main() -> int:
    name = sys.argv[1] if len(sys.argv) > 1 else "World"
    greeter = Greeter(name)
    print(greeter.greet())
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
`;

// Example completion source
const myCompletions = [
    { label: "def", type: "keyword" },
    { label: "class", type: "keyword" },
    { label: "import", type: "keyword" },
    { label: "from", type: "keyword" },
    { label: "return", type: "keyword" },
    { label: "if", type: "keyword" },
    { label: "elif", type: "keyword" },
    { label: "else", type: "keyword" },
    { label: "for", type: "keyword" },
    { label: "while", type: "keyword" },
    { label: "try", type: "keyword" },
    { label: "except", type: "keyword" },
    { label: "finally", type: "keyword" },
    { label: "with", type: "keyword" },
    { label: "as", type: "keyword" },
    { label: "print", type: "function" },
    { label: "len", type: "function" },
    { label: "range", type: "function" },
    { label: "str", type: "function" },
    { label: "int", type: "function" },
    { label: "float", type: "function" },
    { label: "list", type: "function" },
    { label: "dict", type: "function" },
    { label: "tuple", type: "function" },
    { label: "set", type: "function" },
    { label: "True", type: "variable" },
    { label: "False", type: "variable" },
    { label: "None", type: "variable" },
    { label: "self", type: "variable" },
    { label: "__init__", type: "function" },
    { label: "__str__", type: "function" },
    { label: "__repr__", type: "function" },
];

function myCompletionSource(context) {
    let word = context.matchBefore(/\w*/);
    if (!word.text) return null;
    return {
        from: word.from,
        options: myCompletions.filter((completion) => completion.label.startsWith(word.text)),
    };
}

// Custom JavaScript Linter (very basic example)
const javascriptLinter = linter((view) => {
    let diagnostics = [];
    const doc = view.state.doc;

    // Example: Check for missing semicolons at the end of lines (simple regex, not robust)
    for (let i = 0; i < doc.lines; i++) {
        let line = doc.line(i + 1);
        if (
            line.text.length > 0 &&
            !line.text.trim().endsWith(";") &&
            !line.text.trim().endsWith("{ ") &&
            !line.text.trim().endsWith("}") &&
            !line.text.trim().endsWith("(") &&
            !line.text.trim().endsWith(")")
        ) {
            // Avoid flagging empty lines or lines ending with braces/parentheses
            diagnostics.push({
                from: line.from + line.text.trimEnd().length,
                to: line.from + line.text.length,
                severity: "warning",
                message: "Missing semicolon?",
            });
        }
    }

    // Example: Check for 'var' usage (prefer const/let)
    const varRegex = /\bvar\b/g;
    let match;
    while ((match = varRegex.exec(doc.toString())) !== null) {
        diagnostics.push({
            from: match.index,
            to: match.index + match[0].length,
            severity: "info",
            message: "Consider using 'const' or 'let' instead of 'var'.",
        });
    }

    return diagnostics;
});

// Function to create the editor's theme (font size and family)
function createEditorTheme(fontSize, fontFamily) {
    return EditorView.theme({
        ".cm-content": {
            fontSize: fontSize,
        },
        ".cm-scroller": {
            fontFamily: fontFamily,
        },
    });
}

let currentFileName = "untitled.js";

// Functions
function getLanguageExtension() {
    const lang = languageSelect.value;
    switch (lang) {
        case "javascript":
            return javascript();
        case "python":
            return python();
        case "html":
            return html();
        case "css":
            return css();
        case "java":
            return java();
        case "cpp":
            return cpp();
        case "markdown":
            return markdown();
        case "json":
            return json();
        case "sql":
            return sql();
        case "rust":
            return rust();
        case "php":
            return php();
        case "xml":
            return xml();
        default:
            return javascript();
    }
}

function getThemeExtension() {
    const selectedTheme = themeSelect.value;
    switch (selectedTheme) {
        case "dracula":
            return dracula;
        case "material-dark":
            return materialDark;
        case "nord":
            return nord;
        case "solarized-dark":
            return solarizedDark;
        case "cotton-candy":
            return cottonCandy;
        default:
            return []; // Light theme
    }
}

function getFileExtension(language) {
    const extensions = {
        javascript: "js",
        python: "py",
        html: "html",
        css: "css",
        java: "java",
        cpp: "cpp",
        markdown: "md",
        json: "json",
        sql: "sql",
        rust: "rs",
        php: "php",
        xml: "xml",
    };
    return extensions[language] || "txt";
}

function updateFileNameDisplay(filename) {
    console.log("Updating filename display to:", filename);
    currentFileName = filename;
    if (fileNameDisplay) {
        fileNameDisplay.textContent = filename;
    }
    if (header) {
        header.textContent = filename;
    }
}

function getFileNameWithoutExtension(filename) {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) return filename;
    return filename.substring(0, lastDotIndex);
}

function updateFilenameWithLanguage() {
    const currentLanguage = languageSelect.value;
    const currentExtension = getFileExtension(currentLanguage);
    const nameWithoutExt = getFileNameWithoutExtension(currentFileName);
    const newFileName = `${nameWithoutExt}.${currentExtension}`;
    updateFileNameDisplay(newFileName);
}

// Initial editor state
const initialState = EditorState.create({
    doc: initialDoc,
    extensions: [
        lineNumbers(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ override: [myCompletionSource] }),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        search(),
        tooltips(),
        keymap.of([indentWithTab]),
        EditorState.tabSize.of(4),
        indentUnit.of("    "),
        ...colorPicker,
        showMinimap.compute([], (state) => ({
            create: () => {
                const dom = document.createElement("div");
                return { dom };
            },
            displayText: "blocks",
            showOverlay: "always",
        })),
        language.of(getLanguageExtension()),
        theme.of(getThemeExtension()),
        editorTheme.of(createEditorTheme(fontSizeSelect.value, fontFamilySelect.value)),
        linterCompartment.of([]), // Start with no linter
    ],
});

// Create EditorView
let editorView = new EditorView({
    state: initialState,
    parent: editorParent,
});

// Make editorView globally accessible for debugging
window.editorView = editorView;

// Event Listeners
languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    const langExtension = getLanguageExtension();

    editorView.dispatch({
        effects: language.reconfigure(langExtension),
    });

    // Add or remove linter based on language
    if (lang === "javascript") {
        editorView.dispatch({
            effects: linterCompartment.reconfigure([javascriptLinter]),
        });
    } else {
        editorView.dispatch({
            effects: linterCompartment.reconfigure([]), // Remove linter for other languages
        });
    }

    // For Python, add the specific highlight style
    if (lang === "python") {
        editorView.dispatch({
            effects: StateEffect.append.of(syntaxHighlighting(pythonKeywordHighlight)),
        });
    }

    updateFilenameWithLanguage();
});

themeSelect.addEventListener("change", () => {
    const themeExtension = getThemeExtension();
    editorView.dispatch({
        effects: theme.reconfigure(themeExtension),
    });

    // Update body classes for overall page theme
    const selectedTheme = themeSelect.value;
    const body = document.body;
    const container = document.querySelector(".container");
    const controls = document.querySelector(".controls");

    body.className = ""; // Clear all classes
    container.className = "container";
    controls.className = "controls";

    if (
        selectedTheme === "dracula" ||
        selectedTheme === "material-dark" ||
        selectedTheme === "nord" ||
        selectedTheme === "solarized-dark"
    ) {
        body.classList.add("dark-theme", `theme-${selectedTheme}`);
        container.classList.add("dark-theme", `theme-${selectedTheme}`);
        controls.classList.add("dark-theme", `theme-${selectedTheme}`);
    } else if (selectedTheme === "cotton-candy") {
        body.classList.add("theme-cotton-candy");
        container.classList.add("theme-cotton-candy");
        controls.classList.add("theme-cotton-candy");
    } else {
        body.classList.add("theme-light");
        container.classList.add("theme-light");
        controls.classList.add("theme-light");
    }
});

function updateEditorFontTheme() {
    const fontSize = fontSizeSelect.value;
    const fontFamily = fontFamilySelect.value;
    editorView.dispatch({
        effects: editorTheme.reconfigure(createEditorTheme(fontSize, fontFamily)),
    });
}

fontSizeSelect.addEventListener("change", updateEditorFontTheme);
fontFamilySelect.addEventListener("change", updateEditorFontTheme);

saveButton.addEventListener("click", () => {
    console.log("Save button clicked.");
    const content = editorView.state.doc.toString();
    let filename = currentFileName;

    const userFilename = prompt("Enter filename:", filename);
    if (userFilename && userFilename.trim()) {
        filename = userFilename.trim();
        updateFileNameDisplay(filename);
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

async function formatWithPrettierOrFallback(content, language) {
    const lang = (language || "").toLowerCase();

    // Prettier plugin set
    const plugins = [
        prettierPluginBabel,
        prettierPluginEstree,
        prettierPluginHtml,
        prettierPluginMarkdown,
        prettierPluginTypescript,
        prettierPluginFlow,
        prettierPluginPostcss,
        prettierPluginYaml,
        prettierPluginGraphql,
    ];

    // Enhanced language to parser mapping
    const parserByLang = {
        javascript: "babel",
        js: "babel",
        typescript: "typescript",
        ts: "typescript",
        html: "html",
        css: "css",
        scss: "css",
        less: "css",
        markdown: "markdown",
        md: "markdown",
        json: "json",
        yaml: "yaml",
        yml: "yaml",
        graphql: "graphql",
    };

    const parser = parserByLang[lang] || null;

    // Try Prettier formatting for supported languages
    if (parser) {
        try {
            const formatted = await prettier.format(content, {
                parser,
                plugins,
                semi: true,
                tabWidth: 4,
                printWidth: 160, // wider to avoid wrapping
                singleQuote: false,
                trailingComma: "es5",
                bracketSpacing: true,
                proseWrap: "never",
            });
            return formatted;
        } catch (e) {
            console.warn(`Prettier formatting failed for ${lang}:`, e?.message || e);
            // Fall through to basic formatting
        }
    }

    // Use custom formatters for specific languages
    if (lang === "python") {
        return formatPython(content);
    }

    // Use basic formatter for all other cases
    return basicFormat(content, lang);
}

formatButton.addEventListener("click", async () => {
    console.log("Format button clicked.");

    try {
        const content = editorView.state.doc.toString();
        const language = languageSelect ? languageSelect.value : "javascript";

        // Check if content is empty
        if (!content || content.trim().length === 0) {
            console.log("No content to format");
            return;
        }

        console.log(`Formatting ${language} code...`);
        const formattedContent = await formatWithPrettierOrFallback(content, language);

        // Validate formatted content
        if (typeof formattedContent === "string" && formattedContent.trim().length > 0) {
            // Only update if the content actually changed
            if (formattedContent !== content) {
                editorView.dispatch({
                    changes: { from: 0, to: editorView.state.doc.length, insert: formattedContent },
                });
                console.log(`Code formatted successfully using ${language} formatter`);

                // Visual feedback
                const originalText = formatButton.textContent;
                formatButton.textContent = "Formatted!";
                formatButton.style.backgroundColor = "#50fa7b";
                formatButton.style.color = "#282a36";

                setTimeout(() => {
                    formatButton.textContent = originalText;
                    formatButton.style.backgroundColor = "";
                    formatButton.style.color = "";
                }, 1500);
            } else {
                console.log("Code is already properly formatted");
            }
        } else {
            console.warn("Formatting failed or returned empty content");
        }
    } catch (error) {
        console.error("Error during formatting:", error);

        // Show error feedback to user
        const originalText = formatButton.textContent;
        formatButton.textContent = "Format Failed";
        formatButton.style.backgroundColor = "#ff5555";
        formatButton.style.color = "white";

        setTimeout(() => {
            formatButton.textContent = originalText;
            formatButton.style.backgroundColor = "";
            formatButton.style.color = "";
        }, 2000);
    }
});

copyButton.addEventListener("click", async () => {
    console.log("Copy button clicked.");
    try {
        const content = editorView.state.doc.toString();
        await navigator.clipboard.writeText(content);

        const originalText = copyButton.textContent;
        copyButton.textContent = "Copied!";
        copyButton.style.backgroundColor = "#50fa7b";
        copyButton.style.color = "#282a36";

        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.backgroundColor = "";
            copyButton.style.color = "";
        }, 1500);

        console.log("Code copied to clipboard successfully");
    } catch (error) {
        console.error("Failed to copy code:", error);
        alert("Failed to copy code to clipboard");
    }
});

// Simple language-agnostic formatter with a few language-specific tweaks
function basicFormat(content, language) {
    if ((language || "").toLowerCase() === "python") {
        return formatPython(content);
    }
    const indentUnitStr = "    "; // 4 spaces to match editor setting

    // JSON: try to pretty-print safely
    if (language === "json") {
        try {
            const obj = JSON.parse(content);
            return JSON.stringify(obj, null, 4);
        } catch (e) {
            // fall back to generic formatting
        }
    }

    const lines = content.replace(/\t/g, indentUnitStr).split(/\r?\n/);
    let indent = 0;

    // Strip simple line comments outside of strings (for JS-like)
    const stripLineComment = (text) => {
        let inS = false,
            quote = null,
            esc = false;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (esc) {
                esc = false;
                continue;
            }
            if (inS) {
                if (ch === "\\") {
                    esc = true;
                    continue;
                }
                if (ch === quote) {
                    inS = false;
                    quote = null;
                }
                continue;
            }
            if (ch === '"' || ch === "'" || ch === "`") {
                inS = true;
                quote = ch;
                continue;
            }
            if (ch === "/" && text[i + 1] === "/") return text.slice(0, i);
        }
        return text;
    };

    // Count braces ignoring quoted strings
    const netBracketDelta = (text) => {
        let inS = false,
            quote = null,
            esc = false;
        let open = 0,
            close = 0;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (esc) {
                esc = false;
                continue;
            }
            if (inS) {
                if (ch === "\\") {
                    esc = true;
                    continue;
                }
                if (ch === quote) {
                    inS = false;
                    quote = null;
                }
                continue;
            }
            if (ch === '"' || ch === "'" || ch === "`") {
                inS = true;
                quote = ch;
                continue;
            }
            if (ch === "{" || ch === "[" || ch === "(") open++;
            else if (ch === "}" || ch === "]" || ch === ")") close++;
        }
        return open - close;
    };

    const shouldPreDedent = (trimmed, lang) => {
        if (/^[}\]\)]/.test(trimmed)) return true;
        if (/^<\//.test(trimmed)) return true; // HTML/XML closing tag
        if (/^(case\b|default\s*:)/.test(trimmed)) return true; // switch cases
        if (lang === "python" && /^(elif\b|else\b|except\b|finally\b)/.test(trimmed)) return true;
        return false;
    };

    const incAfterLine = (trimmed, lang) => {
        let inc = 0;
        // Python blocks
        if (lang === "python" && /:\s*$/.test(trimmed)) inc++;
        // HTML opening tags (not self-closing and not same-line closing)
        if (/^<([A-Za-z][^\s>/]*)(?:(?!\/>).)*>$/.test(trimmed) && !/^<.*<\/.*>\s*$/.test(trimmed))
            inc++;
        // Brackets net delta (ignore strings)
        inc += Math.max(0, netBracketDelta(trimmed));
        return inc;
    };

    const formatted = lines
        .map((raw) => {
            // Normalize leading whitespace and strip simple comments for bracket calc
            const noLead = raw.replace(/^[\s\u00A0]+/, "");
            let lineForCalc = noLead;
            const lang = (language || "").toLowerCase();
            if (["javascript", "typescript", "css", "java", "cpp", "php"].includes(lang)) {
                lineForCalc = stripLineComment(noLead);
            }

            const trimmed = noLead.trim();
            if (trimmed.length === 0) return ""; // keep blank lines empty

            if (shouldPreDedent(trimmed, lang)) indent = Math.max(0, indent - 1);

            const out = indentUnitStr.repeat(indent) + trimmed;

            indent += incAfterLine(lineForCalc.trim(), lang);
            return out;
        })
        .join("\n");

    return formatted.replace(/[\t ]+$/gm, "");
}

// Python-specific formatter: indentation by blocks (:), continuations, and brackets
function formatPython(content) {
    const IND = "    ";
    const lines = content.split(/\r?\n/);
    let blockIndent = 0; // current indentation level
    let classLevel = 0; // track if we're inside a class
    let parenDepth = 0; // parenthesis/bracket depth for continuation
    let backslashCont = false; // line continuation with backslash
    let inTriple = false; // inside triple-quoted string
    let tripleQuote = null; // """ or '''

    const isBlank = (s) => /^\s*$/.test(s);

    // Keywords that increase indentation after them
    const blockStartKeywords =
        /^(def|class|if|elif|else|for|while|try|except|finally|with|match|case|async\s+def)\b/;
    // Keywords that should be at same level as their opening statement
    const dedentKeywords = /^(elif|else|except|finally|case)\b/;
    // Method definition pattern
    const methodDefPattern = /^def\s+\w+\s*\(/;
    // Class definition pattern
    const classDefPattern = /^class\s+\w+/;

    const stripComment = (text) => {
        let inString = false;
        let quote = null;
        let escaped = false;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (inString) {
                if (ch === "\\") {
                    escaped = true;
                    continue;
                }
                if (ch === quote) {
                    inString = false;
                    quote = null;
                }
                continue;
            }

            if (ch === '"' || ch === "'") {
                // Check for triple quotes
                if (i + 2 < text.length && text.substr(i, 3) === ch.repeat(3)) {
                    // Handle triple quote (skip for comment detection)
                    i += 2;
                    continue;
                }
                inString = true;
                quote = ch;
                continue;
            }

            if (ch === "#") {
                return text.slice(0, i).trimEnd();
            }
        }

        return text;
    };

    const parenDelta = (text) => {
        let inString = false;
        let quote = null;
        let escaped = false;
        let open = 0;
        let close = 0;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (inString) {
                if (ch === "\\") {
                    escaped = true;
                    continue;
                }
                if (ch === quote) {
                    inString = false;
                    quote = null;
                }
                continue;
            }

            if (ch === '"' || ch === "'") {
                inString = true;
                quote = ch;
                continue;
            }

            if (ch === "#") break; // Ignore parentheses in comments

            if (ch === "(" || ch === "[" || ch === "{") open++;
            else if (ch === ")" || ch === "]" || ch === "}") close++;
        }

        return open - close;
    };

    const updateTripleQuoteState = (line) => {
        const doubleTriple = /"""/g;
        const singleTriple = /'''/g;

        // Count triple quotes (simple approach)
        const doubleCount = (line.match(doubleTriple) || []).length;
        const singleCount = (line.match(singleTriple) || []).length;

        if (!inTriple) {
            if (doubleCount % 2 === 1) {
                inTriple = true;
                tripleQuote = '"""';
            } else if (singleCount % 2 === 1) {
                inTriple = true;
                tripleQuote = "'''";
            }
        } else {
            if (tripleQuote === '"""' && doubleCount % 2 === 1) {
                inTriple = false;
                tripleQuote = null;
            } else if (tripleQuote === "'''" && singleCount % 2 === 1) {
                inTriple = false;
                tripleQuote = null;
            }
        }
    };

    const out = [];

    for (let idx = 0; idx < lines.length; idx++) {
        const raw = lines[idx];
        const noLeadingWS = raw.replace(/^[\s\u00A0]+/, "");
        const trimmed = noLeadingWS.trimEnd();

        // Skip empty lines
        if (isBlank(trimmed)) {
            out.push("");
            continue;
        }

        // Update triple quote state
        updateTripleQuoteState(trimmed);

        // If we're in a triple-quoted string, preserve indentation relative to block
        if (inTriple) {
            out.push(IND.repeat(blockIndent) + trimmed);
            continue;
        }

        // Handle special cases for class methods
        let currentIndent = blockIndent;
        const effective = stripComment(trimmed);

        // Handle class definition
        if (classDefPattern.test(effective)) {
            classLevel = blockIndent;
            currentIndent = blockIndent;
        }
        // Handle method definition - should be at class level + 1
        else if (methodDefPattern.test(effective) && classLevel >= 0) {
            currentIndent = classLevel + 1;
            blockIndent = classLevel + 1;
        }
        // Handle dedent keywords (elif, else, except, finally)
        else if (dedentKeywords.test(trimmed) && blockIndent > 0) {
            currentIndent = blockIndent - 1;
        }
        // Handle function definitions outside of classes
        else if (/^def\s+\w+/.test(effective) && classLevel < 0) {
            currentIndent = 0; // Top-level functions should be at indent 0
            blockIndent = 0;
        }

        // Handle continuation indentation (inside parentheses or after backslash)
        let contIndent = 0;
        if (parenDepth > 0 || backslashCont) {
            contIndent = 1;
        }

        // Reduce continuation if line starts with closing bracket
        if (/^[\)\]\}]/.test(trimmed) && parenDepth > 0) {
            contIndent = Math.max(0, contIndent - 1);
        }

        const finalIndent = Math.max(0, currentIndent + contIndent);
        out.push(IND.repeat(finalIndent) + trimmed);

        // Update state for next iteration

        // Check if this line ends with colon (starts a new block)
        const endsWithColon = /:[\s]*$/.test(effective);

        // Update block indent based on what we just processed
        if (classDefPattern.test(effective)) {
            blockIndent = currentIndent + 1;
            classLevel = currentIndent;
        } else if (methodDefPattern.test(effective)) {
            blockIndent = currentIndent + 1;
        } else if (dedentKeywords.test(trimmed) && blockIndent > 0) {
            blockIndent = blockIndent - 1;
        } else if (
            endsWithColon &&
            !methodDefPattern.test(effective) &&
            !classDefPattern.test(effective)
        ) {
            blockIndent++;
        } else if (blockStartKeywords.test(effective) && endsWithColon) {
            blockIndent++;
        }

        // Reset class level when we go back to top level
        if (
            currentIndent === 0 &&
            !classDefPattern.test(effective) &&
            !methodDefPattern.test(effective)
        ) {
            if (!/^(import|from|#|\s*$)/.test(effective)) {
                classLevel = -1;
            }
        }

        // Update parenthesis depth and backslash continuation
        parenDepth = Math.max(0, parenDepth + parenDelta(effective));
        backslashCont = /\\\s*$/.test(effective);
    }

    return out.join("\n");
}

header.addEventListener("click", function () {
    if (header.getAttribute("contenteditable") === "true") return;

    const originalText = header.textContent;
    const nameWithoutExt = getFileNameWithoutExtension(originalText);

    header.textContent = nameWithoutExt;
    header.setAttribute("contenteditable", "true");
    header.focus();

    const range = document.createRange();
    range.selectNodeContents(header);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    function finishEditing() {
        header.removeAttribute("contenteditable");
        header.removeEventListener("keydown", handleKeydown);
        header.removeEventListener("blur", handleBlur);

        let newNameWithoutExt = header.textContent.trim();
        if (!newNameWithoutExt) {
            newNameWithoutExt = "untitled";
        }

        const currentLanguage = languageSelect.value;
        const newExtension = getFileExtension(currentLanguage);
        const newFileName = `${newNameWithoutExt}.${newExtension}`;

        updateFileNameDisplay(newFileName);
    }

    function handleKeydown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            finishEditing();
        } else if (e.key === "Escape") {
            e.preventDefault();
            header.textContent = originalText;
            finishEditing();
        }
    }

    function handleBlur() {
        finishEditing();
    }

    header.addEventListener("keydown", handleKeydown);
    header.addEventListener("blur", handleBlur);
});

// Initial Setup
function initializeApp() {
    const initialLang = languageSelect.value;
    const initialFileName = `untitled.${getFileExtension(initialLang)}`;
    updateFileNameDisplay(initialFileName);

    // Apply initial theme to body
    const body = document.body;
    const container = document.querySelector(".container");
    const controls = document.querySelector(".controls");
    body.classList.add("theme-cotton-candy");
    container.classList.add("theme-cotton-candy");
    controls.classList.add("theme-cotton-candy");

    console.log("CodeMirror setup complete.");
}

initializeApp();
