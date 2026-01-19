import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ProviderProject = Database["public"]["Tables"]["provider_projects"]["Row"];

interface ProjectCardProps {
  project: ProviderProject;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="gradient-card border-border/50 overflow-hidden group">
      {project.images && project.images.length > 0 && (
        <div className="h-48 overflow-hidden">
          <img
            src={project.images[0]}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">{project.title}</CardTitle>
        {project.client_name && (
          <p className="text-sm text-muted-foreground">Client: {project.client_name}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {project.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location}
            </div>
          )}
          {project.completion_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(project.completion_date), "MMM yyyy")}
            </div>
          )}
        </div>

        {project.images && project.images.length > 1 && (
          <div className="flex gap-1">
            {project.images.slice(1, 4).map((img, idx) => (
              <div key={idx} className="w-12 h-12 rounded overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {project.images.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{project.images.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
