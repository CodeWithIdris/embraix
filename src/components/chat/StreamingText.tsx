import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface StreamingTextProps {
  content: string;
  isComplete: boolean;
}

const StreamingText = ({ content, isComplete }: StreamingTextProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const prevContentRef = useRef("");
  const animFrameRef = useRef<number>();
  const indexRef = useRef(0);

  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Always show the full content - no animation truncation risk
    if (isComplete) {
      setDisplayedContent(content);
      indexRef.current = content.length;
      prevContentRef.current = content;
      return;
    }

    // If content grew (streaming from API), animate the new chars
    if (content.length > prevContentRef.current.length) {
      const newContent = content;
      const startFrom = prevContentRef.current.length;
      
      if (startFrom === 0) {
        setDisplayedContent(newContent);
        indexRef.current = newContent.length;
        prevContentRef.current = newContent;
        return;
      }

      // Animate new characters rapidly
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

  // Reset when content is completely new (different conversation)
  useEffect(() => {
    if (content.length < prevContentRef.current.length) {
      setDisplayedContent(content);
      prevContentRef.current = content;
      indexRef.current = content.length;
    }
  }, [content]);

  return (
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
      {displayedContent || content}
    </ReactMarkdown>
  );
};

export default StreamingText;
