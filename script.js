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
import {
    autocompletion,
    closeBrackets,
} from "@codemirror/autocomplete";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { materialDark } from "@uiw/codemirror-theme-material";
import { nord } from "@uiw/codemirror-theme-nord";
import { solarizedDark } from "@uiw/codemirror-theme-solarized";
import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import {
    history,
    indentWithTab,
} from "@codemirror/commands";
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

// Prettier imports removed - using simple formatting instead

console.log("script.js is running and initializing CodeMirror...");

// Cotton Candy Theme Definition
const cottonCandyTheme = EditorView.theme({
    "&": {
        color: "#4a4a4a",
        backgroundColor: "#fff0f5"
    },
    ".cm-content": {
        padding: "10px",
        caretColor: "#d63384"
    },
    ".cm-focused": {
        outline: "none"
    },
    ".cm-editor": {
        fontSize: "14px"
    },
    ".cm-scroller": {
        fontFamily: "'Cascadia Code', 'Fira Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace"
    },
    ".cm-gutters": {
        backgroundColor: "#f8d7da",
        color: "#d63384",
        border: "none"
    },
    ".cm-lineNumbers": {
        color: "#d63384"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#f1c0c7"
    },
    ".cm-activeLine": {
        backgroundColor: "#fce4ec"
    },
    ".cm-selectionMatch": {
        backgroundColor: "#f8bbd9"
    },
    ".cm-searchMatch": {
        backgroundColor: "#ffc0cb",
        outline: "1px solid #ff69b4"
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#ff1493"
    },
    ".cm-cursor": {
        borderLeftColor: "#d63384"
    },
    ".cm-tooltip": {
        backgroundColor: "#f8d7da",
        border: "1px solid #d63384"
    }
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
    { tag: t.invalid, color: "#dc3545" },
]);

const cottonCandy = [cottonCandyTheme, syntaxHighlighting(cottonCandyHighlightStyle)];

// Initial editor content
const initialDoc = `function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("World");
`;

