import { 
  User, 
  Course, 
  StudentProfile, 
  Application, 
  DocumentInfo, 
  AuditLog, 
  Notification, 
  AnalyticsSummary 
} from '../types';

const getHeaders = () => {
  const token = localStorage.getItem('admission_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  // --- AUTH FLOWS ---
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Authentication failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }
    return res.json();
  },

  // --- STUDENT PROFILES ---
  async getProfile(): Promise<StudentProfile & { name: string; email: string }> {
    const res = await fetch('/api/student/profile', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user profile data');
    return res.json();
  },

  async updateProfile(profile: Partial<StudentProfile>): Promise<{ message: string }> {
    const res = await fetch('/api/student/profile', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to apply profile updates');
    }
    return res.json();
  },

  // --- TRANSCRIPTS & DOCUMENTS ---
  async uploadDocuments(docs: DocumentInfo): Promise<{ message: string }> {
    const res = await fetch('/api/student/documents', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(docs),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to persist uploaded document records');
    }
    return res.json();
  },

  async getDocuments(): Promise<DocumentInfo> {
    const res = await fetch('/api/student/documents', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to retrieve uploaded student documents');
    return res.json();
  },

  async getStudentDocuments(studentId: number): Promise<DocumentInfo> {
    const res = await fetch(`/api/documents/${studentId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Unassigned privileges: Cannot inspect requested student files');
    return res.json();
  },

  // --- COURSE SELECTIONS ---
  async getCourses(): Promise<Course[]> {
    const res = await fetch('/api/courses', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to download course listings');
    return res.json();
  },

  async addCourse(course: Omit<Course, 'id' | 'availableSeats'>): Promise<Course> {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(course),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Forbidden: Failed to add course record');
    }
    return res.json();
  },

  async updateCourse(id: number, course: Partial<Course>): Promise<Course> {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(course),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Forbidden: Failed to update course entry');
    }
    return res.json();
  },

  async deleteCourse(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Forbidden: Failed to delete course record');
    }
    return res.json();
  },

  // --- ADMISSION APPLICATIONS ---
  async getStudentApplications(): Promise<Application[]> {
    const res = await fetch('/api/student/applications', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch personal admission applications');
    return res.json();
  },

  async submitApplication(courseId: number): Promise<{ message: string; applicationId: number }> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Admissions filing refused');
    }
    return res.json();
  },

  async getAllApplications(): Promise<Application[]> {
    const res = await fetch('/api/applications/all', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch institutional application archives');
    return res.json();
  },

  async updateApplicationStatus(id: number, status: 'Verified' | 'Approved' | 'Rejected', remarks: string): Promise<{ message: string }> {
    const res = await fetch(`/api/applications/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to record application grading decision');
    }
    return res.json();
  },

  // --- ANALYTICS & LOGGING ARCHIVES ---
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/admin/analytics', { headers: getHeaders() });
    if (!res.ok) throw new Error('Access denied: Cannot fetch administrative metrics');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/admin/audit-logs', { headers: getHeaders() });
    if (!res.ok) throw new Error('Access denied: Cannot export platform audit files');
    return res.json();
  },

  // --- NOTIFICATION UTILITIES ---
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch('/api/notifications', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to download system notifications');
    return res.json();
  },

  async markNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/read', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear notifications state');
    return res.json();
  },
};
export default api;
