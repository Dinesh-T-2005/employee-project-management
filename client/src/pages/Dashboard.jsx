
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  GitBranch,
  Activity,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Clock3,
} from 'lucide-react';

import api from '../api';

const cards = [
  {
    key: 'employees',
    label: 'Total employees',
    icon: Users,
    tone: 'blue',
    hint: 'People in your workspace',
  },
  {
    key: 'projects',
    label: 'Total projects',
    icon: FolderKanban,
    tone: 'violet',
    hint: 'Across all project stages',
  },
  {
    key: 'activeProjects',
    label: 'In progress',
    icon: Activity,
    tone: 'green',
    hint: 'Projects actively moving',
  },
  {
    key: 'assignments',
    label: 'Assignments',
    icon: GitBranch,
    tone: 'orange',
    hint: 'Employee-project links',
  },
];

export default function Dashboard({ notify }) {
  const [stats, setStats] = useState({
    employees: 0,
    projects: 0,
    activeProjects: 0,
    assignments: 0,
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/projects'),
    ])
      .then(([statsResponse, projectsResponse]) => {
        setStats(statsResponse.data);
        setProjects(projectsResponse.data.slice(0, 5));
      })
      .catch((error) => {
        notify(error.message, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">OVERVIEW</div>

          <h1>
            Good to see you <span className="wave">✦</span>
          </h1>

          <p>
            Here's what's happening across your people and projects.
          </p>
        </div>

        <div className="heading-actions">
          <Link
            className="btn btn-secondary"
            to="/employees"
          >
            <Users size={17} />
            View employees
          </Link>

          <Link
            className="btn btn-primary"
            to="/projects"
          >
            <Plus size={17} />
            Manage projects
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <section className="stats-grid">
        {cards.map(({ key, label, icon: Icon, tone, hint }) => (
          <article className="stat-card" key={key}>
            <div className="stat-top">
              <span className={`stat-icon ${tone}`}>
                <Icon size={21} />
              </span>

              <span className="stat-more">
                <ArrowUpRight size={16} />
              </span>
            </div>

            <div className="stat-value">
              {loading ? '—' : stats[key] ?? 0}
            </div>

            <div className="stat-label">{label}</div>
            <div className="stat-hint">{hint}</div>
          </article>
        ))}
      </section>

      {/* Dashboard Content */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Jump into your workspace</p>
            </div>
          </div>

          <div className="quick-actions">
            <Link
              to="/employees"
              className="quick-action"
            >
              <span className="quick-icon blue">
                <Users size={20} />
              </span>

              <span>
                <strong>Manage employees</strong>
                <small>
                  Add, update, and assign team members
                </small>
              </span>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/projects"
              className="quick-action"
            >
              <span className="quick-icon violet">
                <FolderKanban size={20} />
              </span>

              <span>
                <strong>Manage projects</strong>
                <small>
                  Track delivery, dates, and status
                </small>
              </span>

              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Recent Projects */}
        <section className="panel projects-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent projects</h2>
              <p>Your latest project activity</p>
            </div>

            <Link
              to="/projects"
              className="text-link"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="empty-state compact">
              Loading projects…
            </div>
          ) : projects.length > 0 ? (
            <div className="recent-list">
              {projects.map((project) => (
                <div
                  className="recent-project"
                  key={project.id}
                >
                  <span className="project-mini-icon">
                    <FolderKanban size={18} />
                  </span>

                  <span className="recent-project-info">
                    <strong>{project.name}</strong>

                    <small>
                      <Clock3 size={13} />
                      Due {project.endDate}
                    </small>
                  </span>

                  <span
                    className={`status-badge ${
                      project.status
                        .toLowerCase()
                        .replaceAll(' ', '-')
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <FolderKanban size={26} />

              <strong>No projects yet</strong>

              <p>
                Create your first project to get started.
              </p>

              <Link
                to="/projects"
                className="text-link"
              >
                Create project <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Dashboard Note */}
      <div className="dashboard-note">
        <span className="note-icon">
          <Activity size={19} />
        </span>

        <span>
          <strong>One workspace, clearer delivery.</strong>

          <small>
            Keep employee information, assignments, and project
            status organized in one place.
          </small>
        </span>
      </div>
    </>
  );
}
