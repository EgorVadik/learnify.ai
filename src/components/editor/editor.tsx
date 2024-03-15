'use client'

import { MDXEditor, type MDXEditorMethods } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { ALL_PLUGINS } from './config'
import { useEffect, useRef, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { currentFileAtom, markdownAtom } from '@/atoms'
import { saveNote } from '@/actions/notes'
import { toast } from 'sonner'

export const Editor = () => {
    const [mounted, setMounted] = useState(false)
    const editorRef = useRef<MDXEditorMethods>(null)
    const [markdown, setMarkdown] = useAtom(markdownAtom)
    const currentFile = useAtomValue(currentFileAtom)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className='w-full flex-1'>
            <MDXEditor
                ref={editorRef}
                markdown={markdown}
                onChange={(md) => setMarkdown(md)}
                placeholder={
                    currentFile == null
                        ? 'Select a note to start'
                        : 'Start writing your note...'
                }
                autoFocus
                plugins={ALL_PLUGINS}
                contentEditableClassName='w-full max-w-none text-lg px-8 py-5 prose shadow-md min-h-[90vh]'
                onError={(error) => console.log('error', { error })}
                // readOnly={!currentFile}
                suppressHtmlProcessing
            />
            <button
                disabled={!currentFile}
                onClick={async () => {
                    const res = await saveNote({
                        id: currentFile ?? '',
                        content: editorRef.current?.getMarkdown() ?? '',
                    })

                    if (!res.success) {
                        toast.error(res.error)
                        return
                    }

                    toast.success('Note saved')
                }}
            >
                Save
            </button>
        </div>
    )
}
