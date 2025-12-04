import { useState, useEffect } from "react";
import {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from "../../../api/SocialLinks";
import type { SocialLinksTypes } from "../../../Types/SocialLinksTypes";
import { Modal } from "../../Modal/Modal";
import { ModalForm } from "./ModalForm";
import styles from "./SocialLinks.module.css";

export const SocialLinks = ({ profile_id }: { profile_id: string }) => {
  const [socialLinks, setSocialLinks] = useState<SocialLinksTypes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (profile_id) {
      const fetchSocialLinks = async () => {
        try {
          const socialLinks = await getSocialLinks(profile_id);
          setSocialLinks(socialLinks);
        } catch (error) {
          setError("Failed to fetch social links");
          setSocialLinks([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSocialLinks();
    }
  }, [profile_id]);

  const handleCreateSocialLink = async (socialLink: SocialLinksTypes) => {
    try {
      const newSocialLink = await createSocialLink(socialLink);
      setSocialLinks([...socialLinks, newSocialLink]);
    } catch (error) {
      setError("Failed to create social link");
    }
  };

  const handleUpdateSocialLink = async (socialLink: SocialLinksTypes) => {
    try {
      const updatedSocialLink = await updateSocialLink(socialLink);
      setSocialLinks(
        socialLinks.map((s) => (s.id === socialLink.id ? updatedSocialLink : s))
      );
    } catch (error) {
      setError("Failed to update social link");
    }
  };

  const handleDeleteSocialLink = async (id: number) => {
    try {
      await deleteSocialLink(id);
      setSocialLinks(socialLinks.filter((s) => s.id !== id));
    } catch (error) {
      setError("Failed to delete social link");
    }
  };

  const handleSubmit = async (formData: { platform: string; url: string }) => {
    try {
      await handleCreateSocialLink({
        id: 0,
        platform: formData.platform,
        url: formData.url,
        profile_id: profile_id,
      });
      setIsModalOpen(false);
    } catch (error) {
      setError(
        `Failed to create social link: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className={styles.socialLinksContainer}>
      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.socialLinksList}>
          <h2 className={styles.sectionTitle}>Social Links</h2>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}>
            + Add Social Link
          </button>
          {socialLinks
            .filter((socialLink) => socialLink != null)
            .map((socialLink: SocialLinksTypes) => (
              <div
                key={String(socialLink?.id)}
                className={styles.socialLinkItem}>
                <h3>{socialLink?.platform || "Untitled"}</h3>
                <p>{socialLink?.url || ""}</p>
                <div className={styles.socialLinkActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleUpdateSocialLink(socialLink)}>
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() =>
                      handleDeleteSocialLink(Number(socialLink?.id))
                    }>
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
        title="Add New Social Link"
        size="medium">
        <ModalForm onSubmit={handleSubmit} setIsModalOpen={setIsModalOpen} />
      </Modal>
    </div>
  );
};

export default SocialLinks;
