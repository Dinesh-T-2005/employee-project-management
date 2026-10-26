
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Link, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Mail,
  Phone,
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  Plus,
  Check,
} from 'lucide-react';

import api from '../api';
import Modal from '../components/Modal';

export default function EmployeeDetails({ notify }) {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [employeeResponse, projectsResponse] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get('/projects'),
      ]);

      setEmployee(employeeResponse.data);
      setProjects(projectsResponse.data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const saveAssignments = async () => {
    setSaving(true);

    try {
      const response = await api.put(
        `/employees/${id}/projects`,
        { projectIds: selected }
      );

      setEmployee(response.data);
      setAssignOpen(false);
      notify('Project assignments updated.');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="panel empty-state">
        <div className="spinner" />
        Loading employee…
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="panel empty-state">
        <strong>Employee not found</strong>

        <Link to="/employees" className="text-link">
          Back to employees
        </Link>
      </div>
    );
  }

  const assignedProjects = employee.projects || [];

  return (
    <>
      {/* Back Navigation */}
      <Link to="/employees" className="back-link">
        <ArrowLeft size={16} />
        Back to employees
      </Link>

      {/* Employee Profile */}
      <div className="detail-hero">
        <div className={`detail-avatar avatar-${employee.id % 6}`}>
          {employee.name
            .split(' ')
            .map((namePart) => namePart[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>

        <div className="detail-identity">
          <div className="eyebrow">
            EMPLOYEE PROFILE · EMP-
            {String(employee.id).padStart(4, '0')}
          </div>

          <h1>{employee.name}</h1>
          <p>{employee.designation}</p>

          <div className="detail-contact">
            <span>
              <Mail size={15} />
              {employee.email}
            </span>

            <span>
              <Phone size={15} />
              {employee.phone}
            </span>
          </div>
        </div>

        <div className="detail-hero-action">
          <span className="profile-status">
            <i />
            Active record
          </span>
        </div>
      </div>

      {/* Employee Statistics */}
      <div className="detail-stats">
        <div className="detail-stat">
          <span className="detail-stat-icon blue">
            <BriefcaseBusiness size={19} />
          </span>

          <span>
            <strong>{assignedProjects.length}</strong>
            <small>Assigned projects</small>
          </span>
        </div>

        <div className="detail-stat">
          <span className="detail-stat-icon violet">
            <CalendarDays size={19} />
          </span>

          <span>
            <strong>
              {employee.createdAt
                ? new Date(employee.createdAt).toLocaleDateString()
                : '—'}
            </strong>
            <small>Joined workspace</small>
          </span>
        </div>
      </div>

      {/* Assigned Projects */}
      <section className="panel assigned-panel">
        <div className="panel-heading">
          <div>
            <h2>Assigned projects</h2>
            <p>
              Projects currently linked to{' '}
              {employee.name.split(' ')[0]}
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setSelected(
                employee.projectIds ||
                  assignedProjects.map((project) => project.id)
              );
              setAssignOpen(true);
            }}
          >
            <Plus size={17} />
            Manage assignments
          </button>
        </div>

        {assignedProjects.length > 0 ? (
          <div className="assigned-list">
            {assignedProjects.map((project) => (
              <article
                className="assigned-project"
                key={project.id}
              >
                <span className="project-card-icon">
                  <FolderKanban size={20} />
                </span>

                <div className="assigned-info">
                  <strong>{project.name}</strong>

                  <p>
                    {project.description ||
                      'No description provided.'}
                  </p>

                  <div className="assigned-meta">
                    <span>
                      <CalendarDays size={13} />
                      {project.startDate} — {project.endDate}
                    </span>

                    <span
                      className={`status-badge ${project.status
                        .toLowerCase()
                        .replaceAll(' ', '-')}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <FolderKanban size={30} />

            <strong>No projects assigned</strong>

            <p>
              Assign one or more projects to this employee.
            </p>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelected([]);
                setAssignOpen(true);
              }}
            >
              <Plus size={16} />
              Assign a project
            </button>
          </div>
        )}
      </section>

      {/* Project Assignment Modal */}
      {assignOpen && (
        <Modal
          title="Manage project assignments"
          onClose={() => setAssignOpen(false)}
        >
          <p className="modal-intro">
            Select all projects that should be assigned to{' '}
            <strong>{employee.name}</strong>.
          </p>

          <div className="assignment-options">
            {projects.map((project) => (
              <label
                className={`assignment-option ${
                  selected.includes(project.id) ? 'selected' : ''
                }`}
                key={project.id}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(project.id)}
                  onChange={() => {
                    setSelected((prev) =>
                      prev.includes(project.id)
                        ? prev.filter((projectId) => projectId !== project.id)
                        : [...prev, project.id]
                    );
                  }}
                />

                <span className="assignment-project-icon">
                  <FolderKanban size={18} />
                </span>

                <span className="assignment-option-info">
                  <strong>{project.name}</strong>
                  <small>
                    {project.startDate} — {project.endDate}
                  </small>
                </span>

                <span
                  className={`status-badge ${project.status
                    .toLowerCase()
                    .replaceAll(' ', '-')}`}
                >
                  {project.status}
                </span>

                {selected.includes(project.id) && (
                  <Check size={16} className="selected-check" />
                )}
              </label>
            ))}

            {projects.length === 0 && (
              <div className="empty-state compact">
                No projects available. Create a project first.
              </div>
            )}
          </div>

          <footer className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={saveAssignments}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save assignments'}
            </button>
          </footer>
        </Modal>
      )}
    </>
  );
}
