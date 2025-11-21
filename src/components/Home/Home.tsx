import { useEffect, useState } from 'react';
import { dataService } from '../../api/DataService';
import { useAuthStore } from '../../store/useAuthStore';
import type { Profile, Project } from '../../types/DatabaseTypes';

export default function Home() {
  const session = useAuthStore((state) => state.session);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const [profileData, projectsData] = await Promise.all([
          dataService.getProfile(session.user.id),
          dataService.getProjects(session.user.id)
        ]);

        if (!profileData) {
           const newProfile = {
             id: session.user.id,
             FirstName: session.user.user_metadata.display_name || 'New',
             LastName: 'User',
           };
           
           const createdProfile = await dataService.upsertProfile(newProfile);
           setProfile(createdProfile);
        } else {
           setProfile(profileData);
        }

        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session?.user?.id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {profile?.FirstName} {profile?.LastName}</h1>
      
      <h2>My Projects</h2>
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <a href={project.project_link} target="_blank" rel="noreferrer">View Project</a>
          </div>
        ))}
      </div>
    </div>
  );
}