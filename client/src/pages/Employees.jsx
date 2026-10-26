
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Users,
  BriefcaseBusiness,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

import api from '../api';
import EmployeeForm from '../components/EmployeeForm';
import { ConfirmModal } from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Employees({ notify }) {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [employeeResponse, projectResponse] = await Promise.all([
        api.get('/employees', {
          params: {
            search,
            page,
            limit: 8,
          },
        }),
        api.get('/projects'),
      ]);

      setEmployees(employeeResponse.data.data);
      setPagination(employeeResponse.data.pagination);
      setProjects(projectResponse.data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page, notify]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 250);

    return () => clearTimeout(timer);
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = async (employee) => {
    try {
      const response = await api.get(`/employees/${employee.id}`);

      setEditing(response.data);
      setFormOpen(true);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const save = async (data) => {
    setSaving(true);

    try {
      if (editing) {
        await api.put(`/employees/${editing.id}`, data);
        notify('Employee updated successfully.');
      } else {
        await api.post('/employees', data);
        notify('Employee created successfully.');
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
      await api.delete(`/employees/${deleting.id}`);

      notify('Employee deleted successfully.');
      setDeleting(null);

      if (employees.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await load();
      }
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
          <div className="eyebrow">PEOPLE DIRECTORY</div>
          <h1>Employees</h1>
          <p>
            Manage your team, roles, and project assignments.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAdd}
        >
          <Plus size={18} />
          Add employee
        </button>
      </div>

      {/* Employee Statistics */}
      <section className="stat-strip">
        <span className="strip-icon">
          <Users size={20} />
        </span>

        <span>
          <strong>{pagination.total}</strong>
          <small>Total employees</small>
        </span>

        <span className="strip-divider" />

        <span>
          <strong>{projects.length}</strong>
          <small>Available projects</small>
        </span>
      </section>

      {/* Employee Table */}
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2>All employees</h2>
            <p>Employee records and project assignments</p>
          </div>

          <label className="table-search">
            <Search size={17} />

            <input
              placeholder="Search employees…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <kbd>⌕</kbd>
          </label>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>CONTACT</th>
                <th>DESIGNATION</th>
                <th>PROJECTS</th>
                <th className="action-col">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="table-loading">
                      <RefreshCw size={18} />
                      Loading employees…
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <Link
                        to={`/employees/${employee.id}`}
                        className="employee-cell"
                      >
                        <span
                          className={`person-avatar avatar-${employee.id % 6}`}
                        >
                          {employee.name
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </span>

                        <span>
                          <strong>{employee.name}</strong>
                          <small>
                            EMP-{String(employee.id).padStart(4, '0')}
                          </small>
                        </span>
                      </Link>
                    </td>

                    <td>
                      <div className="contact-stack">
                        <span>
                          <Mail size={14} />
                          {employee.email}
                        </span>

                        <span>
                          <Phone size={14} />
                          {employee.phone}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="designation-tag">
                        {employee.designation}
                      </span>
                    </td>

                    <td>
                      <span className="project-count">
                        <BriefcaseBusiness size={14} />
                        {employee.projectCount}{' '}
                        {employee.projectCount === 1
                          ? 'project'
                          : 'projects'}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="icon-button"
                          title="View details"
                          aria-label="View employee details"
                        >
                          <Eye size={17} />
                        </Link>

                        <button
                          className="icon-button"
                          title="Edit employee"
                          aria-label="Edit employee"
                          onClick={() => openEdit(employee)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="icon-button danger-hover"
                          title="Delete employee"
                          aria-label="Delete employee"
                          onClick={() => setDeleting(employee)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <Users size={30} />

                      <strong>
                        {search
                          ? 'No matching employees'
                          : 'No employees yet'}
                      </strong>

                      <p>
                        {search
                          ? 'Try another name, email, phone, or designation.'
                          : 'Add your first employee to start building your team.'}
                      </p>

                      {!search && (
                        <button
                          className="btn btn-primary"
                          onClick={openAdd}
                        >
                          <Plus size={17} />
                          Add employee
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      </section>

      {/* Add / Edit Employee Modal */}
      {formOpen && (
        <EmployeeForm
          employee={editing}
          projects={projects}
          onClose={() => setFormOpen(false)}
          onSave={save}
          saving={saving}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <ConfirmModal
          title="Delete employee?"
          message={`Delete ${deleting.name}? Their project assignments will also be removed. This action cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
          busy={deleteBusy}
        />
      )}
    </>
  );
}
