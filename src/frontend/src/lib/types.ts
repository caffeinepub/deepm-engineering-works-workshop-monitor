export interface Container {
  id: string;
  team_leader: string; // Raja, Vinoth, Ashok, Prasanth
  customer_name: string;
  container_type: string;
  stage: string; // Not Started, Basement, Door Rear End, Door Front End, Sidewall, Roofing
  expected_date: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Cabin {
  id: string;
  team_no: string; // 1,2,3,4,5
  cabin_type: string; // Straight Type, Karur Grill, Aerodynamic, Centered Glass, Curved Type
  stage: string; // Not Started, Cage Angle, Wood Chips, Back Plywood, Aluminium Sheet, Soset
  start_date: string;
  expected_date: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Painting {
  id: string;
  team_no: string; // 1, 2
  customer_name: string;
  interior_colour: string;
  exterior_colour: string;
  stage: string; // Not Started, Primer Done, Fully Painted
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
  team_name: string; // Mani, Thangavel
  customer_name: string;
  work_status: string; // Not Finished, Finished
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export type WorkshopRole = "manager" | "ceo";
