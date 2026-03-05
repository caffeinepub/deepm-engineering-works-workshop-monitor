export interface Container {
  id: string;
  team_leader: string;
  customer_name: string;
  custom_name: string;
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
  custom_name: string;
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
  custom_name: string;
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
  custom_name: string;
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
  custom_name: string;
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
  custom_name: string;
  team_name: string;
  delivery_date: string;
  driver_name: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  section: string;
  customer_name: string;
  assigned_team: string;
  description: string;
  status: string; // "Pending" | "In Progress" | "Completed" | "On Hold"
  week_label: string;
  expected_date: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export type WorkshopRole = "manager" | "ceo";

export interface DailyUpdate {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: string; // "Morning" | "Evening"
  section: string; // "Container" | "Cabin" | "Painting" | "Parking" | "Underparts" | "Delivery"
  work_done: string;
  stage_progress: string;
  delays: string;
  notes: string;
  photos: string[];
  created_at: string;
  status: string; // "active" | "archived_weekly" | "archived_monthly"
  week_label: string;
  month_label: string;
}

export interface WeeklyReport {
  id: string;
  week_label: string;
  week_start: string;
  week_end: string;
  month_label: string;
  year: number;
  month: number;
  week_number: number;
  container_summary: string;
  cabin_summary: string;
  painting_summary: string;
  parking_summary: string;
  underparts_summary: string;
  overall_notes: string;
  total_updates: number;
  status: string; // "active" | "archived_monthly"
  created_at: string;
  archived_at: string;
}

export interface MonthlyArchive {
  id: string;
  year: number;
  month: number;
  month_label: string;
  week_labels: string[];
  total_containers: number;
  total_cabins: number;
  total_paintings: number;
  total_parkings: number;
  total_underparts: number;
  total_delays: number;
  overall_summary: string;
  created_at: string;
}
