import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  FolderPlus,
  Building,
  Users,
  Calendar,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: Project | null;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  initialProject,
}) => {
  const { users, projectMembers, createProject, updateProject } = useApp();

  const clients = users.filter((u) => u.role === 'CLIENT');
  const devs = users.filter((u) => u.role === 'DEV');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  const [status, setStatus] = useState<ProjectStatus>('EN_COURS');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Web & E-Commerce');

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description);
      setClientId(initialProject.client_id);
      setStatus(initialProject.status);
      setDeadline(initialProject.deadline);
      setCategory(initialProject.category || 'Web & E-Commerce');

      const existingMemberIds = projectMembers
        .filter((m) => m.project_id === initialProject.id)
        .map((m) => m.user_id);
      setSelectedDevIds(existingMemberIds);
    } else {
      setName('');
      setDescription('');
      setClientId(clients[0]?.id || '');
      setStatus('EN_COURS');
      setDeadline(
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      setCategory('Web & E-Commerce');
      setSelectedDevIds(devs.slice(0, 2).map((d) => d.id));
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const toggleDevSelection = (devId: string) => {
    setSelectedDevIds((prev) =>
      prev.includes(devId) ? prev.filter((id) => id !== devId) : [...prev, devId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) return;

    if (initialProject) {
      updateProject(
        initialProject.id,
        {
          name: name.trim(),
          description: description.trim(),
          client_id: clientId,
          status,
          deadline,
          category,
        },
        selectedDevIds
      );
    } else {
      createProject(
        {
          name: name.trim(),
          description: description.trim(),
          client_id: clientId,
          status,
          deadline,
          category,
        },
        selectedDevIds
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div
        id="create-project-modal"
        className="bg-white border border-slate-200 w-full max-w-xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-slate-900" />
            <h3 className="font-bold text-slate-900 text-sm">
              {initialProject ? 'Modifier le Projet & Affectations' : 'Créer un Nouveau Projet'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-800 font-semibold mb-1">Nom du Projet *</label>
            <input
              id="input-project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Refonte Portail Client B2B"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1">Description & Enjeux</label>
            <textarea
              id="textarea-project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objectifs, périmètre et jalons attendus..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Assignment */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-600" /> Client Assigné (RBAC) *
              </label>
              <select
                id="select-project-client-modal"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.job_title || 'Client'})
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Statut Initial</label>
              <select
                id="select-project-status-modal"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="A_VENIR">À venir</option>
                <option value="EN_COURS">En cours</option>
                <option value="RECETTE">En Recette</option>
                <option value="TERMINE">Terminé</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Échéance de Livraison
              </label>
              <input
                id="input-project-deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Domaine / Catégorie</label>
              <input
                id="input-project-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ex: Infrastructure, Mobile, E-Commerce"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Dev Team Assignment Chips */}
          <div>
            <label className="block text-slate-800 font-semibold mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Développeurs Assignés au Projet (Contrôle d'accès RBAC)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {devs.map((dev) => {
                const isSelected = selectedDevIds.includes(dev.id);
                return (
                  <button
                    key={dev.id}
                    type="button"
                    id={`toggle-dev-member-${dev.id}`}
                    onClick={() => toggleDevSelection(dev.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={dev.avatar} alt={dev.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 text-xs truncate">{dev.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{dev.job_title}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Seuls les développeurs sélectionnés auront accès au Kanban et aux tâches de ce projet.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-confirm-save-project"
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialProject ? 'Enregistrer les modifications' : 'Créer le Projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
