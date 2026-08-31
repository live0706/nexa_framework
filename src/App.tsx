import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/auth/LoginView';

// Admin / SuperAdmin / ProjectManager Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProjectsTable } from './components/admin/AdminProjectsTable';
import { AdminUsersTable } from './components/admin/AdminUsersTable';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminFinance } from './components/admin/AdminFinance';

// Contracts Components
import { ContractList } from './components/contracts/ContractList';
import { DevContractsView } from './components/contracts/DevContractsView';
import { ClientContractsView } from './components/contracts/ClientContractsView';

// Dev Components
import { DevDashboard } from './components/dev/DevDashboard';
import { DevKanban } from './components/dev/DevKanban';
import { DevTimeTracking } from './components/dev/DevTimeTracking';
import { DevFinance } from './components/dev/DevFinance';
import { TaskDetailModal } from './components/dev/TaskDetailModal';

// Client Components
import { ClientDashboard } from './components/client/ClientDashboard';
import { ClientDeliverableValidation } from './components/client/ClientDeliverableValidation';
import { ClientTasksView } from './components/client/ClientTasksView';
import { ClientFinance } from './components/client/ClientFinance';

// Modals
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { CreateUserModal } from './components/modals/CreateUserModal';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { TimeLogModal } from './components/modals/TimeLogModal';

import { Project, Task } from './types';

const MainContent: React.FC = () => {
  const {
    currentUser,
    adminTab,
    devTab,
    clientTab,
    setDevTab,
    setClientTab,
    setSelectedProjectId,
  } = useApp();

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDefaultProjectId, setCreateTaskDefaultProjectId] = useState<string>('');
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [timeLogTask, setTimeLogTask] = useState<Task | null>(null);

  if (!currentUser) {
    return <LoginView />;
  }

  const handleOpenEditProject = (project: Project) => {
    setEditingProject(project);
    setIsCreateProjectOpen(true);
  };

  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setIsCreateProjectOpen(true);
  };

  const handleOpenCreateTask = (projectId?: string) => {
    if (projectId) setCreateTaskDefaultProjectId(projectId);
    setIsCreateTaskOpen(true);
  };

  const isSuperAdminOrPM =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'PROJECT_MANAGER';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Dynamic Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with Switcher */}
        <Header />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {/* SUPER_ADMIN / ADMIN / PROJECT_MANAGER ROLE VIEWS */}
            {isSuperAdminOrPM && (
              <>
                {adminTab === 'dashboard' && (
                  <AdminDashboard
                    onOpenCreateProject={handleOpenCreateProject}
                    onOpenCreateUser={() => setIsCreateUserOpen(true)}
                  />
                )}
                {adminTab === 'projects' && (
                  <AdminProjectsTable
                    onOpenCreateProject={handleOpenCreateProject}
                    onOpenEditProject={handleOpenEditProject}
                  />
                )}
                {adminTab === 'contracts' && <ContractList />}
                {adminTab === 'users' && (
                  <AdminUsersTable onOpenCreateUser={() => setIsCreateUserOpen(true)} />
                )}
                {adminTab === 'analytics' && <AdminAnalytics />}
                {adminTab === 'finance' && <AdminFinance />}
              </>
            )}

            {/* DEVELOPER ROLE VIEWS */}
            {currentUser.role === 'DEV' && (
              <>
                {(devTab === 'my_projects' || devTab === ('dashboard' as any)) && (
                  <DevDashboard
                    onOpenKanban={(projId) => {
                      setSelectedProjectId(projId);
                      setDevTab('kanban');
                    }}
                    onOpenCreateTask={(projId) => handleOpenCreateTask(projId)}
                  />
                )}
                {devTab === 'kanban' && (
                  <DevKanban
                    onOpenCreateTask={(projId) => handleOpenCreateTask(projId)}
                    onSelectTaskDetail={(task) => setActiveTaskDetail(task)}
                  />
                )}
                {devTab === 'contracts' && <DevContractsView />}
                {devTab === 'time_tracking' && <DevTimeTracking />}
                {devTab === 'finance' && <DevFinance />}
              </>
            )}

            {/* CLIENT ROLE VIEWS */}
            {currentUser.role === 'CLIENT' && (
              <>
                {clientTab === 'overview' && (
                  <ClientDashboard
                    onGoToValidation={() => setClientTab('validation')}
                    onGoToRoadmap={() => setClientTab('deliverables_roadmap')}
                  />
                )}
                {(clientTab === 'validation' || clientTab === ('deliverables' as any)) && (
                  <ClientDeliverableValidation />
                )}
                {clientTab === 'contracts' && <ClientContractsView />}
                {(clientTab === 'deliverables_roadmap' || clientTab === ('tasks' as any)) && (
                  <ClientTasksView />
                )}
                {clientTab === 'finance' && <ClientFinance />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => {
          setIsCreateProjectOpen(false);
          setEditingProject(null);
        }}
        initialProject={editingProject}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultProjectId={createTaskDefaultProjectId}
      />

      <TaskDetailModal
        task={activeTaskDetail}
        onClose={() => setActiveTaskDetail(null)}
        onOpenTimeLog={(task) => {
          setActiveTaskDetail(null);
          setTimeLogTask(task);
        }}
      />

      <TimeLogModal
        task={timeLogTask}
        isOpen={!!timeLogTask}
        onClose={() => setTimeLogTask(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
