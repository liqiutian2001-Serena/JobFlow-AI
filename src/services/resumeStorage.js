export const RESUME_STORAGE_KEY = 'jobflow-resume'

export function readSavedResume() {
  try {
    return { text: localStorage.getItem(RESUME_STORAGE_KEY) ?? '', error: '' }
  } catch {
    return { text: '', error: 'Browser storage is unavailable. Your saved resume could not be loaded.' }
  }
}
