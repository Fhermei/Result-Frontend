// Calculate grade from total score
export const calculateGrade = (totalScore) => {
  if (totalScore >= 70) return 'A';
  if (totalScore >= 60) return 'B';
  if (totalScore >= 50) return 'C';
  if (totalScore >= 45) return 'D';
  if (totalScore >= 40) return 'E';
  return 'F';
};

// Calculate grade point from grade
export const calculateGradePoint = (grade) => {
  const points = { 'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0 };
  return points[grade] || 0;
};

// Calculate GPA for a semester
export const calculateGPA = (courses) => {
  let totalQualityPoints = 0;
  let totalCreditUnits = 0;
  
  courses.forEach(course => {
    const gradePoint = calculateGradePoint(course.grade);
    totalQualityPoints += course.credit_unit * gradePoint;
    totalCreditUnits += course.credit_unit;
  });
  
  if (totalCreditUnits === 0) return 0;
  return parseFloat((totalQualityPoints / totalCreditUnits).toFixed(2));
};

// Calculate CGPA from semester GPAs
export const calculateCGPA = (semesterGPAs) => {
  if (semesterGPAs.length === 0) return 0;
  const sum = semesterGPAs.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / semesterGPAs.length).toFixed(2));
};

// Get class of degree from CGPA
export const getClassOfDegree = (cgpa) => {
  if (cgpa >= 4.50) return 'First Class';
  if (cgpa >= 3.50) return 'Second Class Upper';
  if (cgpa >= 2.40) return 'Second Class Lower';
  if (cgpa >= 1.50) return 'Third Class';
  if (cgpa >= 1.00) return 'Pass';
  return 'Probation';
};

// Format date to display format
export const formatDate = (dateString, format = 'DD/MM/YYYY') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  return `${day}/${month}/${year}`;
};

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get grade color for badge
export const getGradeColor = (grade) => {
  const colors = {
    'A': 'bg-green-100 text-green-800',
    'B': 'bg-blue-100 text-blue-800',
    'C': 'bg-yellow-100 text-yellow-800',
    'D': 'bg-orange-100 text-orange-800',
    'E': 'bg-red-100 text-red-800',
    'F': 'bg-gray-100 text-gray-800',
  };
  return colors[grade] || 'bg-gray-100 text-gray-800';
};

// Get class degree color
export const getClassDegreeColor = (classDegree) => {
  const colors = {
    'First Class': 'text-green-600',
    'Second Class Upper': 'text-blue-600',
    'Second Class Lower': 'text-yellow-600',
    'Third Class': 'text-orange-600',
    'Pass': 'text-purple-600',
    'Probation': 'text-red-600',
  };
  return colors[classDegree] || 'text-gray-600';
};

// Validate email format
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate matric number format (Nigerian university format)
export const isValidMatricNo = (matricNo) => {
  const regex = /^[A-Za-z]\d{2}\/\d{2}\/\d{4,5}$/;
  return regex.test(matricNo);
};

// Generate random password
export const generateRandomPassword = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Download JSON as file
export const downloadJSON = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Download CSV as file
export const downloadCSV = (data, headers, filename) => {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Debounce function for search inputs
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Calculate age from date of birth
export const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Format currency (Naira)
export const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Get semester name
export const getSemesterName = (semesterCode) => {
  return semesterCode === 'first' ? 'First Semester' : 'Second Semester';
};

// Calculate total credit units from courses
export const calculateTotalCreditUnits = (courses) => {
  return courses.reduce((total, course) => total + (course.credit_unit || 0), 0);
};

// Check if two dates are in the same academic year
export const isSameAcademicYear = (date1, date2, startMonth = 9) => {
  const getAcademicYear = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (month >= startMonth) {
      return `${year}/${year + 1}`;
    }
    return `${year - 1}/${year}`;
  };
  return getAcademicYear(date1) === getAcademicYear(date2);
};