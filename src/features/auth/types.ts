export interface Profile {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
  role: 'senior' | 'junior';
  name?: string;
  birth_year?: number;
  gender?: 'male' | 'female' | 'other';
  phone_number?: string;
  address?: string;
}

export interface UserWithProfile {
  id: string;
  email?: string;
  profile?: Profile;
} 