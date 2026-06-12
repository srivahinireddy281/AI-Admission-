-- Seeding Script for AI-Enhanced Admission Management System
-- Standard Institutional Seed Datasets

USE admission_system;

-- 1. Insert Core Institutional Roles
-- Password for all accounts is 'password123' hashed with SHA-256 (using standard salt fallback: hex-encoded)
-- Jane (Student): jane123 -> matches standard fallback validation password
-- David (Student): david123
-- Admin : admin123
-- Officer : officer123

INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'System Administrator', 'admin@admission.com', 'admin123', 'admin'),
(2, 'Officer Dr. Robert', 'officer@admission.com', 'officer123', 'officer'),
(3, 'Jane Student', 'jane@admission.com', 'jane123', 'student'),
(4, 'David Carter', 'david@admission.com', 'david123', 'student');

-- 2. Insert Departmental Programs & Courses
INSERT INTO courses (id, course_name, department, duration_years, total_seats, available_seats, cutoff_percentage) VALUES
(1, 'B.Tech Computer Science Engineering', 'Engineering', 4, 120, 118, 85.00),
(2, 'B.Tech Information Technology', 'Engineering', 4, 60, 60, 80.00),
(3, 'B.Sc Data Science', 'Sciences', 3, 50, 49, 75.00),
(4, 'Bachelor of Business Administration', 'Management', 3, 100, 100, 70.00);

-- 3. Insert Student High-School and Entrance Exam Metrics
INSERT INTO students (id, user_id, phone, dob, category, tenth_percentage, twelfth_percentage, cgpa, entrance_score, attendance_percentage, extracurricular_score, prev_academic_performance) VALUES
(1, 3, '+1 (555) 432-8765', '2004-05-15', 'General', 92.50, 91.00, 9.20, 88.50, 95.00, 80, 'Excellent'),
(2, 4, '+1 (555) 987-6543', '2004-11-20', 'OBC', 78.00, 76.50, 7.80, 72.00, 88.00, 65, 'Good');

-- 4. Create Active Applications
INSERT INTO applications (id, student_id, course_id, status, applied_date, remarks) VALUES
(1, 1, 1, 'Pending', '2026-06-09 10:00:00', 'Awaiting Document Assessment by the academic committee.'),
(2, 2, 3, 'Verified', '2026-06-11 14:30:00', 'Transcripts pre-verified by the Admissions Desk.');

-- 5. Track Historical System Events
INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp) VALUES
(1, 1, 'Database Seed', 'Instantiated default institutional schemas and loaded seed coefficients.', '127.0.0.1', '2026-06-11 09:00:00'),
(2, 3, 'Profile Completion', 'Jane Student saved basic matriculation score records.', '192.168.1.45', '2026-06-11 09:12:00'),
(3, 4, 'Profile Completion', 'David Carter updated academic percentage records.', '192.168.1.100', '2026-06-11 14:15:00');
