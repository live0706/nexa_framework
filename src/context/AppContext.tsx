import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  syncWorkspaceToFirebase,
  loadWorkspaceFromFirebase,
  subscribeToFirebaseWorkspace,
  fetchUserByEmailFromFirebase,
  deleteUserFromFirebase,
} from '../lib/firebase';
import {
  User,
  Project,
  ProjectMember,
  Task,
  Milestone,
  TimeLog,
  ToastMessage,
  UserRole,
  ProjectStatus,
  TaskStatus,
  MilestoneStatus,
  SuperAdminTab,
  ProjectManagerTab,
  AdminTab,
  DevTab,
  ClientTab,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  Contract,
  ContractTranche,
  ContractSignature,
  DevContractProfile,
  DevRateConfig,
} from '../types';
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
} from '../mockData';

interface AppContextType {
  // State
  currentUser: User | null;
  users: User[];
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  milestones: Milestone[];
  timeLogs: TimeLog[];
  invoices: Invoice[];
  contracts: Contract[];
  devProfiles: DevContractProfile[];
  devRates: DevRateConfig[];
  toasts: ToastMessage[];

  // Navigation state
  adminTab: SuperAdminTab;
  setAdminTab: (tab: SuperAdminTab) => void;
  devTab: DevTab;
  setDevTab: (tab: DevTab) => void;
  clientTab: ClientTab;
  setClientTab: (tab: ClientTab) => void;

  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  // Auth & RBAC actions
  login: (userId: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;

  // User Management (Admin / SuperAdmin)
  createUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;

  // Project Management (Admin / PM)
  createProject: (
    project: Omit<Project, 'id' | 'created_at' | 'progress_percent'>,
    memberUserIds: string[]
  ) => void;
  updateProject: (projectId: string, data: Partial<Project>, memberUserIds?: string[]) => void;
  archiveProject: (projectId: string) => void;
  recalculateProjectProgress: (projectId: string) => void;

  // Tasks Management (Dev / PM / Admin)
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'comments'>) => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  addTaskComment: (taskId: string, content: string, isInternal?: boolean) => void;

  // Milestones & Deliverables Management
  createMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (milestoneId: string, data: Partial<Milestone>) => void;
  validateMilestone: (milestoneId: string, status: MilestoneStatus, feedback?: string) => void;
  deleteMilestone: (milestoneId: string) => void;

  // Contract Management (SuperAdmin, PM, Dev, Client)
  createContract: (contractData: Omit<Contract, 'id' | 'created_at' | 'signatures'>) => void;
  updateContract: (contractId: string, data: Partial<Contract>) => void;
  signContract: (contractId: string, signatureType: 'DRAWN' | 'TYPED' | 'ELECTRONIC_CERT', signatureData?: string) => void;
  triggerTranchePayout: (contractId: string, trancheId: string) => void;
  getAccessibleContracts: () => Contract[];
  getDevContracts: (devId?: string) => Contract[];
  getClientContracts: (clientId?: string) => Contract[];
  getDevProfile: (devId: string) => DevContractProfile | undefined;
  updateDevProfile: (profile: DevContractProfile) => void;
  getDevRate: (devId?: string) => DevRateConfig;
  updateDevRate: (rate: DevRateConfig) => void;

  // Time Tracking (Dev Activity Log)
  logTime: (timeLog: Omit<TimeLog, 'id' | 'created_at' | 'user_id' | 'user_name'>) => void;

