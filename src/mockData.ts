import {
  User,
  Project,
  ProjectMember,
  Task,
  Milestone,
  TimeLog,
  Invoice,
  Contract,
  DevContractProfile,
  DevRateConfig,
} from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_super_admin',
    name: 'Administrateur',
    email: 'admin@nexa.com',
    password: 'Adm@n2026',
    role: 'SUPER_ADMIN',
    job_title: 'Directeur & Super-Administrateur',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_PROJECT_MEMBERS: ProjectMember[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_MILESTONES: Milestone[] = [];
export const INITIAL_TIMELOGS: TimeLog[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_DEV_PROFILES: DevContractProfile[] = [];
export const INITIAL_DEV_RATES: DevRateConfig[] = [];
