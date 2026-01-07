import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2,
  Link,
  Code
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Configure DOMPurify to allow safe HTML tags for blog content
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'span', 'div'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
};

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, sanitizeConfig);
};

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      const sanitizedValue = sanitizeHtml(value);
      if (editorRef.current.innerHTML !== sanitizedValue) {
        editorRef.current.innerHTML = sanitizedValue;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      // Sanitize content before passing to onChange
      const sanitizedContent = sanitizeHtml(editorRef.current.innerHTML);
      onChange(sanitizedContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertHeading = (level: 1 | 2) => {
    const tag = level === 1 ? 'h2' : 'h3';
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    handleInput();
  };

  const toolbarButtons = [
    { icon: Bold, action: () => execCommand('bold'), title: 'Bold' },
    { icon: Italic, action: () => execCommand('italic'), title: 'Italic' },
    { icon: Heading1, action: () => insertHeading(1), title: 'Heading 1' },
    { icon: Heading2, action: () => insertHeading(2), title: 'Heading 2' },
    { icon: List, action: () => execCommand('insertUnorderedList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => execCommand('insertOrderedList'), title: 'Numbered List' },
    { icon: Quote, action: () => execCommand('formatBlock', 'blockquote'), title: 'Quote' },
    { icon: Code, action: () => execCommand('formatBlock', 'pre'), title: 'Code Block' },
    { 
      icon: Link, 
      action: () => {
        const url = prompt('Enter URL:');
        if (url) execCommand('createLink', url);
      }, 
      title: 'Insert Link' 
    },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-secondary/30 border-b border-border">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.title}
            className="h-8 w-8 p-0"
          >
            <button.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 prose prose-invert prose-sm max-w-none focus:outline-none bg-background"
        data-placeholder={placeholder}
        style={{
          '--tw-prose-body': 'hsl(var(--foreground))',
          '--tw-prose-headings': 'hsl(var(--foreground))',
          '--tw-prose-links': 'hsl(var(--primary))',
          '--tw-prose-bold': 'hsl(var(--foreground))',
          '--tw-prose-quotes': 'hsl(var(--muted-foreground))',
          '--tw-prose-code': 'hsl(var(--primary))',
        } as React.CSSProperties}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;