export type UserRole = 'SUPER_ADMIN' | 'PROJECT_MANAGER' | 'DEV' | 'CLIENT' | 'ADMIN';

export type ProjectStatus = 'A_VENIR' | 'EN_COURS' | 'RECETTE' | 'TERMINE' | 'ARCHIVE';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type MilestoneStatus = 'PENDING' | 'VALIDATED' | 'CHANGES_REQUESTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  job_title?: string;
  avatar?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string; // User ID with role CLIENT
  manager_id?: string; // User ID with role PROJECT_MANAGER or SUPER_ADMIN
  status: ProjectStatus;
  progress_percent: number;
  deadline: string;
  created_at: string;
  budget?: number;
  category?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  is_client_visible: boolean;
  created_by: string; // User ID
  assigned_to?: string; // User ID
  logged_hours?: number;
  due_date?: string;
  created_at: string;
  comments?: TaskComment[];
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: MilestoneStatus;
  client_feedback?: string;
  feedback_date?: string;
  deliverable_url?: string;
  deliverable_tag?: string;
}

export interface TimeLog {
  id: string;
  task_id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  hours: number;
  description: string;
  date: string;
  created_at: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

// Navigation Tab Types per Role
export type SuperAdminTab = 'dashboard' | 'projects' | 'contracts' | 'finance' | 'users' | 'analytics';
export type ProjectManagerTab = 'dashboard' | 'projects' | 'kanban' | 'milestones' | 'contracts' | 'finance';
export type AdminTab = SuperAdminTab; // Alias for backwards compatibility
export type DevTab = 'my_projects' | 'kanban' | 'contracts' | 'finance' | 'time_tracking';
export type ClientTab = 'overview' | 'validation' | 'deliverables_roadmap' | 'contracts' | 'finance';

// Contract Management Types
export type ContractType = 'DEV_SERVICE_CONTRACT' | 'CLIENT_MASTER_CONTRACT';
export type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE_SIGNED' | 'COMPLETED' | 'CANCELLED';
export type TrancheStatus = 'PENDING' | 'MILESTONE_COMPLETED' | 'PAYOUT_REQUESTED' | 'PAID';

export interface ContractTranche {
  id: string;
  contract_id: string;
  title: string;
  description: string;
  percentage: number; // e.g. 30 for 30%
  amount_ht: number;
  amount_ttc: number;
  trigger_condition: string; // e.g. "À la signature", "À la livraison du MVP", "À la recette finale"
  milestone_id?: string;
  due_date: string;
  status: TrancheStatus;
  paid_at?: string;
  invoice_id?: string;
}

export interface ContractSignature {
  user_id: string;
  user_name: string;
  user_role: UserRole;
  signed_at: string;
  signature_type: 'DRAWN' | 'TYPED' | 'ELECTRONIC_CERT';
  signature_data?: string;
  ip_address?: string;
  checksum?: string;
}

export interface Contract {
  id: string;
  contract_number: string; // e.g. CTR-DEV-2026-001 or CTR-CLI-2026-001
  title: string;
  type: ContractType;
  project_id: string;
  client_id?: string;
  dev_id?: string;
  total_amount_ht: number;
  tva_rate: number;
  total_amount_ttc: number;
  status: ContractStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  signatures: ContractSignature[];
  tranches: ContractTranche[];
  clauses: string[];
  deliverables_summary: string;
  document_url?: string;
  notes?: string;
}

export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT';
export type InvoiceType = 'CLIENT_INVOICE' | 'DEV_PAYOUT';
export type PaymentMethod = 'VIREMENT_BANCAIRE' | 'CARTE_BANCAIRE' | 'PRELEVEMENT' | 'STRIPE';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  type: InvoiceType;
  title: string;
  project_id: string;
  contract_id?: string;
  tranche_id?: string;
  client_id?: string;
  dev_id?: string;
  amount_ht: number;
  tva_rate: number;
  amount_ttc: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_at?: string;
  payment_method?: PaymentMethod;
  items: InvoiceItem[];
  notes?: string;
}

export interface DevRateConfig {
  user_id: string;
  hourly_rate: number;
  daily_rate: number;
  iban_masked: string;
  legal_status: string;
}

export interface DevContractProfile {
  user_id: string;
  legal_status: string; // e.g. SASU, EURL, Micro-Entreprise, Portage
  company_name?: string;
  siren_siret: string;
  siret?: string;
  iban_masked: string;
  iban?: string;
  bic: string;
  vat_number?: string;
  address?: string;
  active_contracts_count?: number;
  total_contracted_amount?: number;
  total_paid_amount?: number;
}
