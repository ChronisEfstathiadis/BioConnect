import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProfileById } from "../../api/Profile";
import type {
  ProfileId,
  Job,
  Service,
  Project,
  SocialLink,
} from "../../Types/ProfileTypes";
import styles from "./PublicProfile.module.css";
import { IoPersonSharp } from "react-icons/io5";
import { FaEnvelope, FaPhone, FaExternalLinkAlt } from "react-icons/fa";
import { SiGithub, SiX } from "react-icons/si";
import {
  FaLinkedin,
  FaTiktok,
  FaDiscord,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const PlatformIcons: Record<string, React.ReactNode> = {
  GitHub: <SiGithub />,
  LinkedIn: <FaLinkedin />,
  TikTok: <FaTiktok />,
  Discord: <FaDiscord />,
  Facebook: <FaFacebook />,
  Instagram: <FaInstagram />,
  X: <SiX />,
};

export const PublicProfile = () => {
  const { profileId } = useParams();
  const [profile, setProfile] = useState<ProfileId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfileById(profileId as string);
        setProfile(profile as ProfileId);
        setLoading(false);
      } catch (error) {
        setError(error as string);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Profile not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.banner}></div>

        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.FirstName} ${profile.LastName}`}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <IoPersonSharp size={64} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>
            {profile.FirstName} {profile.LastName}
          </h1>

          {profile.jobs && profile.jobs.length > 0 && (
            <p className={styles.title}>
              {profile.jobs.map((job: Job) => job.title).join(" • ")}
            </p>
          )}

          <div className={styles.contactInfo}>
            {profile.email && (
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className={styles.contactItem}>
                <FaPhone className={styles.contactIcon} />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {profile.social_links && profile.social_links.length > 0 && (
            <div className={styles.socialLinks}>
              {profile.social_links.map((link: SocialLink) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  title={link.platform}>
                  {PlatformIcons[link.platform] || <FaExternalLinkAlt />}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Services Section */}
        {profile.services && profile.services.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Services</h2>
            <div className={styles.servicesList}>
              {profile.services.map((service: Service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <h3 className={styles.itemTitle}>{service.title}</h3>
                  {service.description && (
                    <p className={styles.itemDescription}>
                      {service.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            <div className={styles.projectsList}>
              {profile.projects.map((project: Project) => (
                <div key={project.id} className={styles.projectItem}>
                  {!project.IsAppear && (
                    <>
                      <div className={styles.projectHeader}>
                        <h3 className={styles.itemTitle}>{project.title}</h3>
                        {project.project_link && (
                          <a
                            href={project.project_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.projectLink}>
                            <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className={styles.itemDescription}>
                          {project.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
