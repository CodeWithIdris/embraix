import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, Image, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileAttachmentProps {
  userId: string;
  ticketId?: string;
  onFilesChange: (urls: string[]) => void;
  existingFiles?: string[];
  maxFiles?: number;
}

export const FileAttachment = ({
  userId,
  ticketId,
  onFilesChange,
  existingFiles = [],
  maxFiles = 5,
}: FileAttachmentProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>(existingFiles);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only attach up to ${maxFiles} files`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(selectedFiles)) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        continue;
      }

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${userId}/${ticketId || "new"}/${timestamp}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("consultation-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("consultation-files")
        .getPublicUrl(filePath);

      newUrls.push(urlData.publicUrl);
    }

    const updatedFiles = [...files, ...newUrls];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (urlToRemove: string) => {
    // Extract file path from URL
    const urlParts = urlToRemove.split("/consultation-files/");
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from("consultation-files").remove([filePath]);
    }

    const updatedFiles = files.filter((url) => url !== urlToRemove);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (url: string) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    return isImage ? Image : FileText;
  };

  const getFileName = (url: string) => {
    const parts = url.split("/");
    const fullName = parts[parts.length - 1];
    // Remove timestamp prefix
    const nameParts = fullName.split("_");
    if (nameParts.length > 1) {
      return nameParts.slice(1).join("_");
    }
    return fullName;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || files.length >= maxFiles}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Paperclip className="w-4 h-4 mr-2" />
              Attach Files
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          {files.length}/{maxFiles} files (max 10MB each)
        </span>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((url, index) => {
            const FileIcon = getFileIcon(url);
            const fileName = getFileName(url);
            
            return (
              <div
                key={index}
                className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg text-sm"
              >
                <FileIcon className="w-4 h-4 text-primary" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary truncate max-w-[150px]"
                  title={fileName}
                >
                  {fileName}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(url)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
