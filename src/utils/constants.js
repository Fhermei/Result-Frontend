// Grade Point Mapping
export const GRADE_POINTS = {
  'A': 5.0,
  'B': 4.0,
  'C': 3.0,
  'D': 2.0,
  'E': 1.0,
  'F': 0.0,
};

// Grade Boundaries
export const GRADE_BOUNDARIES = [
  { min: 70, max: 100, grade: 'A', point: 5.0, description: 'Excellent' },
  { min: 60, max: 69, grade: 'B', point: 4.0, description: 'Very Good' },
  { min: 50, max: 59, grade: 'C', point: 3.0, description: 'Good' },
  { min: 45, max: 49, grade: 'D', point: 2.0, description: 'Fair' },
  { min: 40, max: 44, grade: 'E', point: 1.0, description: 'Pass' },
  { min: 0, max: 39, grade: 'F', point: 0.0, description: 'Fail' },
];

// Class of Degree based on CGPA
export const CLASS_DEGREE = [
  { min: 4.50, max: 5.00, class: 'First Class', description: 'Distinction' },
  { min: 3.50, max: 4.49, class: 'Second Class Upper', description: 'Upper Credit' },
  { min: 2.40, max: 3.49, class: 'Second Class Lower', description: 'Lower Credit' },
  { min: 1.50, max: 2.39, class: 'Third Class', description: 'Pass' },
  { min: 1.00, max: 1.49, class: 'Pass', description: 'Pass' },
  { min: 0.00, max: 0.99, class: 'Probation', description: 'Probation' },
];

// Semester Types
export const SEMESTER_TYPES = [
  { value: 'first', label: 'First Semester' },
  { value: 'second', label: 'Second Semester' },
];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    ME: '/auth/me/',
    CHANGE_PASSWORD: '/auth/change-password/',
    USERS: '/auth/users/',
    LECTURERS: '/auth/lecturers/',
  },
  ACADEMICS: {
    FACULTIES: '/academics/faculties/',
    DEPARTMENTS: '/academics/departments/',
    SESSIONS: '/academics/sessions/',
    SEMESTERS: '/academics/semesters/',
    LEVELS: '/academics/levels/',
    CURRENT_SEMESTER: '/academics/current-semester/',
  },
  COURSES: {
    LIST: '/courses/',
    MY_COURSES: '/courses/my-courses/',
    REGISTER: '/courses/register/',
    MY_REGISTRATIONS: '/courses/my-registrations/',
  },
  RESULTS: {
    LIST: '/results/',
    MY_RESULTS: '/results/my-results/',
    BULK_UPLOAD: '/results/bulk-upload/',
    GPA: '/results/gpa/',
    CALCULATE_GPA: '/results/calculate-gpa/',
    CALCULATE_CGPA: '/results/calculate-cgpa/',
    PUBLISH: '/results/publish/',
    TRANSCRIPT: '/results/transcript/',
  },
  STUDENTS: {
    LIST: '/students/',
    MY_PROFILE: '/students/my-profile/',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_FULL: 'DD MMM YYYY, h:mm A',
};