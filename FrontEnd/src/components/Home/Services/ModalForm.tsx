import { useState } from "react";
import styles from "./Services.module.css";

interface FormData {
  title: string;
  description: string;
}

export const ModalForm = ({
  onSubmit,
  setIsModalOpen,
}: {
  onSubmit: (formData: FormData) => void; // ✅ Change to accept formData
  setIsModalOpen: (isOpen: boolean) => void;
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // ✅ Pass formData to parent
  };

  return (
    <div className={styles.modalForm}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Service Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter service title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Enter service description"
            rows={4}
            required
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(false);
              setFormData({ title: "", description: "" }); // Reset form
            }}
            className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.saveButton}>
            Save Service
          </button>
        </div>
      </form>
    </div>
  );
};
