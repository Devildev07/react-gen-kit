# Hi, I'm Dewanshu! 👋
## Made with ❤️ for React developers.

# 🛠️  CLI for React

A powerful and flexible CLI tool to **interactively generate** React components, pages, context, or providers — with full support for JavaScript or TypeScript, styles, testing, and configurable paths.

---

## ✨ Features

- 🔧 Interactive CLI (like Vite!)
- ⚛️ Generate:
  - React Components
  - Pages
  - Hooks
  - Providers
- 🧠 Supports both **JavaScript** and **TypeScript**
- 🎨 Style file support (`css`, `scss`, with optional CSS Modules)
- 🧪 Optional test file using **React Testing Library**
- 📂 Custom output path or generate in the current directory
- 🛠️ Configurable via `.componentclirc.json`

---

## 📦 Installation

<!-- You can use it globally or locally — your choice!

### 📌 Option 1: Global install

```bash
npm install -g react-gen-kit
react-generate [options] (For Custom Path and Current working directory)

Example 1: react-generate -c
Example 2: react-generate --path < your custom path >
``` -->

### 📌 Option 1: Use via npx

```bash
npm install react-gen-kit
npx react-gen-kit  [options] (For Custom Path and Current working directory)

Example 1: npx react-gen-kit  -c
Example 2: npx react-gen-kit  --path < your custom path >
```

### 📌 Option 2: As an npm script in your project

```bash
Step 1: npm install react-gen-kit
Step 2: Add this to package.json scripts:
              "scripts": {
                  "generate": "react-generate"
                },
Step 3: Run this command in terminal "npm run generate [options]"

Example 1: npm run generate -c
Example 2: npm run generate -- --path < your custom path >
```


## 🛠️ CLI Options

| Parameter         | Type      | Description                                                                   |
| :---------------- | :-------- | :---------------------------------------------------------------------------- |
| `<ComponentName>` | `string`  | **Required**. Name of the React component to generate                         |
| `--path`,`-p`        | `string`  | Custom relative path to place the component (e.g. `shared/ui`)                |
|  `--current`,`-c` | `boolean` | Generate the component inside a `components/` folder in the current directory |
