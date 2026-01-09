import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  featured_image: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  files?: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  created_at: string;
}

export interface ProjectFormData {
  title: string;
  description?: string;
  content?: string;
  featured_image?: string;
  status: string;
}

export const useProjects = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const loadProjects = async (): Promise<Project[]> => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error loading projects:", err);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
      return [];
    }
  };

  const loadPublishedProjects = async (): Promise<Project[]> => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error loading published projects:", err);
      return [];
    }
  };

  const loadProject = async (projectId: string): Promise<Project | null> => {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;

      // Load files
      const { data: files } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId);

      return { ...project, files: files || [] };
    } catch (err) {
      console.error("Error loading project:", err);
      return null;
    }
  };

  const createProject = async (formData: ProjectFormData, userId: string): Promise<Project | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: formData.title,
          description: formData.description || null,
          content: formData.content || null,
          featured_image: formData.featured_image || null,
          status: formData.status,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      return data;
    } catch (err) {
      console.error("Error creating project:", err);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, formData: ProjectFormData): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          description: formData.description || null,
          content: formData.content || null,
          featured_image: formData.featured_image || null,
          status: formData.status,
        })
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      return true;
    } catch (err) {
      console.error("Error updating project:", err);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Project deleted successfully",
      });

      return true;
    } catch (err) {
      console.error("Error deleting project:", err);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadFile = async (
    projectId: string,
    file: File,
    userId: string
  ): Promise<ProjectFile | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${projectId}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("project-files")
        .getPublicUrl(fileName);

      // Create file record
      const { data: fileRecord, error: recordError } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_url: publicUrlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      return fileRecord;
    } catch (err) {
      console.error("Error uploading file:", err);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteFile = async (fileId: string, fileUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split("/project-files/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("project-files").remove([filePath]);
      }

      // Delete record
      const { error } = await supabase
        .from("project_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "File deleted successfully",
      });

      return true;
    } catch (err) {
      console.error("Error deleting file:", err);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loading,
    loadProjects,
    loadPublishedProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    uploadFile,
    deleteFile,
  };
};
