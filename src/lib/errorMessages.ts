/**
 * Utility to map raw error messages to user-friendly messages
 * This prevents leaking sensitive system information to users
 */

interface ErrorWithDetails {
  message?: string;
  code?: string;
  status?: number;
}

export const getSafeErrorMessage = (error: ErrorWithDetails | unknown): string => {
  const errorObj = error as ErrorWithDetails;
  const errorMessage = errorObj?.message?.toLowerCase() || '';
  const errorCode = errorObj?.code;

  // Auth-related errors
  if (errorMessage.includes('invalid login') || errorMessage.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (errorMessage.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }
  if (errorMessage.includes('email already') || errorMessage.includes('user already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (errorMessage.includes('weak password') || errorMessage.includes('password')) {
    return 'Password is too weak. Please use a stronger password (at least 6 characters).';
  }
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (errorMessage.includes('session') || errorMessage.includes('token')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Database constraint errors
  if (errorCode === '23505') {
    return 'This record already exists.';
  }
  if (errorCode === '23503') {
    return 'Invalid reference to another record.';
  }
  if (errorCode === '23502') {
    return 'Required information is missing.';
  }

  // Permission errors
  if (errorMessage.includes('permission denied') || errorMessage.includes('not authorized')) {
    return 'You do not have permission to perform this action.';
  }
  if (errorMessage.includes('row-level security') || errorMessage.includes('rls')) {
    return 'You do not have permission to access this data.';
  }

  // Resource errors
  if (errorMessage.includes('not found') || errorCode === 'PGRST116') {
    return 'The requested resource was not found.';
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (errorMessage.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Payment-related errors
  if (errorMessage.includes('payment') || errorMessage.includes('transaction')) {
    return 'Payment processing failed. Please try again or use a different payment method.';
  }

  // Booking errors
  if (errorMessage.includes('booking') || errorMessage.includes('seats')) {
    return 'Booking failed. Please try again.';
  }

  // Generic fallback - never expose the actual error message
  return 'An error occurred. Please try again or contact support.';
};

/**
 * Get a safe auth error message specifically for authentication flows
 */
export const getSafeAuthErrorMessage = (error: ErrorWithDetails | unknown): string => {
  const errorObj = error as ErrorWithDetails;
  const errorMessage = errorObj?.message?.toLowerCase() || '';

  if (errorMessage.includes('invalid login') || errorMessage.includes('invalid credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (errorMessage.includes('email not confirmed')) {
    return 'Please check your email and click the verification link before signing in.';
  }
  if (errorMessage.includes('user already registered') || errorMessage.includes('email already')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (errorMessage.includes('weak password')) {
    return 'Please choose a stronger password with at least 6 characters.';
  }
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (errorMessage.includes('expired') || errorMessage.includes('invalid token')) {
    return 'Your session has expired. Please sign in again.';
  }

  return 'Authentication failed. Please try again.';
};
