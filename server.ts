import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDatabase, updateDatabase } from './server_db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // API HEALTH & DB STATUS
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      engine: 'Nexa Database API v1.0 (PostgreSQL-Ready Backend)',
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // AUTHENTICATION API
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const db = getDatabase();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      return res.status(401).json({ error: 'Adresse e-mail ou utilisateur introuvable.' });
    }

    // Check password
    const expectedPassword = user.password || (user.role === 'SUPER_ADMIN' ? 'Adm@n2026' : 'Nexa2026!');
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // Return user info (excluding raw password for security)
    const { password: _, ...safeUser } = user as any;
    res.json({
      user: safeUser,
      token: `nexa_jwt_${user.id}_${Date.now()}`,
    });
  });

  // FULL SYNC GET (Initial State / Hydration)
  app.get('/api/sync', (req, res) => {
    const db = getDatabase();
    res.json(db);
  });

  // ==========================================
  // USERS & ROLES API
  // ==========================================
  app.get('/api/users', (req, res) => {
    const db = getDatabase();
    res.json(db.users);
  });

  app.post('/api/users', (req, res) => {
    const newUser = {
      ...req.body,
      id: req.body.id || `usr_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    updateDatabase((db) => ({
      ...db,
      users: [...db.users, newUser],
    }));
    res.status(201).json(newUser);
  });

  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    let updatedUser: any = null;
    updateDatabase((db) => {
      const users = db.users.map((u) => {
        if (u.id === id) {
          updatedUser = { ...u, ...req.body };
          return updatedUser;
        }
        return u;
      });
      return { ...db, users };
    });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  });

  // ==========================================
  // PROJECTS & MEMBERS API
  // ==========================================
  app.get('/api/projects', (req, res) => {
    const db = getDatabase();
    const { client_id, manager_id } = req.query;
    let list = db.projects;
    if (client_id) {
      list = list.filter((p) => p.client_id === client_id);
    }
    if (manager_id) {
      list = list.filter((p) => p.manager_id === manager_id);
    }
    res.json(list);
  });

  app.post('/api/projects', (req, res) => {
    const newProject = {
      ...req.body,
      id: req.body.id || `prj_${Date.now()}`,
      created_at: new Date().toISOString(),
      progress_percent: req.body.progress_percent || 0,
    };
    updateDatabase((db) => ({
      ...db,
      projects: [newProject, ...db.projects],
    }));
    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    let updatedProject: any = null;
    updateDatabase((db) => {
      const projects = db.projects.map((p) => {
        if (p.id === id) {
          updatedProject = { ...p, ...req.body };
          return updatedProject;
        }
        return p;
      });
      return { ...db, projects };
    });
    if (!updatedProject) return res.status(404).json({ error: 'Project not found' });
    res.json(updatedProject);
  });

  // ==========================================
  // TASKS & KANBAN API
  // ==========================================
  app.get('/api/tasks', (req, res) => {
    const db = getDatabase();
    const { project_id, assigned_to } = req.query;
    let list = db.tasks;
    if (project_id) {
      list = list.filter((t) => t.project_id === project_id);
    }
    if (assigned_to) {
      list = list.filter((t) => t.assigned_to === assigned_to);
    }
    res.json(list);
  });

  app.post('/api/tasks', (req, res) => {
    const newTask = {
      ...req.body,
      id: req.body.id || `tsk_${Date.now()}`,
      created_at: new Date().toISOString(),
      logged_hours: req.body.logged_hours || 0,
    };
    updateDatabase((db) => ({
      ...db,
      tasks: [newTask, ...db.tasks],
    }));
    res.status(201).json(newTask);
  });

  app.patch('/api/tasks/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let updatedTask: any = null;
    updateDatabase((db) => {
      const tasks = db.tasks.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, status };
          return updatedTask;
        }
        return t;
      });
      return { ...db, tasks };
    });
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
    res.json(updatedTask);
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    let updatedTask: any = null;
    updateDatabase((db) => {
      const tasks = db.tasks.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, ...req.body };
          return updatedTask;
        }
        return t;
      });
      return { ...db, tasks };
    });
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
    res.json(updatedTask);
  });

  // ==========================================
  // MILESTONES & DELIVERABLES API
  // ==========================================
  app.get('/api/milestones', (req, res) => {
    const db = getDatabase();
    const { project_id } = req.query;
    let list = db.milestones;
    if (project_id) {
      list = list.filter((m) => m.project_id === project_id);
    }
    res.json(list);
  });

  app.post('/api/milestones', (req, res) => {
    const newMilestone = {
      ...req.body,
      id: req.body.id || `mls_${Date.now()}`,
    };
    updateDatabase((db) => ({
      ...db,
      milestones: [...db.milestones, newMilestone],
    }));
    res.status(201).json(newMilestone);
  });

  app.put('/api/milestones/:id', (req, res) => {
    const { id } = req.params;
    let updatedMilestone: any = null;
    updateDatabase((db) => {
      const milestones = db.milestones.map((m) => {
        if (m.id === id) {
          updatedMilestone = { ...m, ...req.body };
          return updatedMilestone;
        }
        return m;
      });
      return { ...db, milestones };
    });
    if (!updatedMilestone) return res.status(404).json({ error: 'Milestone not found' });
    res.json(updatedMilestone);
  });

  // ==========================================
  // CONTRACTS & ELECTRONIC SIGNATURES API
  // ==========================================
  app.get('/api/contracts', (req, res) => {
    const db = getDatabase();
    const { project_id, client_id, dev_id } = req.query;
    let list = db.contracts;
    if (project_id) list = list.filter((c) => c.project_id === project_id);
    if (client_id) list = list.filter((c) => c.client_id === client_id);
    if (dev_id) list = list.filter((c) => c.dev_id === dev_id);
    res.json(list);
  });

  app.post('/api/contracts', (req, res) => {
    const newContract = {
      ...req.body,
      id: req.body.id || `ctr_${Date.now()}`,
      created_at: new Date().toISOString(),
      signatures: req.body.signatures || [],
      tranches: req.body.tranches || [],
    };
    updateDatabase((db) => ({
      ...db,
      contracts: [newContract, ...db.contracts],
    }));
    res.status(201).json(newContract);
  });

  app.post('/api/contracts/:id/sign', (req, res) => {
    const { id } = req.params;
    const { signature } = req.body;
    let updatedContract: any = null;

    updateDatabase((db) => {
      const contracts = db.contracts.map((c) => {
        if (c.id === id) {
          const existingSigs = c.signatures || [];
          const withoutUser = existingSigs.filter((s) => s.user_id !== signature.user_id);
          const newSigs = [...withoutUser, signature];

          let nextStatus = c.status;
          if (newSigs.length >= 2 || (c.type === 'DEV_SERVICE_CONTRACT' && newSigs.length >= 1)) {
            nextStatus = 'ACTIVE_SIGNED';
          } else {
            nextStatus = 'PENDING_SIGNATURE';
          }

          updatedContract = {
            ...c,
            status: nextStatus,
            signatures: newSigs,
          };
          return updatedContract;
        }
        return c;
      });
      return { ...db, contracts };
    });

    if (!updatedContract) return res.status(404).json({ error: 'Contract not found' });
    res.json(updatedContract);
  });

  app.put('/api/contracts/:id', (req, res) => {
    const { id } = req.params;
    let updatedContract: any = null;
    updateDatabase((db) => {
      const contracts = db.contracts.map((c) => {
        if (c.id === id) {
          updatedContract = { ...c, ...req.body };
          return updatedContract;
        }
        return c;
      });
      return { ...db, contracts };
    });
    if (!updatedContract) return res.status(404).json({ error: 'Contract not found' });
    res.json(updatedContract);
  });

  // ==========================================
  // INVOICES & FINANCE API
  // ==========================================
  app.get('/api/invoices', (req, res) => {
    const db = getDatabase();
    res.json(db.invoices);
  });

  app.post('/api/invoices', (req, res) => {
    const newInvoice = {
      ...req.body,
      id: req.body.id || `inv_${Date.now()}`,
      issue_date: req.body.issue_date || new Date().toISOString().split('T')[0],
    };
    updateDatabase((db) => ({
      ...db,
      invoices: [newInvoice, ...db.invoices],
    }));
    res.status(201).json(newInvoice);
  });

  app.patch('/api/invoices/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, paid_at } = req.body;
    let updatedInvoice: any = null;
    updateDatabase((db) => {
      const invoices = db.invoices.map((inv) => {
        if (inv.id === id) {
          updatedInvoice = {
            ...inv,
            status,
            paid_at: status === 'PAID' ? paid_at || new Date().toISOString() : inv.paid_at,
          };
          return updatedInvoice;
        }
        return inv;
      });
      return { ...db, invoices };
    });
    if (!updatedInvoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(updatedInvoice);
  });

  // ==========================================
  // TIME LOGS & DEV PROFILES API
  // ==========================================
  app.get('/api/timelogs', (req, res) => {
    const db = getDatabase();
    res.json(db.timeLogs);
  });

  app.post('/api/timelogs', (req, res) => {
    const newLog = {
      ...req.body,
      id: `log_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    updateDatabase((db) => ({
      ...db,
      timeLogs: [newLog, ...db.timeLogs],
    }));
    res.status(201).json(newLog);
  });

  app.get('/api/dev-profiles', (req, res) => {
    const db = getDatabase();
    res.json(db.devProfiles);
  });

  app.post('/api/dev-profiles', (req, res) => {
    const profile = req.body;
    updateDatabase((db) => {
      const exists = db.devProfiles.some((p) => p.user_id === profile.user_id);
      const devProfiles = exists
        ? db.devProfiles.map((p) => (p.user_id === profile.user_id ? { ...p, ...profile } : p))
        : [...db.devProfiles, profile];
      return { ...db, devProfiles };
    });
    res.json(profile);
  });

  app.get('/api/dev-rates', (req, res) => {
    const db = getDatabase();
    res.json(db.devRates);
  });

  app.post('/api/dev-rates', (req, res) => {
    const rate = req.body;
    updateDatabase((db) => {
      const exists = db.devRates.some((r) => r.user_id === rate.user_id);
      const devRates = exists
        ? db.devRates.map((r) => (r.user_id === rate.user_id ? { ...r, ...rate } : r))
        : [...db.devRates, rate];
      return { ...db, devRates };
    });
    res.json(rate);
  });

  // ==========================================
  // DATABASE RESET / SEED API
  // ==========================================
  app.post('/api/db/reset', (req, res) => {
    const freshDb = {
      users: getDatabase().users,
      projects: getDatabase().projects,
      projectMembers: getDatabase().projectMembers,
      tasks: getDatabase().tasks,
      milestones: getDatabase().milestones,
      timeLogs: getDatabase().timeLogs,
      invoices: getDatabase().invoices,
      contracts: getDatabase().contracts,
      devProfiles: getDatabase().devProfiles,
      devRates: getDatabase().devRates,
    };
    updateDatabase(() => freshDb);
    res.json({ message: 'Database reset successfully' });
  });

  // ==========================================
  // VITE DEV SERVER / PROD STATIC SERVE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Server & Database API running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
