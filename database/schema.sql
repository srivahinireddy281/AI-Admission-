-- SQL Schema for the AI-Enhanced Admission Management System
-- Institutional Relational Configuration (MySQL 8.0+)

CREATE DATABASE IF NOT EXISTS admission_system;
USE admission_system;

-- 1. Users Table (Core authorization records)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'officer', 'admin') DEFAULT 'student' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Academic Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(120) NOT NULL,
    department VARCHAR(100) NOT NULL,
    duration_years TINYINT NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    cutoff_percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_course_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Student Profile Credentials Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    dob DATE DEFAULT NULL,
    category VARCHAR(50) DEFAULT 'General',
    tenth_percentage DECIMAL(5, 2) DEFAULT 0.00,
    twelfth_percentage DECIMAL(5, 2) DEFAULT 0.00,
    cgpa DECIMAL(4, 2) DEFAULT 0.00,
    entrance_score DECIMAL(5, 2) DEFAULT 0.00,
    attendance_percentage DECIMAL(5, 2) DEFAULT 0.00,
    extracurricular_score INT DEFAULT 0,
    prev_academic_performance ENUM('Excellent', 'Good', 'Average', 'Poor') DEFAULT 'Average',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Course Applications Form
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    status ENUM('Pending', 'Verified', 'Approved', 'Rejected') DEFAULT 'Pending' NOT NULL,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(500) DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_app_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Student Verified Documents Table (Base64 references stored inside VARCHAR/TEXT)
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNIQUE NOT NULL,
    tenth_memo LONGTEXT DEFAULT NULL,
    twelfth_memo LONGTEXT DEFAULT NULL,
    transfer_certificate LONGTEXT DEFAULT NULL,
    id_proof LONGTEXT DEFAULT NULL,
    photo LONGTEXT DEFAULT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Logistic Regression Prediction Logs
CREATE TABLE IF NOT EXISTS eligibility_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT UNIQUE NOT NULL,
    eligible TINYINT(1) NOT NULL,
    probability_score DECIMAL(5, 4) NOT NULL,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Generative AI Admission Evaluation Reports Table
CREATE TABLE IF NOT EXISTS ai_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT UNIQUE NOT NULL,
    report_text TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Notifications Alert Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read TINYINT(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Complete Security & Transaction Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    details VARCHAR(1000) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