  // Finance & Payments
  createInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus, paymentMethod?: PaymentMethod) => void;
  payInvoice: (invoiceId: string, paymentMethod: PaymentMethod) => void;
  getClientInvoices: (clientId?: string) => Invoice[];
  getDevInvoices: (devId?: string) => Invoice[];

  // System
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;

  // RBAC Access Queries
  getAccessibleProjects: () => Project[];
  getAccessibleTasks: (projectId?: string) => Task[];
  getProjectDevs: (projectId: string) => User[];
  getClientForProject: (projectId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'nexa_clean_v1_current_user_id',
  USERS: 'nexa_clean_v1_users',
  PROJECTS: 'nexa_clean_v1_projects',
  MEMBERS: 'nexa_clean_v1_members',
  TASKS: 'nexa_clean_v1_tasks',
  MILESTONES: 'nexa_clean_v1_milestones',
  TIMELOGS: 'nexa_clean_v1_timelogs',
  INVOICES: 'nexa_clean_v1_invoices',
  CONTRACTS: 'nexa_clean_v1_contracts',
  DEV_PROFILES: 'nexa_clean_v1_dev_profiles',
  DEV_RATES: 'nexa_clean_v1_dev_rates',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or seed data
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (savedId) {
        const matched = users.find((u) => u.id === savedId);
        if (matched) return matched;
      }
      return null; // Require login
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECT_MEMBERS;
    } catch {
      return INITIAL_PROJECT_MEMBERS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MILESTONES);
      return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMELOGS);
      return saved ? JSON.parse(saved) : INITIAL_TIMELOGS;
    } catch {
      return INITIAL_TIMELOGS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
      return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
    } catch {
      return INITIAL_CONTRACTS;
    }
  });

  const [devProfiles, setDevProfiles] = useState<DevContractProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEV_PROFILES);
      return saved ? JSON.parse(saved) : INITIAL_DEV_PROFILES;
    } catch {
      return INITIAL_DEV_PROFILES;
    }
  });

  const [devRates, setDevRates] = useState<DevRateConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEV_RATES);
      return saved ? JSON.parse(saved) : INITIAL_DEV_RATES;
    } catch {
      return INITIAL_DEV_RATES;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Navigation State
  const [adminTab, setAdminTab] = useState<SuperAdminTab>('dashboard');
  const [devTab, setDevTab] = useState<DevTab>('my_projects');
  const [clientTab, setClientTab] = useState<ClientTab>('overview');

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Helper function to apply synchronized database state
  const applyRemoteState = (data: any) => {
    if (!data) return;
    if (Array.isArray(data.users) && data.users.length > 0) {
      setUsers((currentUsers) => {
        const serverMap = new Map(data.users.map((u: User) => [u.id, u]));
        const localOnly = currentUsers.filter((u) => !serverMap.has(u.id));
        return [...data.users, ...localOnly];
      });
    }

    if (Array.isArray(data.projects) && data.projects.length > 0) {
      setProjects((currentProjects) => {
        const serverMap = new Map(data.projects.map((p: Project) => [p.id, p]));
        const localOnly = currentProjects.filter((p) => !serverMap.has(p.id));
        return [...data.projects, ...localOnly];
      });
    }

    if (Array.isArray(data.projectMembers)) {
      setProjectMembers((currentMembers) => {
        const serverMap = new Map(data.projectMembers.map((m: ProjectMember) => [m.id, m]));
        const localOnly = currentMembers.filter((m) => !serverMap.has(m.id));
        return [...data.projectMembers, ...localOnly];
      });
    }

    if (Array.isArray(data.tasks)) {
      setTasks((currentTasks) => {
        const serverMap = new Map(data.tasks.map((t: Task) => [t.id, t]));
        const localOnly = currentTasks.filter((t) => !serverMap.has(t.id));
        return [...data.tasks, ...localOnly];
      });
    }

    if (Array.isArray(data.milestones)) {
      setMilestones((currentM) => {
        const serverMap = new Map(data.milestones.map((m: Milestone) => [m.id, m]));
        const localOnly = currentM.filter((m) => !serverMap.has(m.id));
        return [...data.milestones, ...localOnly];
      });
    }

    if (Array.isArray(data.timeLogs)) setTimeLogs(data.timeLogs);
    if (Array.isArray(data.invoices)) setInvoices(data.invoices);
    if (Array.isArray(data.contracts)) setContracts(data.contracts);
    if (Array.isArray(data.devProfiles)) setDevProfiles(data.devProfiles);
    if (Array.isArray(data.devRates)) setDevRates(data.devRates);
  };

  // 1. Initial boot: Fetch from Firebase Firestore & Local Backend API
  useEffect(() => {
    // Initial fetch from Firestore
    loadWorkspaceFromFirebase().then((data) => {
      if (data && data.users && data.users.length > 0) {
        applyRemoteState(data);
      } else {
        // Fallback to Express backend database API
        fetch('/api/sync')
          .then((res) => (res.ok ? res.json() : null))
          .then((apiData) => {
            if (apiData) applyRemoteState(apiData);
          })
          .catch(() => {});
      }
    });

    // Real-time listener: receive updates when users on other phones/laptops create accounts or projects
    const unsubscribe = subscribeToFirebaseWorkspace((remoteData) => {
      if (remoteData) {
        applyRemoteState(remoteData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Continuous Sync: write to Firebase Firestore, LocalStorage & Server on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(projectMembers));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
      localStorage.setItem(STORAGE_KEYS.TIMELOGS, JSON.stringify(timeLogs));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
      localStorage.setItem(STORAGE_KEYS.DEV_PROFILES, JSON.stringify(devProfiles));
      localStorage.setItem(STORAGE_KEYS.DEV_RATES, JSON.stringify(devRates));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
      }
    } catch (e) {
      console.error('LocalStorage sync error', e);
    }

    const dbPayload = {
      users,
      projects,
      projectMembers,
      tasks,
      milestones,
      timeLogs,
      invoices,
      contracts,
      devProfiles,
      devRates,
    };

    // Sync to Cloud Firebase Firestore
    syncWorkspaceToFirebase(dbPayload);

    // Sync to Server API fallback
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbPayload),
    }).catch(() => {});
  }, [users, projects, projectMembers, tasks, milestones, timeLogs, invoices, contracts, devProfiles, devRates, currentUser]);

  // Toast Helpers
  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth / Role Switching
  const login = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast('Connexion réussie', `Bienvenue, ${user.name} (${user.role})`, 'success');
    }
  };

  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Try server API first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const fullUser = users.find((u) => u.id === data.user.id) || data.user;
          setCurrentUser(fullUser);
          if (fullUser.role === 'SUPER_ADMIN' || fullUser.role === 'ADMIN' || fullUser.role === 'PROJECT_MANAGER') {
            setAdminTab('dashboard');
          } else if (fullUser.role === 'DEV') {
            setDevTab('my_projects');
          } else if (fullUser.role === 'CLIENT') {
            setClientTab('overview');
          }
          showToast('Connexion réussie', `Bienvenue, ${fullUser.name}`, 'success');
          return true;
        }
      }
    } catch {
      // Local / Cloud fallback
    }

    // 2. Find in local users state or query directly from Cloud Firebase (Firestore & RTDB)
    let matched = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (!matched) {
      // Direct live lookup in Firestore collection / app_state
      const remoteUser = await fetchUserByEmailFromFirebase(cleanEmail);
      if (remoteUser) {
        matched = remoteUser;
        setUsers((prev) => {
          if (!prev.some((u) => u.id === remoteUser.id)) {
            return [...prev, remoteUser];
          }
          return prev;
        });
      }
    }

    if (!matched) {
      showToast('Échec de connexion', 'Identifiant introuvable ou incorrect.', 'error');
      return false;
    }

    const expectedPassword = (
      matched.password ||
      (matched.role === 'SUPER_ADMIN'
        ? 'Adm@n2026'
        : matched.role === 'PROJECT_MANAGER'
        ? 'Pm@2026'
        : matched.role === 'DEV'
        ? 'Dev@2026'
        : matched.role === 'CLIENT'
        ? 'Client@2026'
        : 'Nexa2026!')
    ).trim();

    if (cleanPassword !== expectedPassword) {
      showToast('Mot de passe incorrect', 'Vérifiez le mot de passe saisi pour ce compte.', 'error');
      return false;
    }

    setCurrentUser(matched);
    if (matched.role === 'SUPER_ADMIN' || matched.role === 'ADMIN' || matched.role === 'PROJECT_MANAGER') {
      setAdminTab('dashboard');
    } else if (matched.role === 'DEV') {
      setDevTab('my_projects');
    } else if (matched.role === 'CLIENT') {
      setClientTab('overview');
    }
    showToast('Connexion réussie', `Bienvenue, ${matched.name}`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    showToast('Déconnexion', 'Vous avez été déconnecté avec succès.', 'info');
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setSelectedProjectId(null);
      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'PROJECT_MANAGER') {
        setAdminTab('dashboard');
      } else if (user.role === 'DEV') {
        setDevTab('my_projects');
      } else if (user.role === 'CLIENT') {
        setClientTab('overview');
      }
      showToast('Profil actif', `Basculé sur ${user.name} [${user.role}]`, 'info');
    }
  };

  // RBAC Filtered Queries
  const getAccessibleProjects = (): Project[] => {
    if (!currentUser) return [];
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER') {
      return projects;
    }
    if (currentUser.role === 'DEV') {
      const myMemberships = projectMembers.filter((m) => m.user_id === currentUser.id);
      const myProjectIds = myMemberships.map((m) => m.project_id);
      return projects.filter((p) => myProjectIds.includes(p.id));
    }
    if (currentUser.role === 'CLIENT') {
      return projects.filter((p) => p.client_id === currentUser.id);
    }
    return [];
  };

  const getAccessibleTasks = (projectId?: string): Task[] => {
    if (!currentUser) return [];
    const targetProjectIds = projectId
      ? [projectId]
      : getAccessibleProjects().map((p) => p.id);

    let projectTasks = tasks.filter((t) => targetProjectIds.includes(t.project_id));

    if (currentUser.role === 'CLIENT') {
      return projectTasks.filter((t) => t.is_client_visible);
    }
    return projectTasks;
  };

  const getProjectDevs = (projectId: string): User[] => {
    const memberIds = projectMembers
      .filter((m) => m.project_id === projectId)
      .map((m) => m.user_id);
    return users.filter((u) => memberIds.includes(u.id) && u.role === 'DEV');
  };

  const getClientForProject = (projectId: string): User | undefined => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return undefined;
    return users.find((u) => u.id === project.client_id);
  };

  // User Management
  const createUser = (userData: Omit<User, 'id' | 'created_at'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    showToast('Utilisateur créé', `Le compte de ${newUser.name} a été créé avec succès.`, 'success');
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
    showToast('Utilisateur mis à jour', 'Les modifications ont été enregistrées.', 'success');
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      showToast('Erreur', 'Vous ne pouvez pas supprimer votre propre compte actif.', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setProjectMembers((prev) => prev.filter((m) => m.user_id !== userId));
    deleteUserFromFirebase(userId);
    showToast('Utilisateur supprimé', 'Le compte et ses assignations ont été retirés.', 'warning');
  };

  // Project Management
  const recalculateProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.project_id === projectId);
    const projectMilestones = milestones.filter((m) => m.project_id === projectId);

    let progress = 0;
    if (projectTasks.length > 0 || projectMilestones.length > 0) {
      const doneTasks = projectTasks.filter((t) => t.status === 'DONE').length;
      const validatedMilestones = projectMilestones.filter((m) => m.status === 'VALIDATED').length;
      const totalWeight = projectTasks.length + projectMilestones.length * 2;
      const doneWeight = doneTasks + validatedMilestones * 2;
      progress = Math.round((doneWeight / (totalWeight || 1)) * 100);
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, progress_percent: Math.min(100, progress) } : p))
    );
  };

  const createProject = (
    projectData: Omit<Project, 'id' | 'created_at' | 'progress_percent'>,
    memberUserIds: string[]
  ) => {
    const newProjectId = 'prj_' + Date.now();
    const newProject: Project = {
      ...projectData,
      id: newProjectId,
      progress_percent: 0,
      created_at: new Date().toISOString(),
    };

    const newMemberships: ProjectMember[] = memberUserIds.map((userId) => ({
      id: 'mem_' + Date.now() + Math.random().toString(36).substr(2, 4),
      project_id: newProjectId,
      user_id: userId,
    }));

    setProjects((prev) => [newProject, ...prev]);
    setProjectMembers((prev) => [...prev, ...newMemberships]);
    showToast('Projet créé', `Le projet "${newProject.name}" a été initialisé.`, 'success');
  };

  const updateProject = (
    projectId: string,
    data: Partial<Project>,
    memberUserIds?: string[]
  ) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...data } : p)));

    if (memberUserIds) {
      setProjectMembers((prev) => {
        const withoutProject = prev.filter((m) => m.project_id !== projectId);
        const newMemberships = memberUserIds.map((userId) => ({
          id: 'mem_' + Date.now() + Math.random().toString(36).substr(2, 4),
          project_id: projectId,
          user_id: userId,
        }));
        return [...withoutProject, ...newMemberships];
      });
    }

    showToast('Projet actualisé', 'Les modifications ont été sauvegardées.', 'success');
  };

  const archiveProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'ARCHIVE' } : p))
    );
    showToast('Projet archivé', 'Le projet a été déplacé dans les archives.', 'info');
  };

  // Tasks Management
  const createTask = (taskData: Omit<Task, 'id' | 'created_at' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'tsk_' + Date.now(),
      created_at: new Date().toISOString(),
      comments: [],
    };
    setTasks((prev) => [newTask, ...prev]);
    recalculateProjectProgress(taskData.project_id);
    showToast('Tâche créée', `La tâche "${newTask.title}" a été ajoutée.`, 'success');
  };

  const updateTask = (taskId: string, data: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, ...data } : t));
      const target = updated.find((t) => t.id === taskId);
      if (target) {
        setTimeout(() => recalculateProjectProgress(target.project_id), 50);
      }
      return updated;
    });
    showToast('Tâche mise à jour', 'Modifications enregistrées.', 'success');
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, status } : t));
      const target = updated.find((t) => t.id === taskId);
      if (target) {
        setTimeout(() => recalculateProjectProgress(target.project_id), 50);
      }
      return updated;
    });
  };

  const deleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (target) {
      setTimeout(() => recalculateProjectProgress(target.project_id), 50);
    }
    showToast('Tâche supprimée', 'La tâche a été retirée du projet.', 'warning');
  };

  const addTaskComment = (taskId: string, content: string, isInternal = true) => {
    if (!currentUser) return;
    const newComment = {
      id: 'cmt_' + Date.now(),
      task_id: taskId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      content,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), newComment] }
          : t
      )
    );
    showToast('Commentaire ajouté', isInternal ? 'Note interne enregistrée.' : 'Commentaire publié.', 'info');
  };

  // Milestones & Deliverables
  const createMilestone = (milestoneData: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: 'mls_' + Date.now(),
    };
    setMilestones((prev) => [...prev, newMilestone]);
    recalculateProjectProgress(milestoneData.project_id);
    showToast('Jalon créé', `Jalon "${newMilestone.title}" planifié.`, 'success');
  };

  const updateMilestone = (milestoneId: string, data: Partial<Milestone>) => {
    setMilestones((prev) => {
      const updated = prev.map((m) => (m.id === milestoneId ? { ...m, ...data } : m));
      const target = updated.find((m) => m.id === milestoneId);
      if (target) {
        setTimeout(() => recalculateProjectProgress(target.project_id), 50);
      }
      return updated;
    });
    showToast('Jalon mis à jour', 'Modifications enregistrées.', 'success');
  };

  const validateMilestone = (
    milestoneId: string,
    status: MilestoneStatus,
    feedback?: string
  ) => {
    setMilestones((prev) => {
      const target = prev.find((m) => m.id === milestoneId);
      const updated = prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              status,
              client_feedback: feedback || m.client_feedback,
              feedback_date: new Date().toISOString(),
            }
          : m
      );
      if (target) {
        setTimeout(() => recalculateProjectProgress(target.project_id), 50);
      }
      return updated;
    });

    if (status === 'VALIDATED') {
      // Auto reconcile and trigger contract tranches tied to this milestone
      setContracts((prev) =>
        prev.map((contract) => {
          const updatedTranches = contract.tranches.map((tranche) => {
            if (tranche.milestone_id === milestoneId && tranche.status === 'PENDING') {
              return { ...tranche, status: 'PAYOUT_REQUESTED' as const };
            }
            return tranche;
          });
          return { ...contract, tranches: updatedTranches };
        })
      );

      showToast('Livrable Validé', 'Félicitations, le jalon a été validé. Les tranches contractuelles associées ont été débloquées.', 'success');
    } else if (status === 'CHANGES_REQUESTED') {
      showToast('Demande de modifications envoyée', 'L’équipe technique a été notifiée de vos remarques.', 'warning');
    }
  };

  const deleteMilestone = (milestoneId: string) => {
    const target = milestones.find((m) => m.id === milestoneId);
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    if (target) {
      setTimeout(() => recalculateProjectProgress(target.project_id), 50);
    }
    showToast('Jalon supprimé', 'Le jalon a été retiré.', 'info');
  };

  // Contracts Management
  const createContract = (contractData: Omit<Contract, 'id' | 'created_at' | 'signatures'>) => {
    const newContractId = 'ctr_' + Date.now();
    const initialSignature: ContractSignature[] = currentUser
      ? [
          {
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_role: currentUser.role,
            signed_at: new Date().toISOString(),
            signature_type: 'ELECTRONIC_CERT',
            checksum: 'SHA256:' + Math.random().toString(36).substring(2) + Date.now().toString(36),
          },
        ]
      : [];

    const newContract: Contract = {
      ...contractData,
      id: newContractId,
      created_at: new Date().toISOString(),
      signatures: initialSignature,
    };

    setContracts((prev) => [newContract, ...prev]);
    showToast(
      'Contrat créé',
      `Contrat ${newContract.contract_number} "${newContract.title}" enregistré au format échelonné.`,
      'success'
    );
  };

  const updateContract = (contractId: string, data: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, ...data } : c))
    );
    showToast('Contrat mis à jour', 'Modifications contractuelles sauvegardées.', 'success');
  };

  const signContract = (
    contractId: string,
    signatureType: 'DRAWN' | 'TYPED' | 'ELECTRONIC_CERT',
    signatureData?: string
  ) => {
    if (!currentUser) return;

    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;

        const newSignature: ContractSignature = {
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_role: currentUser.role,
          signed_at: new Date().toISOString(),
          signature_type: signatureType,
          signature_data: signatureData || currentUser.name,
          checksum: 'SHA256:' + Math.random().toString(36).substring(2) + Date.now().toString(36),
        };

        const otherSignatures = c.signatures.filter((s) => s.user_id !== currentUser.id);
        const allSignatures = [...otherSignatures, newSignature];

        // If signed by superadmin / PM + (dev or client), activate
        const hasAdminSig = allSignatures.some(
          (s) => s.user_role === 'SUPER_ADMIN' || s.user_role === 'PROJECT_MANAGER' || s.user_role === 'ADMIN'
        );
        const hasTargetSig =
          c.type === 'DEV_SERVICE_CONTRACT'
            ? allSignatures.some((s) => s.user_id === c.dev_id)
            : allSignatures.some((s) => s.user_id === c.client_id);

        const newStatus = hasAdminSig && hasTargetSig ? 'ACTIVE_SIGNED' : c.status;

        return {
          ...c,
          signatures: allSignatures,
          status: newStatus,
        };
      })
    );

    showToast('Signature électronique enregistrée', 'Le contrat a été signé avec succès et horodaté.', 'success');
  };

  const triggerTranchePayout = (contractId: string, trancheId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;
    const tranche = contract.tranches.find((t) => t.id === trancheId);
    if (!tranche) return;

    // Create an invoice or payout record
    const isDev = contract.type === 'DEV_SERVICE_CONTRACT';
    const invoiceNumber = isDev
      ? 'HON-2026-' + (Math.floor(Math.random() * 800) + 200)
      : 'FAC-2026-' + (Math.floor(Math.random() * 800) + 200);

    const newInvoice: Invoice = {
      id: (isDev ? 'pay_' : 'inv_') + Date.now(),
      invoice_number: invoiceNumber,
      type: isDev ? 'DEV_PAYOUT' : 'CLIENT_INVOICE',
      title: `${tranche.title} (${contract.contract_number})`,
      project_id: contract.project_id,
      contract_id: contract.id,
      tranche_id: tranche.id,
      client_id: contract.client_id,
      dev_id: contract.dev_id,
      amount_ht: tranche.amount_ht,
      tva_rate: contract.tva_rate,
      amount_ttc: tranche.amount_ttc,
      status: 'PENDING',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: 'item_' + Date.now(),
          description: `${tranche.title} - ${tranche.description} (${tranche.percentage}% du contrat)`,
          quantity: 1,
          unit_price: tranche.amount_ht,
          total: tranche.amount_ht,
        },
      ],
      notes: `Échéance contractuelle déclenchée selon le contrat signé ${contract.contract_number}.`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update tranche status
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          tranches: c.tranches.map((t) =>
            t.id === trancheId ? { ...t, status: 'PAYOUT_REQUESTED', invoice_id: newInvoice.id } : t
          ),
        };
      })
    );

    showToast(
      isDev ? 'Virement Déclenché' : 'Facture Émise',
      `L’échéance "${tranche.title}" (${tranche.amount_ttc.toLocaleString('fr-FR')} €) a été transmise à la comptabilité.`,
      'success'
    );
  };

  const getAccessibleContracts = (): Contract[] => {
    if (!currentUser) return [];
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'ADMIN') {
      return contracts;
    }
    if (currentUser.role === 'DEV') {
      return contracts.filter((c) => c.dev_id === currentUser.id);
    }
    if (currentUser.role === 'CLIENT') {
      return contracts.filter((c) => c.client_id === currentUser.id);
    }
    return [];
  };

  const getDevContracts = (devId?: string): Contract[] => {
    const targetDev = devId || (currentUser?.role === 'DEV' ? currentUser.id : undefined);
    if (targetDev) {
      return contracts.filter((c) => c.dev_id === targetDev);
    }
    return contracts.filter((c) => c.type === 'DEV_SERVICE_CONTRACT');
  };

  const getClientContracts = (clientId?: string): Contract[] => {
    const targetClient = clientId || (currentUser?.role === 'CLIENT' ? currentUser.id : undefined);
    if (targetClient) {
      return contracts.filter((c) => c.client_id === targetClient);
    }
    return contracts.filter((c) => c.type === 'CLIENT_MASTER_CONTRACT');
  };

  const getDevProfile = (devId: string): DevContractProfile | undefined => {
    return devProfiles.find((p) => p.user_id === devId);
  };

  const updateDevProfile = (profile: DevContractProfile) => {
    setDevProfiles((prev) => {
      const exists = prev.some((p) => p.user_id === profile.user_id);
      if (exists) {
        return prev.map((p) => (p.user_id === profile.user_id ? profile : p));
      }
      return [...prev, profile];
    });
    showToast('Profil juridique mis à jour', 'Informations de facturation et IBAN enregistrés.', 'success');
  };

  const getDevRate = (devId?: string): DevRateConfig => {
    const targetId = devId || (currentUser?.role === 'DEV' ? currentUser.id : undefined);
    const matched = devRates.find((r) => r.user_id === targetId);
    if (matched) return matched;
    return {
      user_id: targetId || 'unknown',
      hourly_rate: 65,
      daily_rate: 480,
      iban_masked: 'FR76 •••• •••• •••• 0000',
      legal_status: 'Micro-Entreprise (BNC)',
    };
  };

  const updateDevRate = (rate: DevRateConfig) => {
    setDevRates((prev) => {
      const exists = prev.some((r) => r.user_id === rate.user_id);
      if (exists) {
        return prev.map((r) => (r.user_id === rate.user_id ? rate : r));
      }
      return [...prev, rate];
    });
    showToast('Tarif mis à jour', 'La configuration tarifaire a été enregistrée.', 'success');
  };

  // Time Tracking
  const logTime = (timeLogData: Omit<TimeLog, 'id' | 'created_at' | 'user_id' | 'user_name'>) => {
    if (!currentUser) return;
    const newLog: TimeLog = {
      ...timeLogData,
      id: 'log_' + Date.now(),
      user_id: currentUser.id,
      user_name: currentUser.name,
      created_at: new Date().toISOString(),
    };
    setTimeLogs((prev) => [newLog, ...prev]);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === timeLogData.task_id
          ? { ...t, logged_hours: (t.logged_hours || 0) + timeLogData.hours }
          : t
      )
    );

    showToast('Activité enregistrée', `${timeLogData.hours}h de travail consignées sur le projet.`, 'success');
  };

  // Finance & Payments
  const createInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: 'inv_' + Date.now(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(
      'Facture émise',
      `Facture ${newInvoice.invoice_number} enregistrée pour ${newInvoice.amount_ttc.toLocaleString('fr-FR')} €`,
      'success'
    );
  };

  const updateInvoiceStatus = (
    invoiceId: string,
    status: InvoiceStatus,
    paymentMethod?: PaymentMethod
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const isPaid = status === 'PAID';
        return {
          ...inv,
          status,
          payment_method: paymentMethod || inv.payment_method,
          paid_at: isPaid ? new Date().toISOString().split('T')[0] : inv.paid_at,
        };
      })
    );

    // If paid, update matching contract tranche
    if (status === 'PAID') {
      setContracts((prev) =>
        prev.map((c) => ({
          ...c,
          tranches: c.tranches.map((t) =>
            t.invoice_id === invoiceId
              ? { ...t, status: 'PAID', paid_at: new Date().toISOString().split('T')[0] }
              : t
          ),
        }))
      );
    }

    showToast('Statut mis à jour', `Facture / Virement mis à jour : ${status}`, 'info');
  };

  const payInvoice = (invoiceId: string, paymentMethod: PaymentMethod) => {
    const today = new Date().toISOString().split('T')[0];
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'PAID',
              payment_method: paymentMethod,
              paid_at: today,
            }
          : inv
      )
    );

    setContracts((prev) =>
      prev.map((c) => ({
        ...c,
        tranches: c.tranches.map((t) =>
          t.invoice_id === invoiceId
            ? { ...t, status: 'PAID', paid_at: today }
            : t
        ),
      }))
    );

    showToast(
      'Règlement validé',
      'Le paiement a été confirmé avec succès. Reçu acquitté et tranche contractuelle soldée.',
      'success'
    );
  };

  const getClientInvoices = (clientId?: string): Invoice[] => {
    const targetClient = clientId || (currentUser?.role === 'CLIENT' ? currentUser.id : undefined);
    if (targetClient) {
      return invoices.filter((inv) => inv.type === 'CLIENT_INVOICE' && inv.client_id === targetClient);
    }
    return invoices.filter((inv) => inv.type === 'CLIENT_INVOICE');
  };

  const getDevInvoices = (devId?: string): Invoice[] => {
    const targetDev = devId || (currentUser?.role === 'DEV' ? currentUser.id : undefined);
    if (targetDev) {
      return invoices.filter((inv) => inv.type === 'DEV_PAYOUT' && inv.dev_id === targetDev);
    }
    return invoices.filter((inv) => inv.type === 'DEV_PAYOUT');
  };

  // Reset Data
  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setProjects(INITIAL_PROJECTS);
    setProjectMembers(INITIAL_PROJECT_MEMBERS);
    setTasks(INITIAL_TASKS);
    setMilestones(INITIAL_MILESTONES);
    setTimeLogs(INITIAL_TIMELOGS);
    setInvoices(INITIAL_INVOICES);
    setContracts(INITIAL_CONTRACTS);
    setDevProfiles(INITIAL_DEV_PROFILES);
    setDevRates(INITIAL_DEV_RATES);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
    showToast('Données réinitialisées', 'La base de démonstration a été restaurée.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        projectMembers,
        tasks,
        milestones,
        timeLogs,
        invoices,
        contracts,
        devProfiles,
        devRates,
        toasts,
        adminTab,
        setAdminTab,
        devTab,
        setDevTab,
        clientTab,
        setClientTab,
        selectedProjectId,
        setSelectedProjectId,
        login,
        loginWithCredentials,
        logout,
        switchUser,
        createUser,
        updateUser,
        deleteUser,
        createProject,
        updateProject,
        archiveProject,
        recalculateProjectProgress,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        addTaskComment,
        createMilestone,
        updateMilestone,
        validateMilestone,
        deleteMilestone,
        createContract,
        updateContract,
        signContract,
        triggerTranchePayout,
        getAccessibleContracts,
        getDevContracts,
        getClientContracts,
        getDevProfile,
        updateDevProfile,
        getDevRate,
        updateDevRate,
        logTime,
        createInvoice,
        updateInvoiceStatus,
        payInvoice,
        getClientInvoices,
        getDevInvoices,
        showToast,
        removeToast,
        resetAllData,
        getAccessibleProjects,
        getAccessibleTasks,
        getProjectDevs,
        getClientForProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
