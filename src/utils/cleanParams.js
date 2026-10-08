// Drops empty filter values so query params only contain what the user chose.
// cleanParams({ search: '', status: 'active' }) -> { status: 'active' }
export function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null))
}
