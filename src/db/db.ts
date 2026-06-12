import fs from 'fs';
import path from 'path';

// Define the absolute structure of our database tables
export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'officer' | 'admin';
  createdAt: string;
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
  extracurricularScore: number; // 1-100
  prevAcademicPerformance: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

export interface Application {
  id: number;
  studentId: number;
  courseId: number;
  status: 'Pending' | 'Verified' | 'Approved' | 'Rejected';
  appliedDate: string;
  remarks: string;
}

export interface Document {
  id: number;
  studentId: number;
  tenthMemo?: string;
  twelfthMemo?: string;
  transferCertificate?: string;
  idProof?: string;
  photo?: string;
  uploadedAt: string;
}

export interface EligibilityPrediction {
  id: number;
  applicationId: number;
  eligible: boolean;
  probabilityScore: number;
  predictedAt: string;
}

export interface AIReport {
  id: number;
  applicationId: number;
  reportText: string;
  generatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface DatabaseSchema {
  users: User[];
  courses: Course[];
  students: StudentProfile[];
  applications: Application[];
  documents: Document[];
  eligibilityPredictions: EligibilityPrediction[];
  aiReports: AIReport[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const STORAGE_FILE = path.join(process.cwd(), 'src/db/database_storage.json');

class DatabaseEngine {
  private data: DatabaseSchema = {
    users: [],
    courses: [],
    students: [],
    applications: [],
    documents: [],
    eligibilityPredictions: [],
    aiReports: [],
    notifications: [],
    auditLogs: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seed();
        this.save();
      }
    } catch (err) {
      console.error('Failed to load simulated database. Reinitializing seed database.', err);
      this.seed();
      this.save();
    }
  }

  public save() {
    try {
      const dir = path.dirname(STORAGE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database state:', err);
    }
  }

  private seed() {
    // Generate secure hashed password dummy (comparable tobcrypt's 'password123' or just raw string for simplified auth match)
    // We will support plaintext/simple comparison for the client, but simulate real system security.
    this.data.users = [
      {
        id: 1,
        name: 'System Admin',
        email: 'admin@admission.com',
        passwordHash: 'admin123', // plaintext fallback for simulator logic
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Officer Dr. Robert',
        email: 'officer@admission.com',
        passwordHash: 'officer123',
        role: 'officer',
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Jane Student',
        email: 'jane@admission.com',
        passwordHash: 'jane123',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'David Carter',
        email: 'david@admission.com',
        passwordHash: 'david123',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
    ];

    this.data.courses = [
      {
        id: 1,
        courseName: 'B.Tech Computer Science Engineering',
        department: 'Engineering',
        durationYears: 4,
        totalSeats: 120,
        availableSeats: 118,
        cutoffPercentage: 85.0,
      },
      {
        id: 2,
        courseName: 'B.Tech Information Technology',
        department: 'Engineering',
        durationYears: 4,
        totalSeats: 60,
        availableSeats: 60,
        cutoffPercentage: 80.0,
      },
      {
        id: 3,
        courseName: 'B.Sc Data Science',
        department: 'Sciences',
        durationYears: 3,
        totalSeats: 50,
        availableSeats: 49,
        cutoffPercentage: 75.0,
      },
      {
        id: 4,
        courseName: 'Bachelor of Business Administration',
        department: 'Management',
        durationYears: 3,
        totalSeats: 100,
        availableSeats: 100,
        cutoffPercentage: 70.0,
      },
    ];

    this.data.students = [
      {
        id: 1,
        userId: 3,
        phone: '+1 (555) 432-8765',
        dob: '2004-05-15',
        category: 'General',
        tenthPercentage: 92.5,
        twelfthPercentage: 91.0,
        cgpa: 9.2,
        entranceScore: 88.5,
        attendancePercentage: 95.0,
        extracurricularScore: 80,
        prevAcademicPerformance: 'Excellent',
      },
      {
        id: 2,
        userId: 4,
        phone: '+1 (555) 987-6543',
        dob: '2004-11-20',
        category: 'OBC',
        tenthPercentage: 78.0,
        twelfthPercentage: 76.5,
        cgpa: 7.8,
        entranceScore: 72.0,
        attendancePercentage: 88.0,
        extracurricularScore: 65,
        prevAcademicPerformance: 'Good',
      },
    ];

    this.data.applications = [
      {
        id: 1,
        studentId: 1,
        courseId: 1,
        status: 'Pending',
        appliedDate: new Date(Date.now() - 24 * 3600 * 1000 * 3).toISOString(), // 3 days ago
        remarks: 'Awaiting Document Assessment by the academic committee.',
      },
      {
        id: 2,
        studentId: 2,
        courseId: 3,
        status: 'Verified',
        appliedDate: new Date(Date.now() - 24 * 3600 * 1000 * 1).toISOString(), // 1 day ago
        remarks: 'Transcripts pre-verified by the Admissions Desk.',
      },
    ];

    this.data.documents = [
      {
        id: 1,
        studentId: 1,
        tenthMemo: 'memo10th_jane.pdf',
        twelfthMemo: 'memo12th_jane.pdf',
        transferCertificate: 'tc_jane.pdf',
        idProof: 'id_jane.jpg',
        photo: 'photo_jane.png',
        uploadedAt: new Date(Date.now() - 24 * 3600 * 1000 * 4).toISOString(),
      },
      {
        id: 2,
        studentId: 2,
        tenthMemo: 'memo10th_david.pdf',
        twelfthMemo: 'memo12th_david.pdf',
        transferCertificate: '',
        idProof: 'id_david.jpg',
        photo: 'photo_david.png',
        uploadedAt: new Date(Date.now() - 24 * 3600 * 1000 * 2).toISOString(),
      },
    ];

    this.data.eligibilityPredictions = [
      {
        id: 1,
        applicationId: 1,
        eligible: true,
        probabilityScore: 0.942,
        predictedAt: new Date(Date.now() - 24 * 3600 * 1000 * 3).toISOString(),
      },
      {
        id: 2,
        applicationId: 2,
        eligible: true,
        probabilityScore: 0.778,
        predictedAt: new Date(Date.now() - 24 * 3600 * 1000 * 1).toISOString(),
      },
    ];

    this.data.aiReports = [
      {
        id: 1,
        applicationId: 1,
        reportText: `### 1. Applicant Summary
Jane Student presents a highly competitive profile for the Computer Science Engineering program. Her academic scores are in the top 5% of our applicant pool, and she shows robust attendance and extracurricular participation.

### 2. Candidate Strengths
- **stellar Academics**: Averaging over 91% in secondary and senior secondary boards, with a CGPA exceeding 9.2.
- **Top Entrance Standing**: Scored 88.5% on the institutional engineering examination.
- **Strong Extracurricular Record**: Excellent active participation in secondary science clubs and sports activities.

### 3. Areas of Improvement
- General focus can be expanded into computer programming electives, though core math scores are solid.

### 4. Admission Recommendation & Reasoning
**Highly Recommended (Approved)**
Jane possesses both the academic background and institutional alignment to thrive in CSE. Her entrance score exceeds our cutoff by 8.5%, warranting direct admission.`,
        generatedAt: new Date(Date.now() - 24 * 3600 * 1000 * 3).toISOString(),
      },
    ];

    this.data.notifications = [
      {
        id: 1,
        userId: 3,
        message: 'Your admission form has been registered and is undergoing mathematical eligibility profiling.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    this.data.auditLogs = [
      {
        id: 1,
        userId: null,
        action: 'System Boot',
        details: 'Simulated institutional SQL database loaded and auto-seeded.',
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // --- HELPER QUERIES WITH DYNAMIC SQL OUTPUT AND MOCK TRANSACTIONS ---
  private logSql(query: string, params: any[] = []) {
    const formattedParams = params.map(p => typeof p === 'string' ? `'${p}'` : p).join(', ');
    console.log(`\x1b[36m[Simulated SQL Query]\x1b[0m ${query} \x1b[33m[${formattedParams}]\x1b[0m`);
  }

  // Users Queries
  public getUsers() {
    this.logSql('SELECT * FROM users');
    return this.data.users;
  }

  public getUserByEmail(email: string) {
    this.logSql('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getUserById(id: number) {
    this.logSql('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return this.data.users.find(u => u.id === id) || null;
  }

  public insertUser(name: string, email: string, passwordHash: string, role: 'student' | 'officer' | 'admin') {
    this.logSql('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, '[HASHED]', role]);
    const nextId = this.data.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const newUser: User = { id: nextId, name, email, passwordHash, role, createdAt: new Date().toISOString() };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Students Profile Queries
  public getStudentProfileByUserId(userId: number) {
    this.logSql('SELECT * FROM students WHERE user_id = ? LIMIT 1', [userId]);
    return this.data.students.find(s => s.userId === userId) || null;
  }

  public getStudentProfileById(id: number) {
    this.logSql('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
    return this.data.students.find(s => s.id === id) || null;
  }

  public insertStudentProfile(userId: number) {
    this.logSql('INSERT INTO students (user_id) VALUES (?)', [userId]);
    const nextId = this.data.students.reduce((max, s) => Math.max(max, s.id), 0) + 1;
    const newProfile: StudentProfile = {
      id: nextId,
      userId,
      phone: '',
      dob: '',
      category: 'General',
      tenthPercentage: 0,
      twelfthPercentage: 0,
      cgpa: 0,
      entranceScore: 0,
      attendancePercentage: 0,
      extracurricularScore: 0,
      prevAcademicPerformance: 'Average',
    };
    this.data.students.push(newProfile);
    this.save();
    return newProfile;
  }

  public updateStudentProfile(userId: number, updates: Partial<StudentProfile>) {
    this.logSql('UPDATE students SET ? WHERE user_id = ?', [JSON.stringify(updates), userId]);
    const idx = this.data.students.findIndex(s => s.userId === userId);
    if (idx !== -1) {
      this.data.students[idx] = { ...this.data.students[idx], ...updates };
      this.save();
      return this.data.students[idx];
    }
    return null;
  }

  // Courses Queries
  public getCourses() {
    this.logSql('SELECT * FROM courses');
    return this.data.courses;
  }

  public getCourseById(id: number) {
    this.logSql('SELECT * FROM courses WHERE id = ? LIMIT 1', [id]);
    return this.data.courses.find(c => c.id === id) || null;
  }

  public insertCourse(course: Omit<Course, 'id' | 'availableSeats'>) {
    this.logSql('INSERT INTO courses (course_name, department, duration_years, total_seats, available_seats, cutoff_percentage) VALUES (?, ?, ?, ?, ?, ?)', [
      course.courseName,
      course.department,
      course.durationYears,
      course.totalSeats,
      course.totalSeats,
      course.cutoffPercentage,
    ]);
    const nextId = this.data.courses.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const newCourse: Course = { ...course, id: nextId, availableSeats: course.totalSeats };
    this.data.courses.push(newCourse);
    this.save();
    return newCourse;
  }

  public updateCourse(id: number, updates: Partial<Course>) {
    this.logSql('UPDATE courses SET ? WHERE id = ?', [JSON.stringify(updates), id]);
    const idx = this.data.courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
      this.save();
      return this.data.courses[idx];
    }
    return null;
  }

  public deleteCourse(id: number) {
    this.logSql('DELETE FROM courses WHERE id = ?', [id]);
    const filtered = this.data.courses.filter(c => c.id !== id);
    const deleted = filtered.length !== this.data.courses.length;
    this.data.courses = filtered;
    this.save();
    return deleted;
  }

  // Applications Queries
  public getApplications() {
    this.logSql('SELECT * FROM applications');
    return this.data.applications;
  }

  public getApplicationById(id: number) {
    this.logSql('SELECT * FROM applications WHERE id = ?', [id]);
    return this.data.applications.find(a => a.id === id) || null;
  }

  public insertApplication(studentId: number, courseId: number) {
    this.logSql('INSERT INTO applications (student_id, course_id, status) VALUES (?, ?, ?)', [studentId, courseId, 'Pending']);
    const nextId = this.data.applications.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const newApp: Application = {
      id: nextId,
      studentId,
      courseId,
      status: 'Pending',
      appliedDate: new Date().toISOString(),
      remarks: 'Application submitted. Pending documents and machine learning verification.',
    };
    this.data.applications.push(newApp);
    this.save();
    return newApp;
  }

  public updateApplication(id: number, updates: Partial<Application>) {
    this.logSql('UPDATE applications SET ? WHERE id = ?', [JSON.stringify(updates), id]);
    const idx = this.data.applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      const oldStatus = this.data.applications[idx].status;
      this.data.applications[idx] = { ...this.data.applications[idx], ...updates };
      
      // Dynamic available seats management on approval
      if (updates.status === 'Approved' && oldStatus !== 'Approved') {
        const courseId = this.data.applications[idx].courseId;
        const courseIdx = this.data.courses.findIndex(c => c.id === courseId);
        if (courseIdx !== -1 && this.data.courses[courseIdx].availableSeats > 0) {
          this.data.courses[courseIdx].availableSeats -= 1;
          console.log(`[SQL Trigger] Reduced seat for course ${this.data.courses[courseIdx].courseName}. Available: ${this.data.courses[courseIdx].availableSeats}`);
        }
      } else if (oldStatus === 'Approved' && updates.status && updates.status !== 'Approved') {
        const courseId = this.data.applications[idx].courseId;
        const courseIdx = this.data.courses.findIndex(c => c.id === courseId);
        if (courseIdx !== -1) {
          this.data.courses[courseIdx].availableSeats += 1;
          console.log(`[SQL Trigger] Restored seat for course ${this.data.courses[courseIdx].courseName}. Available: ${this.data.courses[courseIdx].availableSeats}`);
        }
      }
      
      this.save();
      return this.data.applications[idx];
    }
    return null;
  }

  // Documents Queries
  public getDocumentsByStudentId(studentId: number) {
    this.logSql('SELECT * FROM documents WHERE student_id = ?', [studentId]);
    return this.data.documents.find(d => d.studentId === studentId) || null;
  }

  public saveDocuments(studentId: number, docs: Partial<Omit<Document, 'id' | 'studentId' | 'uploadedAt'>>) {
    this.logSql('UPDATE OR INSERT documents FOR student_id = ?', [studentId]);
    const idx = this.data.documents.findIndex(d => d.studentId === studentId);
    if (idx !== -1) {
      this.data.documents[idx] = {
        ...this.data.documents[idx],
        ...docs,
        uploadedAt: new Date().toISOString(),
      };
    } else {
      const nextId = this.data.documents.reduce((max, d) => Math.max(max, d.id), 0) + 1;
      this.data.documents.push({
        id: nextId,
        studentId,
        ...docs,
        uploadedAt: new Date().toISOString(),
      });
    }
    this.save();
    return this.getDocumentsByStudentId(studentId);
  }

  // Predictions Queries
  public getPredictionByApplicationId(applicationId: number) {
    this.logSql('SELECT * FROM eligibility_predictions WHERE application_id = ?', [applicationId]);
    return this.data.eligibilityPredictions.find(p => p.applicationId === applicationId) || null;
  }

  public savePrediction(applicationId: number, eligible: boolean, probabilityScore: number) {
    this.logSql('INSERT INTO eligibility_predictions (application_id, eligible, probability_score) VALUES (?, ?, ?)', [
      applicationId,
      eligible ? 1 : 0,
      probabilityScore,
    ]);
    const idx = this.data.eligibilityPredictions.findIndex(p => p.applicationId === applicationId);
    if (idx !== -1) {
      this.data.eligibilityPredictions[idx] = {
        id: this.data.eligibilityPredictions[idx].id,
        applicationId,
        eligible,
        probabilityScore,
        predictedAt: new Date().toISOString(),
      };
    } else {
      const nextId = this.data.eligibilityPredictions.reduce((max, p) => Math.max(max, p.id), 0) + 1;
      this.data.eligibilityPredictions.push({
        id: nextId,
        applicationId,
        eligible,
        probabilityScore,
        predictedAt: new Date().toISOString(),
      });
    }
    this.save();
    return this.getPredictionByApplicationId(applicationId);
  }

  // AI Reports Queries
  public getAIReportByApplicationId(applicationId: number) {
    this.logSql('SELECT * FROM ai_reports WHERE application_id = ?', [applicationId]);
    return this.data.aiReports.find(r => r.applicationId === applicationId) || null;
  }

  public saveAIReport(applicationId: number, reportText: string) {
    this.logSql('INSERT INTO ai_reports (application_id, report_text) VALUES (?, ?)', [applicationId, '[REDACTED TEXT]']);
    const idx = this.data.aiReports.findIndex(r => r.applicationId === applicationId);
    if (idx !== -1) {
      this.data.aiReports[idx] = {
        id: this.data.aiReports[idx].id,
        applicationId,
        reportText,
        generatedAt: new Date().toISOString(),
      };
    } else {
      const nextId = this.data.aiReports.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      this.data.aiReports.push({
        id: nextId,
        applicationId,
        reportText,
        generatedAt: new Date().toISOString(),
      });
    }
    this.save();
    return this.getAIReportByApplicationId(applicationId);
  }

  // Notifications Queries
  public getNotificationsForUser(userId: number) {
    this.logSql('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public addNotification(userId: number, message: string) {
    this.logSql('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message]);
    const nextId = this.data.notifications.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    this.data.notifications.push({
      id: nextId,
      userId,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    this.save();
  }

  public markAllNotificationsAsRead(userId: number) {
    this.logSql('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    this.data.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  // Audit Logs Queries
  public getAuditLogs() {
    this.logSql('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    return this.data.auditLogs;
  }

  public addAuditLog(userId: number | null, action: string, details: string, ipAddress: string) {
    this.logSql('INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)', [userId || 'NULL', action, details, ipAddress]);
    const nextId = this.data.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    this.data.auditLogs.push({
      id: nextId,
      userId,
      action,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    });
    this.save();
  }
}

export const db = new DatabaseEngine();
