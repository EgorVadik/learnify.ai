import React from 'react'
import {
    diffSourcePlugin,
    markdownShortcutPlugin,
    frontmatterPlugin,
    headingsPlugin,
    imagePlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    SandpackConfig,
    codeBlockPlugin,
    codeMirrorPlugin,
    sandpackPlugin,
    KitchenSinkToolbar,
    ALL_HEADING_LEVELS,
} from '@mdxeditor/editor'

const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim()

export const virtuosoSampleSandpackConfig: SandpackConfig = {
    defaultPreset: 'react',
    presets: [
        {
            label: 'React',
            name: 'react',
            meta: 'live react',
            sandpackTemplate: 'react',
            sandpackTheme: 'light',
            snippetFileName: '/App.js',
            snippetLanguage: 'jsx',
            initialSnippetContent: defaultSnippetContent,
        },
    ],
}

export async function expressImageUploadHandler(image: File) {
    const formData = new FormData()
    formData.append('image', image)
    const response = await fetch('/uploads/new', {
        method: 'POST',
        body: formData,
    })
    const json = (await response.json()) as { url: string }
    return json.url
}

export const ALL_PLUGINS = [
    toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: ALL_HEADING_LEVELS }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
        imageUploadHandler: async () =>
            Promise.resolve('https://picsum.photos/200/300'),
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
    sandpackPlugin({ sandpackConfig: virtuosoSampleSandpackConfig }),
    codeMirrorPlugin({
        codeBlockLanguages: {
            js: 'JavaScript',
            css: 'CSS',
            txt: 'Plain Text',
            tsx: 'TypeScript',
            py: 'Python',
            '': 'Unspecified',
        },
    }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
    markdownShortcutPlugin(),
]
