export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'officer' | 'admin';
}

export interface Course {
  id: number;
  courseName: string;
  department: string;
  durationYears: number;
  totalSeats: number;
  availableSeats: number;
  cutoffPercentage: number;
}

export interface StudentProfile {
  id: number;
  userId: number;
  phone: string;
  dob: string;
  category: string;
  tenthPercentage: number;
  twelfthPercentage: number;
  cgpa: number;
  entranceScore: number;
  attendancePercentage: number;
  extracurricularScore: number;
  prevAcademicPerformance: 'Excellent' | 'Good' | 'Average' | 'Poor';
  name?: string;
  email?: string;
}

export interface Application {
  id: number;
  studentId: number;
  studentName?: string;
  studentEmail?: string;
  studentProfile?: StudentProfile;
  courseId: number;
  courseName: string;
  department: string;
  status: 'Pending' | 'Verified' | 'Approved' | 'Rejected';
  appliedDate: string;
  remarks: string;
  prediction?: {
    eligible: boolean;
    probabilityScore: number;
    predictedAt: string;
  };
  aiReport?: string;
}

export interface DocumentInfo {
  tenthMemo?: string;
  twelfthMemo?: string;
  transferCertificate?: string;
  idProof?: string;
  photo?: string;
  uploadedAt?: string;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  metrics: {
    totalStudents: number;
    totalApplications: number;
    pendingVerification: number;
    approvedTotal: number;
  };
  statusDistribution: {
    Pending: number;
    Verified: number;
    Approved: number;
    Rejected: number;
  };
  courseSeats: {
    courseName: string;
    totalSeats: number;
    availableSeats: number;
    filledSeats: number;
  }[];
  machineLearningMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    totalSamples: number;
  };
}
