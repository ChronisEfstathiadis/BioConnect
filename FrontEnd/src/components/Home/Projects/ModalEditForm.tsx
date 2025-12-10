import { useEffect, useState } from "react";
import styles from "./Projects.module.css";
import { getProjectById, updateProject } from "../../../api/Projects";
import type { Project } from "../../../Types/ProfileTypes";

export const ModalEditForm = ({
  setIsModalOpen,
  projectId,
  onProjectUpdated,
}: {
  setIsModalOpen: (isOpen: boolean) => void;
  projectId: number;
  onProjectUpdated?: () => void;
}) => {
  const [formData, setFormData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const project = await getProjectById(projectId);
        setFormData(project);
      } catch (err) {
        setError("Failed to load project");
        console.error("Error fetching project:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: Project | null) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    try {
      setIsSaving(true);
      setError(null);
      await updateProject(formData);

      // Call the callback to refresh the projects list
      if (onProjectUpdated) {
        onProjectUpdated();
      }

      // Close the modal
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to update project");
      console.error("Error updating project:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.modalForm}>
        <div className={styles.loading}>Loading project...</div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className={styles.modalForm}>
        <div className={styles.error}>{error}</div>
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setIsModalOpen(false)}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalForm}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Project Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData?.title || ""}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter project title"
            required
            disabled={isSaving}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData?.description || ""}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Enter project description"
            rows={4}
            required
            disabled={isSaving}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="project_link" className={styles.label}>
            Project URL
          </label>
          <input
            type="url"
            id="project_link"
            name="project_link"
            value={formData?.project_link || ""}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="https://example.com"
            required
            disabled={isSaving}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="appear" className={styles.label}>
            <input
              type="checkbox"
              id="appear"
              name="IsAppear"
              checked={formData?.IsAppear || false}
              onChange={handleInputChange}
              className={styles.checkbox}
              disabled={isSaving}
            />{" "}
            Appear in Portfolio
          </label>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setIsModalOpen(false)}
            disabled={isSaving}>
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};
