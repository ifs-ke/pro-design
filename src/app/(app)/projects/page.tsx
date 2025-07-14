import { getProjects, getClients, getProperties } from "@/lib/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PlusCircle, Building } from "lucide-react";
import { ProjectFormDialog } from "@/components/design/project-form";
import { ProjectCard } from "@/components/design/project-card";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default async function ProjectsPage() {
  const [projects, clients, properties] = await Promise.all([
    getProjects(),
    getClients(),
    getProperties()
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all your ongoing and completed projects.</p>
        </div>
        <ProjectFormDialog clients={clients} properties={properties}>
          <Button size="sm">
            <PlusCircle className="mr-2" />
            Create Project
          </Button>
        </ProjectFormDialog>
      </header>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardHeader>
            <Building className="mx-auto size-12 text-muted-foreground mb-4" />
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>Assign a quote to a new project or create one to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                <ProjectFormDialog clients={clients} properties={properties}>
                    <Button>Create Project</Button>
                </ProjectFormDialog>
                <Button variant="secondary" asChild>
                    <Link href="/quotes">Go to Quotes</Link>
                </Button>
              </div>
            </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} clients={clients} properties={properties} />
            ))}
        </motion.div>
      )}
    </div>
  );
}
