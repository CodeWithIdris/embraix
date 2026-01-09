import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects, Project, ProjectFormData, ProjectFile } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import RichTextEditor from "@/components/blog/RichTextEditor";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Rocket,
  CheckCircle,
  FileText,
  Upload,
  File,
  X,
  ExternalLink,
} from "lucide-react";

export const ProjectsManager = () => {
  const { user } = useAuth();
  const {
    loading,
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    uploadFile,
    deleteFile,
  } = useProjects();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    content: "",
    featured_image: "",
    status: "draft",
  });

  useEffect(() => {
    loadAllProjects();
  }, []);

  const loadAllProjects = async () => {
    setLoadingProjects(true);
    const data = await loadProjects();
    setProjects(data);
    setLoadingProjects(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      featured_image: "",
      status: "draft",
    });
    setEditingProject(null);
    setProjectFiles([]);
  };

  const handleEdit = async (project: Project) => {
    const fullProject = await loadProject(project.id);
    if (fullProject) {
      setEditingProject(fullProject);
      setFormData({
        title: fullProject.title,
        description: fullProject.description || "",
        content: fullProject.content || "",
        featured_image: fullProject.featured_image || "",
        status: fullProject.status,
      });
      setProjectFiles(fullProject.files || []);
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.title) return;

    if (editingProject) {
      const success = await updateProject(editingProject.id, formData);
      if (success) {
        setIsDialogOpen(false);
        resetForm();
        loadAllProjects();
      }
    } else {
      const result = await createProject(formData, user.id);
      if (result) {
        setIsDialogOpen(false);
        resetForm();
        loadAllProjects();
      }
    }
  };

  const handleDelete = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const success = await deleteProject(projectId);
      if (success) {
        setProjects(projects.filter((p) => p.id !== projectId));
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !editingProject) return;

    setUploading(true);
    const uploadedFile = await uploadFile(editingProject.id, file, user.id);
    if (uploadedFile) {
      setProjectFiles([...projectFiles, uploadedFile]);
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileDelete = async (fileId: string, fileUrl: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      const success = await deleteFile(fileId, fileUrl);
      if (success) {
        setProjectFiles(projectFiles.filter((f) => f.id !== fileId));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-primary/20 text-primary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Project title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <div className="mt-1">
                  <RichTextEditor
                    value={formData.content || ""}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Write your project details..."
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Featured Image URL (optional)
                </label>
                <Input
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData({ ...formData, featured_image: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              {/* File Upload Section - Only for editing */}
              {editingProject && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Project Files</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {projectFiles.length > 0 ? (
                    <div className="space-y-2">
                      {projectFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded bg-secondary/30"
                        >
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">
                              {file.file_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.file_size)})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.file_url, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleFileDelete(file.id, file.file_url)
                              }
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No files uploaded yet
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={loading || !formData.title}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loadingProjects ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No projects yet. Create your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="gradient-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg font-display">
                    {project.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {project.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
