'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Bold from '@tiptap/extension-bold'
import { Button } from './button'
import { Bold as BoldIcon, List, Type } from 'lucide-react'
import { useEffect, useState } from 'react'

const RichTextEditor = ({ value, onChange }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [StarterKit, BulletList, ListItem, Bold],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const json = {
        type: 'doc',
        content: editor.getJSON().content,
      }
      onChange({ html, json })
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none max-w-none',
      },
    },
    immediatelyRender: false,
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [editor, value])

  if (!editor || !isMounted) {
    return null
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 ${
            editor.isActive('bold')
              ? 'bg-slate-200 dark:bg-slate-700'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 ${
            editor.isActive('bulletList')
              ? 'bg-slate-200 dark:bg-slate-700'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.commands.setHardBreak()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none p-4 min-h-[200px]"
      />
    </div>
  )
}

export default RichTextEditor
