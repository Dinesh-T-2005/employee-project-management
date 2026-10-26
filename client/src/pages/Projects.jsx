
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderKanban,
  CalendarDays,
  Users,
  ArrowUpRight,
} from 'lucide-react';

import api from '../api';
import ProjectForm from '../components/ProjectForm';
import { ConfirmModal } from '../components/Modal';

const statuses = [
  'All statuses',
  'Planned',
  'In Progress',
  'On Hold',
  'Completed',
];

export default function Projects({ notify }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get('/projects', {
        params: {
          search,
          status: status === 'All statuses' ? '' : status,
        },
      });

      setProjects(response.data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, notify]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 200);

    return () => clearTimeout(timer);
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const save = async (data) => {
    setSaving(true);

    try {
      if (editing) {
        await api.put(`/projects/${editing.id}`, data);
        notify('Project updated successfully.');
      } else {
        await api.post('/projects', data);
        notify('Project created successfully.');
      }

      setFormOpen(false);
      setEditing(null);

      await load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleteBusy(true);

    try {
      await api.delete(`/projects/${deleting.id}`);

      notify(
        'Project deleted successfully. Assigned employee links were removed.'
      );

      setDeleting(null);
      await load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">DELIVERY WORKSPACE</div>
          <h1>Projects</h1>
          <p>
            Plan work, monitor progress, and keep your team aligned.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAdd}
        >
          <Plus size={18} />
          New project
        </button>
      </div>

      {/* Search and Status Filter */}
      <div className="project-toolbar">
        <label className="table-search">
          <Search size={17} />

          <input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="filter-select">
          <span>Status</span>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <span className="results-label">
          {projects.length} project
          {projects.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Project List */}
      {loading ? (
        <div className="panel empty-state">
          <div className="spinner" />
          Loading projects…
        </div>
      ) : projects.length > 0 ? (
        <div className="project-grid">
          {projects.map((project) => (
            <article
              className="project-card"
              key={project.id}
            >
              <div className="project-card-top">
                <span className="project-card-icon">
                  <FolderKanban size={21} />
                </span>

                <div className="row-actions">
                  <button
                    className="icon-button"
                    title="Edit project"
                    aria-label="Edit project"
                    onClick={() => {
                      setEditing(project);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="icon-button danger-hover"
                    title="Delete project"
                    aria-label="Delete project"
                    onClick={() => setDeleting(project)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="project-card-title">
                <h2>{project.name}</h2>

                <span
                  className={`status-badge ${project.status
                    .toLowerCase()
                    .replaceAll(' ', '-')}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="project-description">
                {project.description ||
                  'No description provided for this project.'}
              </p>

              <div className="project-dates">
                <div>
                  <CalendarDays size={15} />

                  <span>
                    <small>START DATE</small>
                    <strong>{project.startDate}</strong>
                  </span>
                </div>

                <div>
                  <CalendarDays size={15} />

                  <span>
                    <small>END DATE</small>
                    <strong>{project.endDate}</strong>
                  </span>
                </div>
              </div>

              <div className="project-card-footer">
                <span>
                  <Users size={15} />
                  {project.employeeCount} assigned
                </span>

                <span className="project-id">
                  PRJ-{String(project.id).padStart(3, '0')}
                </span>

                <ArrowUpRight size={16} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty-state">
          <FolderKanban size={34} />

          <strong>
            {search || status !== 'All statuses'
              ? 'No matching projects'
              : 'No projects yet'}
          </strong>

          <p>
            Try changing your search or create a project.
          </p>

          {!search && (
            <button
              className="btn btn-primary"
              onClick={openAdd}
            >
              <Plus size={17} />
              Create project
            </button>
          )}
        </div>
      )}

      {/* Create / Edit Project */}
      {formOpen && (
        <ProjectForm
          project={editing}
          onClose={() => setFormOpen(false)}
          onSave={save}
          saving={saving}
        />
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <ConfirmModal
          title="Delete project?"
          message={`Delete "${deleting.name}"? All employee assignments for this project will be removed.`}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
          busy={deleteBusy}
        />
      )}
    </>
  );
}
