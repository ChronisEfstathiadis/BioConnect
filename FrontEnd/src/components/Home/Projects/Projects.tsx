import { useEffect, useState } from "react";
import type { Project } from "../../../types/ProjectsTypes";
import {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
} from "../../../api/Projects/Projects";
import { Modal } from "../../Modal/Modal";
import styles from "./Projects.module.css";
import { ModalForm } from "./ModalForm";

export const Projects = ({ profile_id }: { profile_id: string }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (profile_id) {
      const fetchProjects = async () => {
        try {
          const projects = await getProjects(profile_id);
          setProjects(Array.isArray(projects) ? projects : []);
        } catch (error) {
          setError("Failed to fetch projects");
          setProjects([]);
        } finally {
          setLoading(false);
        }
      };
      fetchProjects();
    }
  }, [profile_id]);
  const handleAddProject = async (project: Project) => {
    try {
      const newProject = await createProject(project);

      if (!newProject) {
        throw new Error("Invalid response from server");
      }

      setProjects([...projects, newProject]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      setError(
        `Failed to add project: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    project_link: string;
  }) => {
    if (!profile_id) return;

    const newProject = {
      title: formData.title,
      description: formData.description,
      project_link: formData.project_link,
      sort_order: projects.length,
    } as Project;

    await handleAddProject(newProject);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects(projects.filter((project) => project.id !== id));
    } catch (error) {
      setError("Failed to delete project");
    }
  };
  const handleEditProject = async (project: Project) => {
    try {
      await updateProject(project);
      setProjects(projects.map((p) => (p.id === project.id ? project : p)));
    } catch (error) {
      setError("Failed to edit project");
    }
  };

  return (
    <div className={styles.projectsContainer}>
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.projectsList}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}>
            + Add Project
          </button>
          {projects
            .filter((project) => project != null)
            .map((project: Project) => (
              <div key={String(project?.id)} className={styles.projectItem}>
                <h3>{project?.title || "Untitled"}</h3>
                <p>{project?.description || ""}</p>
                <a
                  href={project?.project_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer">
                  {project?.project_link || ""}
                </a>
                <div className={styles.projectActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditProject(project)}>
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteProject(String(project?.id))}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title="Add New Project"
        size="medium">
        <ModalForm onSubmit={handleSubmit} setIsModalOpen={setIsModalOpen} />
      </Modal>
    </div>
  );
};
