// Utility for showing loading and error messages in a consistent way
// Usage: import { showLoading, showError, hideLoading } from './feedbackUtils'
import toast from 'react-hot-toast';

let loadingToastId = null;

export function showLoading(message = 'Loading...') {
  if (loadingToastId) return;
  loadingToastId = toast.loading(message, { id: 'global-loading' });
}

export function hideLoading() {
  if (loadingToastId) {
    toast.dismiss(loadingToastId);
    loadingToastId = null;
  }
}

export function showError(error) {
  let msg = typeof error === 'string' ? error : (error?.message || 'An error occurred');
  toast.error(msg);
}
