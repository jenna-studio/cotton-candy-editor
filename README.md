# 🍭 Cotton Candy Code Editor

A beautiful, modern web-based code editor built with CodeMirror 6. Features multiple themes including our signature "Cotton Candy" theme with pink pastels, syntax highlighting for 12+ languages, and a clean, intuitive interface.

## ✨ Features

- **🎨 Multiple Themes**: Light, Dark (Dracula, Material, Nord, Solarized), and our custom Cotton Candy theme
- **💻 12+ Languages**: JavaScript, Python, HTML, CSS, Java, C++, Markdown, JSON, SQL, Rust, PHP, XML
- **📝 Smart Editing**: Auto-completion, bracket matching, syntax highlighting
- **📁 File Management**: Save files, editable filenames with auto-extension updates
- **🎯 Copy Code**: One-click code copying to clipboard
- **🔧 Code Formatting**: Basic indentation formatting
- **📱 Responsive Design**: Works on desktop and mobile
- **🔗 Embeddable**: Easy integration into any website

## 🚀 Quick Start

### Online Demo

Visit: [Your GitHub Pages URL] (to be deployed)

### Local Development

```bash
# Clone the repository
git clone https://github.com/jenna-studio/cotton-candy-editor.git
cd cotton-candy-editor

# Install dependencies
npm install

# Build the project
npm run build

# Serve locally
npm run serve
```

### Embed in Your Website

```html
<!-- Include the CSS -->
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/jenna-studio/cotton-candy-editor@main/dist/editor.min.css" />

<!-- Create container -->
<div id="my-editor"></div>

<!-- Include the JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/jenna-studio/cotton-candy-editor@main/dist/editor.min.js"></script>
<script>
    // Initialize the editor
    const editor = new CottonCandyEditor({
        parent: document.getElementById("my-editor"),
        theme: "cotton-candy",
        language: "javascript",
        value: 'console.log("Hello World!");',
    });
</script>
```

## 🎨 Themes

### Cotton Candy 🍭

Our signature theme with soft pink pastels and colorful syntax highlighting:

- **Background**: Lavender blush (#fff0f5)
- **Keywords**: Pink/magenta
- **Functions**: Teal
- **Strings**: Green
- **Comments**: Grey

### Other Themes

- **Light**: Clean, minimal light theme
- **Dracula**: Dark theme with purple accents
- **Material Dark**: Google's material design dark theme
- **Nord**: Arctic, north-bluish color palette
- **Solarized Dark**: Precision colors for machines and people

## 🛠️ Supported Languages

| Language   | Extension | Syntax Highlighting | Auto-completion |
| ---------- | --------- | ------------------- | --------------- |
| JavaScript | `.js`     | ✅                  | ✅              |
| Python     | `.py`     | ✅                  | ✅              |
| HTML       | `.html`   | ✅                  | ✅              |
| CSS        | `.css`    | ✅                  | ✅              |
| Java       | `.java`   | ✅                  | ✅              |
| C++        | `.cpp`    | ✅                  | ✅              |
| Markdown   | `.md`     | ✅                  | ✅              |
| JSON       | `.json`   | ✅                  | ✅              |
| SQL        | `.sql`    | ✅                  | ✅              |
| Rust       | `.rs`     | ✅                  | ✅              |
| PHP        | `.php`    | ✅                  | ✅              |
| XML        | `.xml`    | ✅                  | ✅              |

## 📖 API Documentation

### Embedding Options

```javascript
const editor = new CottonCandyEditor({
    parent: HTMLElement, // Required: Container element
    theme: string, // Optional: 'light', 'cotton-candy', 'dracula', etc.
    language: string, // Optional: 'javascript', 'python', etc.
    value: string, // Optional: Initial code content
    readOnly: boolean, // Optional: Make editor read-only
    showLineNumbers: boolean, // Optional: Show/hide line numbers
    showMinimap: boolean, // Optional: Show/hide minimap
    tabSize: number, // Optional: Tab size (default: 4)
    wordWrap: boolean, // Optional: Enable word wrap
});
```

### Methods

```javascript
// Get editor content
const code = editor.getValue();

// Set editor content
editor.setValue('console.log("Hello");');

// Change theme
editor.setTheme("cotton-candy");

// Change language
editor.setLanguage("python");

// Get current language
const lang = editor.getLanguage();

// Focus the editor
editor.focus();

// Destroy the editor
editor.destroy();
```

### Events

```javascript
editor.on("change", (content) => {
    console.log("Content changed:", content);
});

editor.on("themeChange", (theme) => {
    console.log("Theme changed to:", theme);
});

editor.on("languageChange", (language) => {
    console.log("Language changed to:", language);
});
```

## 🔧 Development

### Project Structure

```
cotton-candy-editor/
├── src/
│   ├── script.js          # Main editor logic
│   ├── style.css          # Styling and themes
│   └── embed.js           # Embeddable version
├── dist/                  # Built files
├── docs/                  # Documentation and demos
├── index.html             # Main demo page
├── package.json
└── README.md
```

### Build Scripts

```bash
npm run build       # Build for production
npm run dev         # Development with hot reload
npm run serve       # Serve built files
npm run deploy      # Deploy to GitHub Pages
npm run lint        # Lint code
npm run test        # Run tests
```

## 🚀 Deployment

### GitHub Pages

1. Push to your GitHub repository
2. Go to Settings > Pages
3. Select source: "Deploy from a branch"
4. Select branch: `main` and folder: `/docs`
5. Your editor will be available at: `https://yourusername.github.io/cotton-candy-editor`

### CDN Distribution

The editor is available via CDN for easy embedding:

```html
<!-- CSS -->
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/yourusername/cotton-candy-editor@main/dist/editor.min.css" />

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/cotton-candy-editor@main/dist/editor.min.js"></script>
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [CodeMirror 6](https://codemirror.net/)
- Themes inspired by popular VS Code themes
- Icons from [Heroicons](https://heroicons.com/)

## 📧 Contact

- GitHub: [@jenna-studio](https://github.com/jenna-studio)
- Email: jenna@jenna-studio.dev
- Project Link: [https://github.com/jenna-studio/cotton-candy-editor](https://github.com/jenna-studio/cotton-candy-editor)

---

⭐ **Star this project if you find it useful!**
