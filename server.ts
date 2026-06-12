import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/db';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from './src/lib/crypto';
import { admissionModel } from './src/ml/logisticRegression';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Set up general JSON parser with size limits for Base64 transcript uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// --- UTILITY AUTH MIDDLEWARE ---
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const user = verifyJwt(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired authorization token' });
  }

  req.user = user;
  next();
}

function authorizeRoles(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: privilege mismatch' });
    }
    next();
  };
}

// --- REST API ENDPOINTS ---

// 1. Authentication Module
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = hashPassword(password);
    const userRole = role === 'officer' || role === 'admin' ? role : 'student';

    const newUser = db.insertUser(name, email, hashedPassword, userRole);

    if (userRole === 'student') {
      db.insertStudentProfile(newUser.id);
    }

    db.addAuditLog(newUser.id, 'Registration', `Registered successfully in user role: ${newUser.role}`, req.ip);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Account with this email does not exist' });
    }

    const valid = verifyPassword(password, user.passwordHash) || (user.passwordHash === password); // supporting seed plaintext fallback
    if (!valid) {
      return res.status(401).json({ error: 'Credentials verification failed. Incorrect password.' });
    }

    const token = signJwt({ id: user.id, name: user.name, role: user.role, email: user.email });
    db.addAuditLog(user.id, 'Login', 'Logged in successfully', req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Student Profile Module
app.get('/api/student/profile', authenticateToken, (req: any, res) => {
  try {
    const student = db.getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile details check failed' });
    }
    const user = db.getUserById(req.user.id);
    res.json({
      ...student,
      name: user?.name,
      email: user?.email,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student/profile', authenticateToken, (req: any, res) => {
  const updates = req.body;
  try {
    const fields = [
      'phone',
      'dob',
      'category',
      'tenthPercentage',
      'twelfthPercentage',
      'cgpa',
      'entranceScore',
      'attendancePercentage',
      'extracurricularScore',
      'prevAcademicPerformance',
    ];

    const cleanUpdates: any = {};
    for (const f of fields) {
      if (updates[f] !== undefined) {
        if (typeof updates[f] === 'number') {
          cleanUpdates[f] = updates[f];
        } else if (f === 'extracurricularScore') {
          cleanUpdates[f] = parseInt(updates[f]) || 0;
        } else if (f === 'tenthPercentage' || f === 'twelfthPercentage' || f === 'cgpa' || f === 'entranceScore' || f === 'attendancePercentage') {
          cleanUpdates[f] = parseFloat(updates[f]) || 0;
        } else {
          cleanUpdates[f] = updates[f];
        }
      }
    }

    db.updateStudentProfile(req.user.id, cleanUpdates);
    db.addAuditLog(req.user.id, 'Profile Update', 'Updated profile information', req.ip);
    res.json({ message: 'Profile updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload transcripts (Base64 file transport)
app.post('/api/student/documents', authenticateToken, (req: any, res) => {
  const { tenthMemo, twelfthMemo, transferCertificate, idProof, photo } = req.body;
  try {
    const student = db.getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student record could not be located' });
    }

    db.saveDocuments(student.id, {
      tenthMemo: tenthMemo || undefined,
      twelfthMemo: twelfthMemo || undefined,
      transferCertificate: transferCertificate || undefined,
      idProof: idProof || undefined,
      photo: photo || undefined,
    });

    db.addAuditLog(req.user.id, 'Document Upload', 'Uploaded application credentials', req.ip);
    res.json({ message: 'Academic credentials uploaded successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/student/documents', authenticateToken, (req: any, res) => {
  try {
    const student = db.getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile missing' });
    }
    const docs = db.getDocumentsByStudentId(student.id);
    res.json(docs || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET documents by studentId (Admission Officer / Admin inspection)
app.get('/api/documents/:studentId', authenticateToken, authorizeRoles('officer', 'admin'), (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const docs = db.getDocumentsByStudentId(studentId);
    res.json(docs || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Application Module
app.post('/api/applications', authenticateToken, async (req: any, res) => {
  const { courseId } = req.body;
  try {
    if (!courseId) {
      return res.status(400).json({ error: 'Academic Course ID is required' });
    }

    const student = db.getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'No student registration profile established' });
    }

    if (!student.tenthPercentage || !student.twelfthPercentage || !student.entranceScore) {
      return res.status(400).json({
        error: 'Incomplete Academic Profile. Please fill tenth, twelfth percentages, and entrance scores first.',
      });
    }

    // Verify course seats
    const course = db.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Requested academic course not found' });
    }
    if (course.availableSeats <= 0) {
      return res.status(400).json({ error: 'Admission Closed: No vacant seats available in this program.' });
    }

    // Check duplicate applications
    const hasApplied = db.getApplications().some(a => a.studentId === student.id && a.courseId === courseId);
    if (hasApplied) {
      return res.status(400).json({ error: 'You have already submitted an application for this course' });
    }

    // Insert Application
    const application = db.insertApplication(student.id, courseId);

    // Call Machine Learning Classifier
    const predictionResult = admissionModel.predict(student);
    db.savePrediction(application.id, predictionResult.eligible, predictionResult.probabilityScore);

    // Call Generative AI evaluation report (with telemetry user-agent)
    let aiEvaluationText = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY' && geminiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const prompt = `You are an automated academic admissions evaluation committee. 
Evaluate this applicant for the course: "${course.courseName}" within the "${course.department}" department.

### APPLICANT REPORT CARD:
- Name: ${req.user.name}
- Secondary Board Percentage: ${student.tenthPercentage}%
- Higher Secondary Board Percentage: ${student.twelfthPercentage}%
- Core Cumulative GPA: ${student.cgpa}
- institutional Entrance Exam Score: ${student.entranceScore}/100
- Class Attendance Rate: ${student.attendancePercentage}%
- Extracurricular Level (out of 100): ${student.extracurricularScore}
- Past Academic Progression Grade: ${student.prevAcademicPerformance}
- Admission Quota Category Selected: ${student.category}

### SYSTEM MACHINE LEARNING RECOMMENDATION:
- Predicted Admission Eligibility: ${predictionResult.eligible ? 'Eligible for Direct Admission' : 'Conditional Admissions Desk Review Required'}
- Predictor Confidence Probability: ${(predictionResult.probabilityScore * 100).toFixed(1)}%

Provide a clean, styled Markdown report. Use exactly these headers and nothing else:
### 1. Applicant Summary
### 2. Candidate Strengths
### 3. Areas of Improvement
### 4. Admission Recommendation & Reasoning`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        });

        aiEvaluationText = response.text || '';
      } catch (geminiError: any) {
        console.error('Gemini API query failed. Reverting to automated heuristic report.', geminiError);
      }
    }

    // Fallback automated report if Gemini key is missing or failed
    if (!aiEvaluationText) {
      aiEvaluationText = `### 1. Applicant Summary
The candidate, ${req.user.name}, is applying for ${course.courseName}. Based on the administrative metrics, they present an active profile. The Logistic Regression model predicts they are **${predictionResult.eligible ? 'ELIGIBLE' : 'REVIEW LIST'}** with ${Math.round(predictionResult.probabilityScore * 100)}% prediction likelihood.

### 2. Candidate Strengths
- **Engineering Cutoff Mapping**: High potential with entrance standing of ${student.entranceScore}%.
- **Academic Consistency**: Secondary scores show solid grounding for institutional demands.
- **Attendance Discipline**: Attendance recorded at ${student.attendancePercentage}%, indicating strong program engagement.

### 3. Areas of Improvement
- Extracurricular score sits at index ${student.extracurricularScore}/100, which can be enriched during further labs and research.

### 4. Admission Recommendation & Reasoning
**Recommended for Admission Review**
The candidate shows alignment with course cutoff parameters. It is advised to verify the physical marksheets and proceed with immediate registration.`;
    }

    db.saveAIReport(application.id, aiEvaluationText);
    db.addNotification(req.user.id, `Application submitted successfully for ${course.courseName}! ML eligibility score: ${Math.round(predictionResult.probabilityScore * 100)}%`);
    db.addAuditLog(req.user.id, 'Application Submitted', `Applied for course: ${course.courseName}`, req.ip);

    res.status(201).json({
      message: 'Application registered successfully.',
      applicationId: application.id,
      prediction: predictionResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/student/applications', authenticateToken, (req: any, res) => {
  try {
    const student = db.getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.json([]);
    }

    const apps = db.getApplications()
      .filter(a => a.studentId === student.id)
      .map(app => {
        const course = db.getCourseById(app.courseId);
        const prediction = db.getPredictionByApplicationId(app.id);
        const report = db.getAIReportByApplicationId(app.id);
        return {
          ...app,
          courseName: course?.courseName || 'Deactivated Course',
          department: course?.department || 'N/A',
          prediction,
          aiReport: report?.reportText || '',
        };
      });

    res.json(apps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/applications/all', authenticateToken, authorizeRoles('officer', 'admin'), (req, res) => {
  try {
    const apps = db.getApplications().map(app => {
      const student = db.getStudentProfileById(app.studentId);
      const studentUser = student ? db.getUserById(student.userId) : null;
      const course = db.getCourseById(app.courseId);
      const prediction = db.getPredictionByApplicationId(app.id);
      const report = db.getAIReportByApplicationId(app.id);

      return {
        ...app,
        studentName: studentUser?.name || 'Unknown Student',
        studentEmail: studentUser?.email || 'N/A',
        studentProfile: student,
        courseName: course?.courseName || 'Deactivated Course',
        department: course?.department || 'N/A',
        prediction,
        aiReport: report?.reportText || '',
      };
    });

    res.json(apps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/applications/:id/status', authenticateToken, authorizeRoles('officer', 'admin'), (req: any, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  try {
    const appId = parseInt(id);
    const existing = db.getApplicationById(appId);
    if (!existing) {
      return res.status(404).json({ error: 'Application record not found' });
    }

    db.updateApplication(appId, {
      status: status || existing.status,
      remarks: remarks || existing.remarks,
    });

    const student = db.getStudentProfileById(existing.studentId);
    if (student) {
      const course = db.getCourseById(existing.courseId);
      const courseName = course ? course.courseName : 'admission file';
      db.addNotification(student.userId, `Your application status for ${courseName} was updated to: ${status}. Remarks: ${remarks || 'None'}`);
    }

    db.addAuditLog(req.user.id, 'Evaluate Application', `Updated app ID ${appId} status to ${status}`, req.ip);
    res.json({ message: 'Application evaluation submitted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Course Management Module
app.get('/api/courses', (req, res) => {
  try {
    res.json(db.getCourses());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', authenticateToken, authorizeRoles('admin'), (req: any, res) => {
  const { courseName, department, durationYears, totalSeats, cutoffPercentage } = req.body;
  try {
    if (!courseName || !department || !durationYears || !totalSeats || !cutoffPercentage) {
      return res.status(400).json({ error: 'All fields are required to seed course records' });
    }

    const c = db.insertCourse({
      courseName,
      department,
      durationYears: parseInt(durationYears),
      totalSeats: parseInt(totalSeats),
      cutoffPercentage: parseFloat(cutoffPercentage),
    });

    db.addAuditLog(req.user.id, 'Add Course', `Added course: ${courseName}`, req.ip);
    res.status(201).json(c);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/courses/:id', authenticateToken, authorizeRoles('admin'), (req: any, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updated = db.updateCourse(parseInt(id), {
      courseName: updates.courseName,
      department: updates.department,
      durationYears: updates.durationYears ? parseInt(updates.durationYears) : undefined,
      totalSeats: updates.totalSeats ? parseInt(updates.totalSeats) : undefined,
      availableSeats: updates.availableSeats ? parseInt(updates.availableSeats) : undefined,
      cutoffPercentage: updates.cutoffPercentage ? parseFloat(updates.cutoffPercentage) : undefined,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Course not found' });
    }

    db.addAuditLog(req.user.id, 'Update Course', `Updated course ID ${id}`, req.ip);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/courses/:id', authenticateToken, authorizeRoles('admin'), (req: any, res) => {
  const { id } = req.params;
  try {
    const success = db.deleteCourse(parseInt(id));
    if (!success) {
      return res.status(404).json({ error: 'Course record not located' });
    }
    db.addAuditLog(req.user.id, 'Delete Course', `Deleted course ID ${id}`, req.ip);
    res.json({ message: 'Course record deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Audit logs, Notifications and Analytics
app.get('/api/admin/audit-logs', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    res.json(db.getAuditLogs());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications', authenticateToken, (req: any, res) => {
  try {
    res.json(db.getNotificationsForUser(req.user.id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/read', authenticateToken, (req: any, res) => {
  try {
    db.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/analytics', authenticateToken, authorizeRoles('officer', 'admin'), (req, res) => {
  try {
    const coursesVal = db.getCourses();
    const apps = db.getApplications();
    const studentsVal = db.getUsers().filter(u => u.role === 'student');

    // Categorization counts
    const statusCounts = {
      Pending: apps.filter(a => a.status === 'Pending').length,
      Verified: apps.filter(a => a.status === 'Verified').length,
      Approved: apps.filter(a => a.status === 'Approved').length,
      Rejected: apps.filter(a => a.status === 'Rejected').length,
    };

    const departmentSeats = coursesVal.map(c => ({
      courseName: c.courseName,
      totalSeats: c.totalSeats,
      availableSeats: c.availableSeats,
      filledSeats: c.totalSeats - c.availableSeats,
    }));

    // Math metrics validation
    const mlMeta = admissionModel.evaluateModel();

    res.json({
      metrics: {
        totalStudents: studentsVal.length,
        totalApplications: apps.length,
        pendingVerification: statusCounts.Pending,
        approvedTotal: statusCounts.Approved,
      },
      statusDistribution: statusCounts,
      courseSeats: departmentSeats,
      machineLearningMetrics: mlMeta,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Expose ML parameters manually for educational verification
app.get('/api/ml/evaluation', (req, res) => {
  try {
    res.json(admissionModel.evaluateModel());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Expose simple test route for checking if backend is active
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});

// --- CLIENT STATIC AND VITE SERVER MIDDLEWARE BRIDGE ---
async function startFullStackServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULL-STACK PORTAL ACTIVE] Express + Vite server listening on http://localhost:${PORT}`);
  });
}

startFullStackServer().catch(err => {
  console.error('Fatal initialization error in running Express + Vite server:', err);
});
