export interface Container {
  id: string;
  team_leader: string;
  customer_name: string;
  container_type: string;
  stage: string;
  expected_date: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Cabin {
  id: string;
  customer_name: string; // stored in backend's startDate field
  team_no: string;
  cabin_type: string;
  stage: string;
  expected_date: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Painting {
  id: string;
  team_no: string;
  customer_name: string;
  interior_colour: string;
  exterior_colour: string;
  stage: string;
  expected_date: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Parking {
  id: string;
  customer_name: string;
  waiting_for: string;
  entry_date: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Underpart {
  id: string;
  team_name: string;
  customer_name: string;
  work_status: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  vehicle_no: string;
  customer_name: string;
  delivery_date: string;
  driver_name: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export type WorkshopRole = "manager" | "ceo";
