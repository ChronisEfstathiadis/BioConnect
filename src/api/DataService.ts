import { supabase } from '../supabaseClient';
import type { Profile, Service, SocialLink, Project } from '../types/DatabaseTypes';

class DataService {
  // --- Profile Operations ---
  
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('Profile')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Changed from .single() to .maybeSingle()
    
    if (error) throw error;
    return data as Profile | null;
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('Profile')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }

  async upsertProfile(profile: Profile) {
    const { data, error } = await supabase
      .from('Profile')
      .upsert(profile)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }

  // --- Services Operations ---

  async getServices(userId: string) {
    const { data, error } = await supabase
      .from('Services')
      .select('*')
      .eq('profile_id', userId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as Service[];
  }

  async createService(service: Omit<Service, 'id'>) {
    const { data, error } = await supabase
      .from('Services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  }

  async updateService(id: number, updates: Partial<Service>) {
    const { data, error } = await supabase
      .from('Services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  }

  async deleteService(id: number) {
    const { error } = await supabase
      .from('Services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // --- SocialLinks Operations ---

  async getSocialLinks(userId: string) {
    const { data, error } = await supabase
      .from('SocialLinks')
      .select('*')
      .eq('profile_id', userId);

    if (error) throw error;
    return data as SocialLink[];
  }

  async createSocialLink(link: Omit<SocialLink, 'id'>) {
    const { data, error } = await supabase
      .from('SocialLinks')
      .insert(link)
      .select()
      .single();

    if (error) throw error;
    return data as SocialLink;
  }

  async updateSocialLink(id: number, updates: Partial<SocialLink>) {
    const { data, error } = await supabase
      .from('SocialLinks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SocialLink;
  }

  async deleteSocialLink(id: number) {
    const { error } = await supabase
      .from('SocialLinks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // --- Projects Operations ---

  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('Projects')
      .select('*')
      .eq('profile_id', userId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as Project[];
  }

  async createProject(project: Omit<Project, 'id'>) {
    const { data, error } = await supabase
      .from('Projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async updateProject(id: number, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('Projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async deleteProject(id: number) {
    const { error } = await supabase
      .from('Projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const dataService = new DataService();
export default dataService;