// Example completion source
const myCompletions = [
    { label: "function", type: "keyword" },
    { label: "const", type: "keyword" },
    { label: "let", type: "keyword" },
    { label: "var", type: "keyword" },
    { label: "console.log", type: "function" },
    { label: "return", type: "keyword" },
    { label: "if", type: "keyword" },
    { label: "else", type: "keyword" },
    { label: "for", type: "keyword" },
    { label: "while", type: "keyword" },
    { label: "class", type: "keyword" },
    { label: "import", type: "keyword" },
    { label: "export", type: "keyword" },
    { label: "document", type: "variable" },
    { label: "window", type: "variable" },
    { label: "helloWorld", type: "variable" },
    { label: "myVariable", type: "variable" },
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
            !line.text.trim().endsWith("{") &&
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

// Define a function to get extensions based on language and theme
function getEditorExtensions(languageExtension, themeExtension) {
    console.log("Applying extensions...");
    const extensions = [
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
        languageExtension,
        EditorState.tabSize.of(4),
        indentUnit.of("    "),
        themeExtension,
        ...colorPicker,
        showMinimap.compute(["doc"], (state) => {
            return {
                create: () => {
                    const dom = document.createElement("div");
                    // You can add custom styling to the minimap DOM element here
                    return { dom };
                },
                /* optional */
                displayText: "blocks", // or 'characters'
                showOverlay: "always", // or 'mouse-over'
            };
        }),
    ];

    // Add linter only for JavaScript
    if (languageExtension.name === "javascript") {
        extensions.push(javascriptLinter);
    }

    return extensions;
}

// Initial editor state with JavaScript and light theme
let editorState = EditorState.create({
    doc: initialDoc,
    extensions: getEditorExtensions(javascript(), []), // Start with light theme (no specific theme extension)
});

const editorParent = document.getElementById("editor");
if (!editorParent) {
    console.error("Editor parent element #editor not found!");
} else {
    console.log("Editor parent element found:", editorParent);
}

let editorView = new EditorView({
    state: editorState,
    parent: editorParent,
});

console.log("EditorView created:", editorView);

// Make editorView globally accessible for debugging
window.editorView = editorView;

// Language Switching
const languageSelect = document.getElementById("language-select");
if (languageSelect) {
    languageSelect.addEventListener("change", (event) => {
    console.log("Language change event fired.");
    const lang = event.target.value;
    let newLanguageExtension;
    switch (lang) {
        case "javascript":
            newLanguageExtension = javascript();
            break;
        case "python":
            newLanguageExtension = python();
            break;
        case "html":
            newLanguageExtension = html();
            break;
        case "css":
            newLanguageExtension = css();
            break;
        case "java":
            newLanguageExtension = java();
            break;
        case "cpp":
            newLanguageExtension = cpp();
            break;
        case "markdown":
            newLanguageExtension = markdown();
            break;
        case "json":
            newLanguageExtension = json();
            break;
        case "sql":
            newLanguageExtension = sql();
            break;
        case "rust":
            newLanguageExtension = rust();
            break;
        case "php":
            newLanguageExtension = php();
            break;
        case "xml":
            newLanguageExtension = xml();
            break;
        default:
            newLanguageExtension = javascript();
    }

    // Get current theme to reapply it
    const currentTheme = themeSelect.value;
    let themeExtension;
    switch (currentTheme) {
        case "dracula":
            themeExtension = dracula;
            break;
        case "material-dark":
            themeExtension = materialDark;
            break;
        case "nord":
            themeExtension = nord;
            break;
        case "solarized-dark":
            themeExtension = solarizedDark;
            break;
        case "cotton-candy":
            themeExtension = cottonCandy;
            break;
        default:
            themeExtension = []; // Light theme
    }

    editorView.dispatch({
        effects: StateEffect.reconfigure.of(
            getEditorExtensions(newLanguageExtension, themeExtension)
        ),
    });
    
    // Auto-update filename extension
    updateFilenameWithLanguage();
    });
}

// Theme Switching
const themeSelect = document.getElementById("theme-select");
if (themeSelect) {
    themeSelect.addEventListener("change", (event) => {
    console.log("Theme change event fired.");
    const theme = event.target.value;
    const body = document.body;
    const container = document.querySelector(".container");
    const controls = document.querySelector(".controls");

    let newThemeExtension;
    
    // Remove all theme classes
    body.classList.remove("dark-theme", "theme-dracula", "theme-material-dark", "theme-nord", "theme-solarized-dark", "theme-light", "theme-cotton-candy");
    container.classList.remove("dark-theme", "theme-dracula", "theme-material-dark", "theme-nord", "theme-solarized-dark", "theme-light", "theme-cotton-candy");
    controls.classList.remove("dark-theme", "theme-dracula", "theme-material-dark", "theme-nord", "theme-solarized-dark", "theme-light", "theme-cotton-candy");
    
    if (
        theme === "dracula" ||
        theme === "material-dark" ||
        theme === "nord" ||
        theme === "solarized-dark"
    ) {
        body.classList.add("dark-theme", `theme-${theme}`);
        container.classList.add("dark-theme", `theme-${theme}`);
        controls.classList.add("dark-theme", `theme-${theme}`);
        switch (theme) {
            case "dracula":
                newThemeExtension = dracula;
                break;
            case "material-dark":
                newThemeExtension = materialDark;
                break;
            case "nord":
                newThemeExtension = nord;
                break;
            case "solarized-dark":
                newThemeExtension = solarizedDark;
                break;
        }
    } else if (theme === "cotton-candy") {
        body.classList.add("theme-cotton-candy");
        container.classList.add("theme-cotton-candy");
        controls.classList.add("theme-cotton-candy");
        newThemeExtension = cottonCandy;
    } else {
        body.classList.add("theme-light");
        container.classList.add("theme-light");
        controls.classList.add("theme-light");
        newThemeExtension = []; // No specific theme extension for light
    }

    // Get current language to reapply it
    const currentLanguage = languageSelect.value;
    let currentLanguageExtension;
    switch (currentLanguage) {
        case "javascript":
            currentLanguageExtension = javascript();
            break;
        case "python":
            currentLanguageExtension = python();
            break;
        case "html":
            currentLanguageExtension = html();
            break;
        case "css":
            currentLanguageExtension = css();
            break;
        case "java":
            currentLanguageExtension = java();
            break;
        case "cpp":
            currentLanguageExtension = cpp();
            break;
        case "markdown":
            currentLanguageExtension = markdown();
            break;
        case "json":
            currentLanguageExtension = json();
            break;
        case "sql":
            currentLanguageExtension = sql();
            break;
        case "rust":
            currentLanguageExtension = rust();
            break;
        case "php":
            currentLanguageExtension = php();
            break;
        case "xml":
            currentLanguageExtension = xml();
            break;
        default:
            currentLanguageExtension = javascript();
    }

    editorView.dispatch({
        effects: StateEffect.reconfigure.of(
            getEditorExtensions(currentLanguageExtension, newThemeExtension)
        ),
    });
    });
}

// Basic formatting functionality (simple indentation)
const formatButton = document.getElementById("format-button");
if (formatButton) {
    formatButton.addEventListener("click", () => {
        console.log("Format button clicked.");
        const content = editorView.state.doc.toString();
        const language = languageSelect ? languageSelect.value : "javascript";
        
        // Simple formatting: fix basic indentation
        let formattedContent;
        try {
            const lines = content.split('\n');
            let indentLevel = 0;
            const indentSize = 2;
            
            formattedContent = lines.map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                
                // Decrease indent for closing braces/brackets
                if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }
                
                const formatted = ' '.repeat(indentLevel * indentSize) + trimmed;
                
                // Increase indent for opening braces/brackets
                if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
                    indentLevel++;
                }
                
                return formatted;
            }).join('\n');
            
            editorView.dispatch({
                changes: { from: 0, to: editorView.state.doc.length, insert: formattedContent },
            });
            console.log("Code formatted successfully (basic indentation)");
        } catch (error) {
            console.error("Error formatting code:", error);
            alert("Error formatting code: " + error.message);
        }
    });
}

