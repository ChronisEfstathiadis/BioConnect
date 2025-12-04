import { useState } from "react";
import styles from "./SocialLinks.module.css";
import { PlatformIcons } from "./PlatformIcons";

interface FormData {
  platform: string;
  url: string;
}

export const ModalForm = ({
  onSubmit,
  setIsModalOpen,
}: {
  onSubmit: (formData: FormData) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}) => {
  const [formData, setFormData] = useState<FormData>({
    platform: "",
    url: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlatformSelect = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: platform,
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalForm}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="platform" className={styles.label}>
            Platform
          </label>
          <div className={styles.customSelect}>
            <button
              type="button"
              className={styles.selectButton}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {formData.platform ? (
                <span className={styles.selectButtonContent}>
                  <span className={styles.selectIcon}>
                    {
                      PlatformIcons[
                        formData.platform as keyof typeof PlatformIcons
                      ]
                    }
                  </span>
                  <span className={styles.selectText}>{formData.platform}</span>
                </span>
              ) : (
                <span className={styles.selectPlaceholder}>
                  Select platform
                </span>
              )}
              <span className={styles.selectArrow}>▼</span>
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                {Object.keys(PlatformIcons).map((platform) => (
                  <div
                    key={platform}
                    className={styles.dropdownOption}
                    onClick={() => handlePlatformSelect(platform)}>
                    <span className={styles.optionIcon}>
                      {PlatformIcons[platform as keyof typeof PlatformIcons]}
                    </span>
                    <span className={styles.optionText}>{platform}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="url" className={styles.label}>
            URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter URL"
            required
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(false);
              setFormData({ platform: "", url: "" });
            }}
            className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.saveButton}>
            Save Social Link
          </button>
        </div>
      </form>
    </div>
  );
};
