import fs from 'fs';
import path from 'path';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_PROJECT_MEMBERS,
  INITIAL_TASKS,
  INITIAL_MILESTONES,
  INITIAL_TIMELOGS,
  INITIAL_INVOICES,
  INITIAL_CONTRACTS,
  INITIAL_DEV_PROFILES,
  INITIAL_DEV_RATES,
} from './src/mockData';

export interface DatabaseState {
  users: typeof INITIAL_USERS;
  projects: typeof INITIAL_PROJECTS;
  projectMembers: typeof INITIAL_PROJECT_MEMBERS;
  tasks: typeof INITIAL_TASKS;
  milestones: typeof INITIAL_MILESTONES;
  timeLogs: typeof INITIAL_TIMELOGS;
  invoices: typeof INITIAL_INVOICES;
  contracts: typeof INITIAL_CONTRACTS;
  devProfiles: typeof INITIAL_DEV_PROFILES;
  devRates: typeof INITIAL_DEV_RATES;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data_storage.json');

// In-memory cache
let dbState: DatabaseState | null = null;

export function loadDatabase(): DatabaseState {
  if (dbState) {
    return dbState;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      dbState = JSON.parse(data);
      return dbState!;
    }
  } catch (err) {
    console.error('Failed to read database file, initializing default:', err);
  }

  // Initialize with initial mock data
  dbState = {
    users: INITIAL_USERS,
    projects: INITIAL_PROJECTS,
    projectMembers: INITIAL_PROJECT_MEMBERS,
    tasks: INITIAL_TASKS,
    milestones: INITIAL_MILESTONES,
    timeLogs: INITIAL_TIMELOGS,
    invoices: INITIAL_INVOICES,
    contracts: INITIAL_CONTRACTS,
    devProfiles: INITIAL_DEV_PROFILES,
    devRates: INITIAL_DEV_RATES,
  };

  saveDatabase(dbState);
  return dbState;
}

export function saveDatabase(state: DatabaseState): void {
  try {
    dbState = state;
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

export function getDatabase(): DatabaseState {
  return loadDatabase();
}

export function updateDatabase(updater: (current: DatabaseState) => DatabaseState): DatabaseState {
  const current = loadDatabase();
  const next = updater(current);
  saveDatabase(next);
  return next;
}
