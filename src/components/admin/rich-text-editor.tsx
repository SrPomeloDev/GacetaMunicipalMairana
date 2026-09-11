"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { isSafeUrl } from "@/lib/sanitize"

interface RichTextEditorProps {
  value: string | null
  onChange: (html: string) => void
  label?: string
}

export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[220px] outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = value ?? ""
    if (next !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="space-y-2">
        {label ? <Label>{label}</Label> : null}
        <div className="rounded-lg border border-input bg-background">
          <div className="h-11 border-b border-border bg-muted/40" />
          <div className="min-h-[220px] px-3 py-2" />
        </div>
      </div>
    )
  }

  const btnClass = "h-8 w-8 shrink-0 p-0"
  const activeClass = "bg-accent text-accent-foreground"

  const handleLink = () => {
    const prev: string = editor.getAttributes("link").href ?? ""
    const url = window.prompt("URL del enlace", prev)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    if (!isSafeUrl(url)) {
      window.alert("URL no permitida por seguridad. Usa http(s)://, /ruta o #ancla.")
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      <div className="overflow-hidden rounded-lg border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Negrita"
            title="Negrita"
            className={cn(btnClass, editor.isActive("bold") && activeClass)}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Cursiva"
            title="Cursiva"
            className={cn(btnClass, editor.isActive("italic") && activeClass)}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Encabezado 2"
            title="Encabezado 2"
            className={cn(btnClass, editor.isActive("heading", { level: 2 }) && activeClass)}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Encabezado 3"
            title="Encabezado 3"
            className={cn(btnClass, editor.isActive("heading", { level: 3 }) && activeClass)}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Lista con viñetas"
            title="Lista con viñetas"
            className={cn(btnClass, editor.isActive("bulletList") && activeClass)}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Lista numerada"
            title="Lista numerada"
            className={cn(btnClass, editor.isActive("orderedList") && activeClass)}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Cita"
            title="Cita"
            className={cn(btnClass, editor.isActive("blockquote") && activeClass)}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Enlace"
            title="Enlace"
            className={cn(btnClass, editor.isActive("link") && activeClass)}
            onClick={handleLink}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Deshacer"
            title="Deshacer"
            className={btnClass}
            disabled={!editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Rehacer"
            title="Rehacer"
            className={btnClass}
            disabled={!editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <EditorContent
          editor={editor}
          className="px-3 py-2 text-sm leading-relaxed [&_.tiptap]:outline-none [&_.tiptap_a]:text-primary [&_.tiptap_a]:underline [&_.tiptap_blockquote]:my-2 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-border [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_h2]:mb-2 [&_.tiptap_h2]:mt-4 [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-bold [&_.tiptap_h3]:mb-1 [&_.tiptap_h3]:mt-3 [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_li]:my-0.5 [&_.tiptap_ol]:my-2 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_p]:my-2 [&_.tiptap_ul]:my-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6"
        />
      </div>
    </div>
  )
}
