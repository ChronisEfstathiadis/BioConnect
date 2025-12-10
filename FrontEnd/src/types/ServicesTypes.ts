export interface Service {
  id?: number; // int8
  profile_id: string; // uuid
  title: string;
  description?: string;
  sort_order?: number;
  IsAppear: boolean;
}