// Save File Functionality
const fileNameDisplay = document.getElementById("file-name-display");

let currentFileName = "untitled.js";

function updateFileNameDisplay(filename) {
    console.log("Updating filename display to:", filename);
    currentFileName = filename;
    if (fileNameDisplay) {
        fileNameDisplay.textContent = filename;
    }

    const header = document.querySelector("h1");
    if (header) {
        header.textContent = filename;
    }
}

// Function to get filename without extension
function getFileNameWithoutExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename;
    return filename.substring(0, lastDotIndex);
}

// Function to update filename with current language extension
function updateFilenameWithLanguage() {
    const currentLanguage = languageSelect ? languageSelect.value : "javascript";
    const currentExtension = getFileExtension(currentLanguage);
    const nameWithoutExt = getFileNameWithoutExtension(currentFileName);
    const newFileName = `${nameWithoutExt}.${currentExtension}`;
    updateFileNameDisplay(newFileName);
}

// Make h1 editable
function setupEditableHeader() {
    const header = document.querySelector("h1");
    if (!header) return;

    header.addEventListener('click', function() {
        if (header.getAttribute('contenteditable') === 'true') return;
        
        // Store original content and get current extension
        const originalText = header.textContent;
        const currentExtension = currentFileName.substring(currentFileName.lastIndexOf('.'));
        const nameWithoutExt = getFileNameWithoutExtension(currentFileName);
        
        // Set editable content to just the filename without extension
        header.textContent = nameWithoutExt;
        header.setAttribute('contenteditable', 'true');
        header.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(header);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Handle Enter key to save
        function handleKeydown(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                header.textContent = originalText;
                finishEditing();
            }
        }
        
        function handleBlur() {
            finishEditing();
        }
        
        function finishEditing() {
            header.removeAttribute('contenteditable');
            header.removeEventListener('keydown', handleKeydown);
            header.removeEventListener('blur', handleBlur);
            
            // Get the edited name and add current language extension
            let newNameWithoutExt = header.textContent.trim();
            
            // If empty, use default
            if (!newNameWithoutExt) {
                newNameWithoutExt = "untitled";
            }
            
            // Get current language extension
            const currentLanguage = languageSelect ? languageSelect.value : "javascript";
            const newExtension = getFileExtension(currentLanguage);
            const newFileName = `${newNameWithoutExt}.${newExtension}`;
            
            // Update filename
            updateFileNameDisplay(newFileName);
        }
        
        header.addEventListener('keydown', handleKeydown);
        header.addEventListener('blur', handleBlur);
    });
}

// Save File Functionality
const saveButton = document.getElementById("save-button");
if (saveButton) {
    saveButton.addEventListener("click", () => {
    console.log("Save button clicked.");
    const content = editorView.state.doc.toString();
    let filename = currentFileName;

    // Simple prompt for filename with current name as default
    const userFilename = prompt("Enter filename (e.g., mycode.js):", filename);
    if (userFilename && userFilename.trim()) {
        filename = userFilename.trim();
        currentFileName = filename;
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
}

console.log("Initial language select value:", languageSelect ? languageSelect.value : "javascript");

// Function to get file extension from language
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
        xml: "xml"
    };
    return extensions[language] || "txt";
}

// Update the <h1> element to reflect the file name
const header = document.querySelector("h1");
const initialLang = languageSelect ? languageSelect.value : "javascript";
const initialFileName = `untitled.${getFileExtension(initialLang)}`;
if (header) {
    header.textContent = initialFileName;
}
// Initial file name display
if (typeof updateFileNameDisplay === 'function') {
    updateFileNameDisplay(initialFileName);
}

// Setup editable header
setupEditableHeader();

// Copy Code Functionality
const copyButton = document.getElementById("copy-button");
if (copyButton) {
    copyButton.addEventListener("click", async () => {
        console.log("Copy button clicked.");
        try {
            const content = editorView.state.doc.toString();
            await navigator.clipboard.writeText(content);
            
            // Visual feedback
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
            
            // Fallback for older browsers
            try {
                const textArea = document.createElement("textarea");
                textArea.value = editorView.state.doc.toString();
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Visual feedback for fallback
                const originalText = copyButton.textContent;
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 1500);
                
                console.log("Code copied using fallback method");
            } catch (fallbackError) {
                console.error("Fallback copy failed:", fallbackError);
                alert("Failed to copy code to clipboard");
            }
        }
    });
}

console.log("CodeMirror setup complete.");
