export type UserRole = "visitor" | "user" | "provider" | "admin";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  featured: boolean;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  latitude: number;
  longitude: number;
  virtual_services: boolean;
  social_links: SocialLinks;
  images: string[];
  verified: boolean;
  claimed: boolean;
  featured: boolean;
  specialties: string[];
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  npi_number?: string;
  source?: string;
  source_id?: string;
  source_url?: string;
  last_seen_at?: string;
}

export interface Retreat {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  city: string;
  state: string;
  date: string;
  duration: string;
  price?: string;
  organizer: string;
  website: string;
  booking_link: string;
  images: string[];
  category: string;
  featured: boolean;
  source?: string;
  source_id?: string;
  source_url?: string;
  phone?: string;
  rating?: number;
  review_count?: number;
  last_seen_at?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  state: string;
  organizer: string;
  website?: string;
  registration_url: string;
  images: string[];
  category: string;
  featured: boolean;
  source?: string;
  source_id?: string;
  source_url?: string;
  phone?: string;
  rating?: number;
  review_count?: number;
  last_seen_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface Review {
  id: string;
  provider_id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
  approved: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  state?: string;
  city?: string;
  virtual?: boolean;
  inPerson?: boolean;
  verified?: boolean;
  featured?: boolean;
  minRating?: number;
  specialty?: string;
}

export interface DiscoveryCard {
  title: string;
  description: string;
  href: string;
  icon: string;
}
