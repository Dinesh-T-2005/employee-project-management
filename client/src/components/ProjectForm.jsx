
import React, { useEffect, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import Modal from './Modal';

const empty = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'Planned',
};

export default function ProjectForm({
  project,
  onClose,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(project ? { ...empty, ...project } : empty);
    setErrors({});
  }, [project]);

  const update = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    const next = {};

    if (!form.name.trim()) {
      next.name = 'Project name is required.';
    }

    if (!form.startDate) {
      next.startDate = 'Start date is required.';
    }

    if (!form.endDate) {
      next.endDate = 'End date is required.';
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      next.endDate =
        'End date must be on or after start date.';
    }

    setErrors(next);

    if (Object.keys(next).length === 0) {
      onSave({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
      });
    }
  };

  return (
    <Modal
      title={project ? 'Edit project' : 'Create project'}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} noValidate>
        {/* Project Name */}
        <label className="field">
          <span>Project name *</span>

          <div className="input-icon">
            <FolderKanban size={17} />

            <input
              name="name"
              value={form.name}
              onChange={update}
              placeholder="e.g. Customer Portal"
              maxLength={160}
            />
          </div>

          {errors.name && (
            <small className="field-error">
              {errors.name}
            </small>
          )}
        </label>

        {/* Description */}
        <label className="field">
          <span>Description</span>

          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows={3}
            placeholder="What is this project about?"
          />
        </label>

        {/* Project Dates and Status */}
        <div className="form-grid">
          <label className="field">
            <span>Start date *</span>

            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={update}
            />

            {errors.startDate && (
              <small className="field-error">
                {errors.startDate}
              </small>
            )}
          </label>

          <label className="field">
            <span>End date *</span>

            <input
              type="date"
              name="endDate"
              min={form.startDate || undefined}
              value={form.endDate}
              onChange={update}
            />

            {errors.endDate && (
              <small className="field-error">
                {errors.endDate}
              </small>
            )}
          </label>

          <label className="field">
            <span>Status</span>

            <select
              name="status"
              value={form.status}
              onChange={update}
            >
              {[
                'Planned',
                'In Progress',
                'On Hold',
                'Completed',
              ].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
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
              : project
                ? 'Save changes'
                : 'Create project'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
