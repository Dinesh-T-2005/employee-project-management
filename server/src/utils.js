function requiredString(value, label, max = 255) {
  if (typeof value !== 'string' || !value.trim()) throw Object.assign(new Error(`${label} is required.`), { status: 400 });
  if (value.trim().length > max) throw Object.assign(new Error(`${label} must be ${max} characters or fewer.`), { status: 400 });
  return value.trim();
}
function parseProjectIds(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw Object.assign(new Error('projectIds must be an array.'), { status: 400 });
  const ids = [...new Set(value.map(Number))];
  if (ids.some(id => !Number.isInteger(id) || id < 1)) throw Object.assign(new Error('Every project ID must be a positive integer.'), { status: 400 });
  return ids;
}
function validDate(value, label) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value)) || Number.isNaN(Date.parse(value))) {
    throw Object.assign(new Error(`${label} must be a valid date (YYYY-MM-DD).`), { status: 400 });
  }
  return value;
}
module.exports = { requiredString, parseProjectIds, validDate };
