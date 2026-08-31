// PostgreSQL DDL Schema for Nexa Dashboard (Ready for Cloud SQL / Supabase / Neon / Local Postgres)

export const POSTGRESQL_SCHEMA_SQL = `
-- ============================================================================
-- NEXA DASHBOARD - POSTGRESQL PRODUCTION RELATIONAL SCHEMA
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'PROJECT_MANAGER', 'DEV', 'CLIENT');
CREATE TYPE project_status AS ENUM ('A_VENIR', 'EN_COURS', 'RECETTE', 'TERMINE', 'ARCHIVE');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE milestone_status AS ENUM ('PENDING', 'VALIDATED', 'CHANGES_REQUESTED');
CREATE TYPE contract_type AS ENUM ('DEV_SERVICE_CONTRACT', 'CLIENT_MASTER_CONTRACT');
CREATE TYPE contract_status AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'ACTIVE_SIGNED', 'COMPLETED', 'CANCELLED');
CREATE TYPE tranche_status AS ENUM ('PENDING', 'MILESTONE_COMPLETED', 'PAYOUT_REQUESTED', 'PAID');
CREATE TYPE invoice_type AS ENUM ('CLIENT_INVOICE', 'DEV_PAYOUT');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'PENDING', 'PAID', 'OVERDUE');
CREATE TYPE payment_method AS ENUM ('VIREMENT_BANCAIRE', 'CARTE_BANCAIRE', 'PRELEVEMENT', 'STRIPE');

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'DEV',
    job_title VARCHAR(255),
    avatar TEXT,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    manager_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    status project_status NOT NULL DEFAULT 'EN_COURS',
    progress_percent INT DEFAULT 0,
    deadline DATE,
    budget NUMERIC(12, 2) DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS project_members (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 5. MILESTONES (Jalons & Livrables)
CREATE TABLE IF NOT EXISTS milestones (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status milestone_status NOT NULL DEFAULT 'PENDING',
    client_feedback TEXT,
    feedback_date TIMESTAMP WITH TIME ZONE,
    deliverable_url TEXT,
    deliverable_tag VARCHAR(100)
);

-- 6. TASKS (Kanban)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    is_client_visible BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    assigned_to VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    logged_hours NUMERIC(6, 2) DEFAULT 0,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TASK COMMENTS
CREATE TABLE IF NOT EXISTS task_comments (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CONTRACTS (Contrats Cadres Clients & Prestations Forfait Développeurs)
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(64) PRIMARY KEY,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type contract_type NOT NULL,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    dev_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    total_amount_ht NUMERIC(12, 2) NOT NULL,
    tva_rate NUMERIC(5, 2) DEFAULT 20.0,
    total_amount_ttc NUMERIC(12, 2) NOT NULL,
    status contract_status NOT NULL DEFAULT 'DRAFT',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deliverables_summary TEXT,
    document_url TEXT,
    clauses JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CONTRACT TRANCHES (Tranches conditionnées aux jalons)
CREATE TABLE IF NOT EXISTS contract_tranches (
    id VARCHAR(64) PRIMARY KEY,
    contract_id VARCHAR(64) NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    milestone_id VARCHAR(64) REFERENCES milestones(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    percentage NUMERIC(5, 2) NOT NULL,
    amount_ht NUMERIC(12, 2) NOT NULL,
    amount_ttc NUMERIC(12, 2) NOT NULL,
    trigger_condition VARCHAR(255) NOT NULL,
    due_date DATE,
    status tranche_status NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP WITH TIME ZONE,
    invoice_id VARCHAR(64)
);

-- 10. CONTRACT SIGNATURES (Preuves de signature électronique)
CREATE TABLE IF NOT EXISTS contract_signatures (
    id VARCHAR(64) PRIMARY KEY,
    contract_id VARCHAR(64) NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signature_type VARCHAR(50) NOT NULL,
    signature_data TEXT,
    ip_address VARCHAR(45),
    checksum VARCHAR(64)
);

-- 11. INVOICES (Factures clients et Règlements Prestataires)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    type invoice_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contract_id VARCHAR(64) REFERENCES contracts(id) ON DELETE SET NULL,
    tranche_id VARCHAR(64) REFERENCES contract_tranches(id) ON DELETE SET NULL,
    client_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    dev_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    amount_ht NUMERIC(12, 2) NOT NULL,
    tva_rate NUMERIC(5, 2) DEFAULT 20.0,
    amount_ttc NUMERIC(12, 2) NOT NULL,
    status invoice_status NOT NULL DEFAULT 'PENDING',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method payment_method,
    items JSONB DEFAULT '[]',
    notes TEXT
);

-- 12. TIME LOGS (Suivi des heures)
CREATE TABLE IF NOT EXISTS time_logs (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) REFERENCES tasks(id) ON DELETE CASCADE,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hours NUMERIC(5, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. DEV LEGAL PROFILES & RATES
CREATE TABLE IF NOT EXISTS dev_contract_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    legal_status VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    siren_siret VARCHAR(50),
    iban_masked VARCHAR(50),
    bic VARCHAR(20),
    address TEXT
);

CREATE TABLE IF NOT EXISTS dev_rates (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    hourly_rate NUMERIC(8, 2) NOT NULL DEFAULT 65.0,
    daily_rate NUMERIC(8, 2) NOT NULL DEFAULT 480.0,
    iban_masked VARCHAR(50),
    legal_status VARCHAR(100)
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
`;
