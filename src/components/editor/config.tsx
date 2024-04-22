import React from 'react'
import {
    diffSourcePlugin,
    markdownShortcutPlugin,
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
    ALL_HEADING_LEVELS,
    DiffSourceToggleWrapper,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    Separator,
    CodeToggle,
    ListsToggle,
    CreateLink,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    InsertCodeBlock,
    InsertSandpack,
} from '@mdxeditor/editor'
import { toast } from 'sonner'

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

export async function imageUploadHandler(image: File) {
    if (image?.size > 1024 * 1024 * 1) {
        toast.error('Image is too large max size is 1MB')
        return 'https://files.edgestore.dev/pmsd9au5sbv925v8/notes/_public/b297423a-5628-420f-9848-100f01a28b12.png'
    }

    const formData = new FormData()
    formData.append('image', image)

    toast.info('Uploading image...')
    const response = await fetch('/api/upload-notes-img', {
        method: 'POST',
        body: formData,
    })

    if (response.ok) {
        const json = (await response.json()) as { url: string }
        return json.url
    }

    const error = await response.json()
    toast.error(error?.error ?? 'Failed to upload image')
    return 'https://files.edgestore.dev/pmsd9au5sbv925v8/notes/_public/b297423a-5628-420f-9848-100f01a28b12.png'
}

export const ALL_PLUGINS = (markdown: string) => [
    toolbarPlugin({
        toolbarContents: () => (
            <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <Separator />
                <ListsToggle />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <InsertImage />
                <Separator />
                <InsertTable />
                <InsertThematicBreak />
                <Separator />
                <InsertCodeBlock />
                <InsertSandpack />
            </DiffSourceToggleWrapper>
        ),
    }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: ALL_HEADING_LEVELS }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
        imageUploadHandler,
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
    sandpackPlugin({ sandpackConfig: virtuosoSampleSandpackConfig }),
    codeMirrorPlugin({
        codeBlockLanguages: {
            js: 'JavaScript',
            ts: 'TypeScript',
            css: 'CSS',
            txt: 'Plain Text',
            tsx: 'TypeScript',
            py: 'Python',
            '': 'Unspecified',
        },
    }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: markdown }),
    markdownShortcutPlugin(),
]
