import { useEffect, useState, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import ChatProductCards from "./ChatProductCards";

interface StreamingTextProps {
  content: string;
  isComplete: boolean;
}

// Parse content to extract [PRODUCTS:slug1,slug2,...] markers
const PRODUCT_MARKER_REGEX = /\[PRODUCTS?:([^\]]+)\]/g;

function parseContentWithProducts(text: string): Array<{ type: "text"; value: string } | { type: "products"; slugs: string[] }> {
  const parts: Array<{ type: "text"; value: string } | { type: "products"; slugs: string[] }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(PRODUCT_MARKER_REGEX);
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const slugs = match[1].split(",").map(s => s.trim()).filter(Boolean);
    if (slugs.length > 0) {
      parts.push({ type: "products", slugs });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

const MarkdownBlock = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
      strong: ({ children }) => <span className="font-semibold text-foreground">{children}</span>,
      em: ({ children }) => <span className="italic">{children}</span>,
      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
      li: ({ children }) => <li className="mb-0.5">{children}</li>,
      h3: ({ children }) => <h3 className="font-display font-semibold text-sm mt-3 mb-1">{children}</h3>,
      code: ({ children }) => (
        <code className="bg-secondary/80 rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

const StreamingText = ({ content, isComplete }: StreamingTextProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const prevContentRef = useRef("");
  const animFrameRef = useRef<number>();
  const indexRef = useRef(0);

  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (isComplete) {
      setDisplayedContent(content);
      indexRef.current = content.length;
      prevContentRef.current = content;
      return;
    }

    if (content.length > prevContentRef.current.length) {
      const newContent = content;
      const startFrom = prevContentRef.current.length;

      if (startFrom === 0) {
        setDisplayedContent(newContent);
        indexRef.current = newContent.length;
        prevContentRef.current = newContent;
        return;
      }

      let i = startFrom;
      const animate = () => {
        if (i < newContent.length) {
          const chunkSize = Math.min(3, newContent.length - i);
          i += chunkSize;
          setDisplayedContent(newContent.slice(0, i));
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayedContent(newContent);
          indexRef.current = newContent.length;
        }
      };
      animFrameRef.current = requestAnimationFrame(animate);
      prevContentRef.current = newContent;
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [content, isComplete]);

  useEffect(() => {
    if (content.length < prevContentRef.current.length) {
      setDisplayedContent(content);
      prevContentRef.current = content;
      indexRef.current = content.length;
    }
  }, [content]);

  const textToRender = displayedContent || content;
  const parts = useMemo(() => parseContentWithProducts(textToRender), [textToRender]);

  // If no product markers, render simple markdown
  if (parts.length === 1 && parts[0].type === "text") {
    return <MarkdownBlock content={textToRender} />;
  }

  return (
    <div>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <MarkdownBlock key={i} content={part.value} />
        ) : (
          <ChatProductCards key={`products-${i}`} slugs={part.slugs} />
        )
      )}
    </div>
  );
};

export default StreamingText;
