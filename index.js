#!/usr/bin/env node
// This is a CLI tool to generate React components, pages, context, and providers interactively.

import fs from 'fs';
import path from 'path';
import os from 'os';
import { program } from 'commander';
import inquirer from 'inquirer';

// Load config from file
function loadConfig() {
    const configPaths = [
        path.join(process.cwd(), '.componentclirc.json'),
        path.join(os.homedir(), '.componentclirc.json'),
    ];
    for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    }
    return {};
}

// Generate files
function createFiles({
    componentName,
    useTypeScript,
    styleExtension,
    createTest,
    useCSSModule,
    customPath,
    useCurrent,
    type
}) {
    let ext;
    if (type.toLowerCase() === 'hook') {
        ext = useTypeScript ? 'ts' : 'js';
    } else {
        ext = useTypeScript ? 'tsx' : 'jsx';
    }
    const styleFile = useCSSModule
        ? `${componentName}.module.${styleExtension}`
        : `${componentName}.${styleExtension}`;
    const testFile = `${componentName}.test.${ext}`;

    const currentDir = process.env.INIT_CWD || process.cwd();

    // Determine the folder name based on the type
    let folderName;
    switch (type.toLowerCase()) {
        case 'page':
            folderName = 'pages';
            break;
        case 'hook':
            folderName = 'hooks';
            break;
        case 'provider':
            folderName = 'providers';
            break;
        case 'component':
        default:
            folderName = 'components';
            break;
    }

    // Determine base directory
    let baseDir;
    if (customPath) {
        baseDir = path.join(currentDir, customPath, folderName);
    } else if (useCurrent) {
        baseDir = path.join(currentDir, folderName);
    } else if (currentDir.includes(`${path.sep}src${path.sep}`) || currentDir.endsWith(`${path.sep}src`)) {
        baseDir = path.join(currentDir, folderName);
    } else {
        baseDir = path.join(currentDir, 'src', folderName);
    }


    const isFlatFile = ['hook', 'provider'].includes(type.toLowerCase());
    const targetDir = isFlatFile ? baseDir : path.join(baseDir, componentName);

    fs.mkdirSync(targetDir, { recursive: true });

    const filePath = isFlatFile
    ? path.join(targetDir, `${componentName}.${ext}`)
    : path.join(targetDir, `${componentName}.${ext}`);

    // Create component, hook, or provider file
    let importStyle = '';
    let componentContent = '';
    const isVisualComponent = ['component', 'page'].includes(type.toLowerCase());

    if (isVisualComponent) {
        importStyle = `import './${styleFile}';\n\n`;
        componentContent = `${importStyle}const ${componentName} = () => {\n  return (<div className="${componentName}">${componentName} ${type}</div>);\n};\n\nexport default ${componentName};`;
    } else if (type.toLowerCase() === 'hook') {
        // Ensure hook name starts with "use"
        const hookName = componentName.startsWith('use') ? componentName : `use${componentName.charAt(0).toUpperCase()}${componentName.slice(1)}`;
        componentContent = `import { useState } from 'react';\n\nfunction ${hookName}() {\n  const [state, setState] = useState(null);\n  // Your hook logic here\n  return [state, setState];\n}\n\nexport default ${hookName};`;
    } else if (type.toLowerCase() === 'provider') {
        const baseName = componentName.replace(/Provider$/, '');
        const contextName = `${baseName}Context`;
        const providerName = `${baseName}Provider`;
        const hookName = `use${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}`;

        componentContent =
            `import React, { createContext, useContext, useState } from 'react';\n\n` +
            `interface ${baseName}Value<T = unknown> {\n` +
            `  state: T;\n` +
            `  setState: React.Dispatch<React.SetStateAction<T>>;\n` +
            `}\n\n` +
            `const ${contextName} = createContext<${baseName}Value | undefined>(undefined);\n\n` +
            `interface ${providerName}Props {\n` +
            `  children: React.ReactNode;\n` +
            `}\n\n` +
            `export const ${providerName}: React.FC<${providerName}Props> = ({ children }) => {\n` +
            `  const [state, setState] = useState<unknown>(null);\n\n` +
            `  return (\n` +
            `    <${contextName}.Provider value={{ state, setState }}>\n` +
            `      {children}\n` +
            `    </${contextName}.Provider>\n` +
            `  );\n` +
            `};\n\n` +
            `export const ${hookName} = () => {\n` +
            `  const context = useContext(${contextName});\n` +
            `  if (!context) {\n` +
            `    throw new Error('${hookName} must be used within a ${providerName}');\n` +
            `  }\n` +
            `  return context;\n` +
            `};`;
    }

    fs.writeFileSync(filePath, componentContent);

    // Style file (only for visual components)
    if (isVisualComponent) {
        fs.writeFileSync(path.join(targetDir, styleFile), `.${componentName} {\n\n}`);
    }

    // Test file (only for visual components)
    if (createTest && isVisualComponent) {
        const testContent = `import React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport ${componentName} from './${componentName}';\n\ntest('renders ${componentName}', () => {\n  render(<${componentName} />);\n  expect(screen.getByText('${componentName}')).toBeInTheDocument();\n});`;
        fs.writeFileSync(path.join(targetDir, testFile), testContent);
    }

    console.log(`✅ Created ${type} "${componentName}" in ${path.relative(currentDir, targetDir)}`);
}

// Interactive prompt
async function promptUser(cliOptions = {}) {
    try {
        const config = loadConfig();

        const { type } = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'What do you want to generate?',
                choices: ['Component', 'Page', 'Hook', 'Provider']
            }
        ]);

        const { componentName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'componentName',
                message: `Enter ${type.toLowerCase()} name:`,
                validate: input => !!input || 'Name is required.'
            }
        ]);

        const { useTypeScript, styleExtension, createTest, useCSSModule } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'useTypeScript',
                message: 'Use TypeScript?',
                default: config.useTypeScript || false
            },
            {
                type: 'list',
                name: 'styleExtension',
                message: 'Choose style extension:',
                choices: ['css', 'scss'],
                default: config.styleExtension || 'css',
                when: () => ['Component', 'Page'].includes(type)
            },
            {
                type: 'confirm',
                name: 'createTest',
                message: 'Create test file?',
                default: config.createTest || false,
                when: () => ['Component', 'Page'].includes(type)
            },
            {
                type: 'confirm',
                name: 'useCSSModule',
                message: 'Use CSS Modules?',
                default: config.useCSSModule || false,
                when: () => ['Component', 'Page'].includes(type)
            }
        ]);

        const mergedOptions = {
            componentName,
            useTypeScript,
            styleExtension,
            createTest,
            useCSSModule,
            customPath: cliOptions?.path || config?.path || null,
            useCurrent: cliOptions?.current || false,
            type
        };

        createFiles(mergedOptions);
    } catch (error) {
        if (error?.constructor?.name === 'ExitPromptError') {
            console.log('Prompt cancelled by user.');
        } else {
            console.error('An unexpected error occurred:', error);
        }
    }
}

// CLI entry point
program
    .name('react-generate')
    .description('Interactive generator for React components, pages, context, and providers')
    .option('-p, --path <path>', 'Custom path to place the generated file(s)')
    .option('-c, --current', 'Use current directory (e.g., inside /src/components)')
    .action((options) => {
        promptUser(options);
    });

program.parse();
