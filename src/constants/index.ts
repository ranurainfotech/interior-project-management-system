export const LABOUR_CATEGORIES = [
  "Carpenter",
  "POP",
  "Electrician",
  "Painter",
  "Plumber",
  "Modular Furniture - Kitchen",
  "Fabrication",
  "Tiling",
  "Glass Work",
  "Furnishing Person",
  "Deep Cleaning",
  "Easy Dry",
  "AC Fitter / Worker",
  "Other",
] as const;

export const MATERIAL_CATEGORIES = [
  "Furniture Material",
  "Tile Material",
  "Electrical Material",
  "Plumbing Material",
  "Paint Material",
  "Furnishing Material",
  "Other",
] as const;

export const TRANSACTION_TYPES = [
  { value: "client_payment", label: "Client Payment" },
  { value: "labour_payment", label: "Labour Payment" },
  { value: "material_payment", label: "Material Payment" },
  { value: "expense", label: "Expense" },
] as const;

export const PROJECT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
] as const;

export const COLLECTIONS = {
  projects: "projects",
  projectContacts: "project_contacts",
  parties: "parties",
  projectParties: "project_parties",
  transactions: "transactions",
} as const;
