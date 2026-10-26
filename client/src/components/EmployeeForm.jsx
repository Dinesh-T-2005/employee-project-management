
import React, { useEffect, useState } from 'react';
import {
  UserRound,
  Mail,
  Phone,
  BriefcaseBusiness,
} from 'lucide-react';

import Modal from './Modal';

const empty = {
  name: '',
  email: '',
  phone: '',
  designation: '',
  projectIds: [],
};

export default function EmployeeForm({
  employee,
  projects,
  onClose,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(
      employee
        ? {
            ...empty,
            ...employee,
            projectIds:
              employee.projectIds ||
              employee.projects?.map((project) => project.id) ||
              [],
          }
        : empty
    );

    setErrors({});
  }, [employee]);

  const update = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleProject = (id) => {
    setForm((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(id)
        ? prev.projectIds.filter((projectId) => projectId !== id)
        : [...prev.projectIds, id],
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    const next = {};

    if (!form.name.trim()) {
      next.name = 'Name is required.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email.';
    }

    if (!form.phone.trim()) {
      next.phone = 'Phone is required.';
    }

    if (!form.designation.trim()) {
      next.designation = 'Designation is required.';
    }

    setErrors(next);

    if (Object.keys(next).length === 0) {
      onSave({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        designation: form.designation.trim(),
      });
    }
  };

  return (
    <Modal
      title={employee ? 'Edit employee' : 'Add employee'}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          {/* Full Name */}
          <label className="field">
            <span>Full name *</span>

            <div className="input-icon">
              <UserRound size={17} />

              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="e.g. Priya Sharma"
                maxLength={120}
              />
            </div>

            {errors.name && (
              <small className="field-error">
                {errors.name}
              </small>
            )}
          </label>

          {/* Email */}
          <label className="field">
            <span>Email address *</span>

            <div className="input-icon">
              <Mail size={17} />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                placeholder="name@company.com"
                maxLength={190}
              />
            </div>

            {errors.email && (
              <small className="field-error">
                {errors.email}
              </small>
            )}
          </label>

          {/* Phone */}
          <label className="field">
            <span>Phone number *</span>

            <div className="input-icon">
              <Phone size={17} />

              <input
                name="phone"
                value={form.phone}
                onChange={update}
                placeholder="Phone number"
                maxLength={30}
              />
            </div>

            {errors.phone && (
              <small className="field-error">
                {errors.phone}
              </small>
            )}
          </label>

          {/* Designation */}
          <label className="field">
            <span>Designation *</span>

            <div className="input-icon">
              <BriefcaseBusiness size={17} />

              <input
                name="designation"
                value={form.designation}
                onChange={update}
                placeholder="e.g. Frontend Developer"
                maxLength={120}
              />
            </div>

            {errors.designation && (
              <small className="field-error">
                {errors.designation}
              </small>
            )}
          </label>
        </div>

        {/* Project Assignment */}
        <div className="field project-picker">
          <span>
            Assign projects <small>(optional)</small>
          </span>

          {projects.length > 0 ? (
            <div className="checkbox-list">
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="checkbox-option"
                >
                  <input
                    type="checkbox"
                    checked={form.projectIds.includes(project.id)}
                    onChange={() => toggleProject(project.id)}
                  />

                  <span>{project.name}</span>

                  <em
                    className={`status-dot status-${project.status
                      .toLowerCase()
                      .replaceAll(' ', '-')}`}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="muted-text">
              Create a project first to assign it here.
            </p>
          )}
        </div>

        {/* Form Actions */}
        <footer className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? 'Saving…'
              : employee
                ? 'Save changes'
                : 'Create employee'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
