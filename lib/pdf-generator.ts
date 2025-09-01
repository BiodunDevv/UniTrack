import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AttendanceReportData {
  course: {
    course_code: string;
    title: string;
    level: number;
  };
  generated_at: string;
  summary: {
    overall_attendance_rate: number;
    total_sessions: number;
    total_students: number;
    students_meeting_75_percent: number;
  };
  risk_analysis: {
    total_at_risk: number;
    critical_risk: number;
    high_risk: number;
    medium_risk: number;
  };
  students_below_75_percent: Array<{
    id: string;
    name: string;
    email: string;
    matric_no: string;
    level: number;
    attendance_rate: number;
    sessions_attended: number;
    sessions_missed: number;
    sessions_needed_for_75_percent: number;
    risk_level: "critical" | "high" | "medium" | "low";
  }>;
  insights: {
    best_attended_session: {
      session_code: string;
      attendance_rate: number;
    };
    worst_attended_session: {
      session_code: string;
      attendance_rate: number;
    };
    average_session_attendance: number;
    students_with_perfect_attendance: number;
  };
}

interface Student {
  _id: string;
  name: string;
  email: string;
  matric_no: string;
  level: number;
  attendance_status: "present" | "absent" | "rejected" | "manual_present";
  submitted_at: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  distance_from_session_m: number | null;
  device_info: {
    user_agent: string;
    ip_address: string;
  } | null;
  reason: string | null;
  has_submitted: boolean;
}

interface AttendanceRecord {
  _id: string;
  session_id: string;
  course_id: string;
  student_id: {
    _id: string;
    matric_no: string;
    name: string;
    email: string;
    level: number;
  };
  matric_no_submitted: string;
  device_fingerprint: string;
  lat: number;
  lng: number;
  accuracy: number;
  status: "present" | "absent" | "rejected" | "manual_present";
  reason: string;
  receipt_signature: string;
  submitted_at: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  session: {
    _id: string;
    course_id: {
      _id: string;
      course_code: string;
      title: string;
    };
    teacher_id: {
      _id: string;
      name: string;
      email: string;
    };
    session_code: string;
    start_ts: string;
    expiry_ts: string;
    lat: number;
    lng: number;
    radius_m: number;
    is_active: boolean;
    is_expired: boolean;
    created_at: string;
  };
  students: {
    all: Student[];
    present: Student[];
    absent: Student[];
  };
  attendance: AttendanceRecord[];
  statistics: {
    total_enrolled: number;
    total_submissions: number;
    present_count: number;
    absent_count: number;
    attendance_rate: number;
    submission_rate: number;
  };
}

// Student Attendance Report Types
interface StudentAttendanceRecord {
  _id: string;
  session_id: {
    _id: string;
    session_code: string;
    start_ts: string;
    expiry_ts: string;
  };
  course_id: string;
  student_id: {
    _id: string;
    matric_no: string;
    name: string;
  };
  status: "present" | "absent" | "rejected";
  submitted_at: string;
  lat: number;
  lng: number;
}

interface StudentData {
  _id: string;
  matric_no: string;
  name: string;
  email: string;
  level: number;
}

interface CourseData {
  _id: string;
  course_code: string;
  title: string;
  level: number;
}

interface StudentAttendanceStatistics {
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  attendanceRate: string;
}

interface StudentAttendanceData {
  student: StudentData;
  course: CourseData;
  attendanceRecords: StudentAttendanceRecord[];
  statistics: StudentAttendanceStatistics;
}

export const generateSessionPDF = (sessionData: SessionData) => {
  // Create new document with simple, clean settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Simple, academic color scheme
  const primaryBlue: [number, number, number] = [41, 98, 255]; // Professional blue
  const darkText: [number, number, number] = [33, 33, 33]; // Dark gray for text
  const lightGray: [number, number, number] = [128, 128, 128]; // Light gray for secondary text
  const successGreen: [number, number, number] = [34, 139, 34]; // Green for present
  const warningOrange: [number, number, number] = [255, 140, 0]; // Orange for absent
  const borderGray: [number, number, number] = [200, 200, 200]; // Light border

  // Simple date formatter
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Document setup
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;

  // Header Section
  doc.setFontSize(20);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("ATTENDANCE REPORT", margin, 25);

  // Session info line
  doc.setFontSize(12);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(
    `${sessionData.session.course_id.course_code} - Session ${sessionData.session.session_code}`,
    margin,
    35,
  );

  // Divider line
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageWidth - margin, 40);

  // Course Information Box
  let yPos = 50;
  doc.setFontSize(11);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);

  doc.text("Course:", margin, yPos);
  doc.text(`${sessionData.session.course_id.title}`, margin + 25, yPos);

  yPos += 8;
  doc.text("Instructor:", margin, yPos);
  doc.text(sessionData.session.teacher_id.name, margin + 25, yPos);

  yPos += 8;
  doc.text("Date & Time:", margin, yPos);
  doc.text(formatDate(sessionData.session.start_ts), margin + 25, yPos);

  // Statistics Summary Box
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("ATTENDANCE SUMMARY", margin, yPos);

  yPos += 10;
  // Simple statistics layout
  doc.setFontSize(10);

  // Statistics in a clean grid
  const stats = [
    {
      label: "Total Students:",
      value: sessionData.statistics.total_enrolled.toString(),
    },
    {
      label: "Present:",
      value: sessionData.statistics.present_count.toString(),
      color: successGreen,
    },
    {
      label: "Absent:",
      value: sessionData.statistics.absent_count.toString(),
      color: warningOrange,
    },
    {
      label: "Attendance Rate:",
      value: `${sessionData.statistics.attendance_rate.toFixed(1)}%`,
    },
  ];

  stats.forEach((stat, index) => {
    const xPos = margin + (index % 2) * 90;
    const yOffset = Math.floor(index / 2) * 8;

    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(stat.label, xPos, yPos + yOffset);

    if (stat.color) {
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    } else {
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    }
    doc.text(stat.value, xPos + 35, yPos + yOffset);
  });

  yPos += 25;

  // Student List Section
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("STUDENT ATTENDANCE LIST", margin, yPos);

  yPos += 10;

  // Simple table with clean design
  const tableData = sessionData.students.all.map((student, index) => [
    (index + 1).toString(),
    student.name,
    student.matric_no,
    student.attendance_status === "manual_present"
      ? "MANUAL PRESENT"
      : student.attendance_status.toUpperCase(),
    student.submitted_at ? formatDate(student.submitted_at) : "Not Submitted",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Student Name", "Matric Number", "Status", "Time Submitted"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: borderGray,
      lineWidth: 0.1,
      textColor: darkText,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: darkText,
      fontStyle: "bold",
      fontSize: 10,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { halign: "center", cellWidth: 35 },
      3: { halign: "center", cellWidth: 25 },
      4: { cellWidth: 45, fontSize: 8 },
    },
    didParseCell: (data) => {
      // Color code status column
      if (data.column.index === 3 && data.row.index >= 0) {
        const status = String(data.cell.raw).toLowerCase();
        if (status === "present" || status === "manual present") {
          data.cell.styles.textColor = successGreen;
          data.cell.styles.fontStyle = "bold";
        } else if (status === "absent") {
          data.cell.styles.textColor = warningOrange;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: margin, right: margin },
    showHead: "firstPage",
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Simple footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);

    // Left: Generation date
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US")}`,
      margin,
      footerY,
    );

    // Right: Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, {
      align: "right",
    });

    // Center: Course and session
    doc.text(
      `${sessionData.session.course_id.course_code} - Session ${sessionData.session.session_code}`,
      pageWidth / 2,
      footerY,
      { align: "center" },
    );
  }

  // Simple filename
  const courseCode = sessionData.session.course_id.course_code.replace(
    /[^a-zA-Z0-9]/g,
    "",
  );
  const sessionCode = sessionData.session.session_code;
  const date = new Date().toISOString().split("T")[0];
  const filename = `Attendance_${courseCode}_${sessionCode}_${date}.pdf`;

  doc.save(filename);
};

export const generateSessionSummaryPDF = (sessionData: SessionData) => {
  // Create new document with simple settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Simple color scheme
  const primaryBlue: [number, number, number] = [41, 98, 255];
  const darkText: [number, number, number] = [33, 33, 33];
  const lightGray: [number, number, number] = [128, 128, 128];
  const successGreen: [number, number, number] = [34, 139, 34];
  const warningOrange: [number, number, number] = [255, 140, 0];

  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Simple date formatter
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Header
  doc.setFontSize(18);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("ATTENDANCE SUMMARY", margin, 25);

  // Course and session info
  doc.setFontSize(12);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(
    `${sessionData.session.course_id.course_code} - ${sessionData.session.course_id.title}`,
    margin,
    35,
  );

  doc.setFontSize(10);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(`Session: ${sessionData.session.session_code}`, margin, 43);
  doc.text(`Date: ${formatDate(sessionData.session.start_ts)}`, margin, 51);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 58, pageWidth - margin, 58);

  // Key Statistics - Large display
  let yPos = 75;

  // Attendance rate as main metric
  doc.setFontSize(32);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(
    `${sessionData.statistics.attendance_rate.toFixed(0)}%`,
    margin,
    yPos,
  );

  doc.setFontSize(11);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text("Attendance Rate", margin, yPos + 12);

  // Statistics grid
  yPos += 25;
  const statsData = [
    {
      label: "Students Present",
      value: sessionData.statistics.present_count,
      total: sessionData.statistics.total_enrolled,
      color: successGreen,
    },
    {
      label: "Students Absent",
      value: sessionData.statistics.absent_count,
      total: sessionData.statistics.total_enrolled,
      color: warningOrange,
    },
    {
      label: "Total Enrolled",
      value: sessionData.statistics.total_enrolled,
      total: sessionData.statistics.total_enrolled,
      color: darkText,
    },
  ];

  statsData.forEach((stat, index) => {
    const cardWidth = (pageWidth - margin * 2 - 20) / 3;
    const xPos = margin + index * (cardWidth + 10);

    // Simple border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(xPos, yPos, cardWidth, 35);

    // Value
    doc.setFontSize(20);
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value.toString(), xPos + cardWidth / 2, yPos + 15, {
      align: "center",
    });

    // Label
    doc.setFontSize(9);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(stat.label, xPos + cardWidth / 2, yPos + 25, { align: "center" });

    // Percentage
    if (stat.total > 0) {
      const percentage = ((stat.value / stat.total) * 100).toFixed(0);
      doc.setFontSize(8);
      doc.text(`(${percentage}%)`, xPos + cardWidth / 2, yPos + 32, {
        align: "center",
      });
    }
  });

  // Course details
  yPos += 50;
  doc.setFontSize(11);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("Course Details:", margin, yPos);

  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(`Instructor: ${sessionData.session.teacher_id.name}`, margin, yPos);

  yPos += 6;
  doc.text(
    `Session Duration: ${formatDate(sessionData.session.start_ts)} - ${formatDate(sessionData.session.expiry_ts)}`,
    margin,
    yPos,
  );

  yPos += 6;
  doc.text(
    `Total Submissions: ${sessionData.statistics.total_submissions}`,
    margin,
    yPos,
  );

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US")}`,
    margin,
    footerY,
  );
  doc.text("UniTrack Attendance System", pageWidth - margin, footerY, {
    align: "right",
  });

  // Simple filename
  const courseCode = sessionData.session.course_id.course_code.replace(
    /[^a-zA-Z0-9]/g,
    "",
  );
  const sessionCode = sessionData.session.session_code;
  const date = new Date().toISOString().split("T")[0];
  const filename = `Summary_${courseCode}_${sessionCode}_${date}.pdf`;

  doc.save(filename);
};

export const generateStudentAttendanceReportPDF = (
  studentData: StudentAttendanceData,
) => {
  // Create new document with simple, clean settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Simple, academic color scheme
  const primaryBlue: [number, number, number] = [41, 98, 255]; // Professional blue
  const darkText: [number, number, number] = [33, 33, 33]; // Dark gray for text
  const lightGray: [number, number, number] = [128, 128, 128]; // Light gray for secondary text
  const successGreen: [number, number, number] = [34, 139, 34]; // Green for present
  const warningOrange: [number, number, number] = [255, 140, 0]; // Orange for absent
  const errorRed: [number, number, number] = [220, 53, 69]; // Red for rejected
  const borderGray: [number, number, number] = [200, 200, 200]; // Light border

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLevel = (level: number) => {
    const levelMap: { [key: number]: string } = {
      100: "1st Year",
      200: "2nd Year",
      300: "3rd Year",
      400: "4th Year",
      500: "5th Year",
      600: "6th Year",
    };
    return levelMap[level] || `Level ${level}`;
  };

  // Document setup
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;

  // Header Section
  doc.setFontSize(20);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("STUDENT ATTENDANCE REPORT", margin, 25);

  // Student info line
  doc.setFontSize(12);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(
    `${studentData.student.name} (${studentData.student.matric_no})`,
    margin,
    35,
  );

  // Divider line
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageWidth - margin, 40);

  // Student Information Section
  let yPos = 50;
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("STUDENT INFORMATION", margin, yPos);

  yPos += 10;
  doc.setFontSize(11);

  doc.text("Name:", margin, yPos);
  doc.text(studentData.student.name, margin + 30, yPos);

  yPos += 8;
  doc.text("Matric Number:", margin, yPos);
  doc.text(studentData.student.matric_no, margin + 30, yPos);

  yPos += 8;
  doc.text("Email:", margin, yPos);
  doc.text(studentData.student.email, margin + 30, yPos);

  yPos += 8;
  doc.text("Level:", margin, yPos);
  doc.text(formatLevel(studentData.student.level), margin + 30, yPos);

  // Course Information Section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("COURSE INFORMATION", margin, yPos);

  yPos += 10;
  doc.setFontSize(11);

  doc.text("Course:", margin, yPos);
  doc.text(studentData.course.title, margin + 30, yPos);

  yPos += 8;
  doc.text("Course Code:", margin, yPos);
  doc.text(studentData.course.course_code, margin + 30, yPos);

  yPos += 8;
  doc.text("Course Level:", margin, yPos);
  doc.text(formatLevel(studentData.course.level), margin + 30, yPos);

  // Attendance Statistics Section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("ATTENDANCE SUMMARY", margin, yPos);

  yPos += 15;

  // Main attendance rate display
  doc.setFontSize(28);
  const attendanceRate = parseFloat(studentData.statistics.attendanceRate);
  if (attendanceRate >= 75) {
    doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  } else {
    doc.setTextColor(errorRed[0], errorRed[1], errorRed[2]);
  }
  doc.text(`${studentData.statistics.attendanceRate}`, margin, yPos);

  doc.setFontSize(11);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text("Attendance Rate", margin, yPos + 10);

  // Statistics cards
  yPos += 25;
  const statsData = [
    {
      label: "Total Sessions",
      value: studentData.statistics.totalSessions,
      color: darkText,
    },
    {
      label: "Sessions Attended",
      value: studentData.statistics.attendedSessions,
      color: successGreen,
    },
    {
      label: "Sessions Missed",
      value: studentData.statistics.missedSessions,
      color: errorRed,
    },
  ];

  statsData.forEach((stat, index) => {
    const cardWidth = (pageWidth - margin * 2 - 20) / 3;
    const xPos = margin + index * (cardWidth + 10);

    // Simple border
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.rect(xPos, yPos, cardWidth, 25);

    // Value
    doc.setFontSize(16);
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value.toString(), xPos + cardWidth / 2, yPos + 12, {
      align: "center",
    });

    // Label
    doc.setFontSize(9);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(stat.label, xPos + cardWidth / 2, yPos + 20, { align: "center" });
  });

  yPos += 35;

  // Performance Assessment
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("PERFORMANCE ASSESSMENT", margin, yPos);

  yPos += 10;
  doc.setFontSize(10);

  let performanceText = "";
  let performanceColor = darkText;

  if (attendanceRate >= 90) {
    performanceText = "Excellent attendance record. Keep up the great work!";
    performanceColor = successGreen;
  } else if (attendanceRate >= 75) {
    performanceText = "Good attendance record. Meeting minimum requirements.";
    performanceColor = successGreen;
  } else if (attendanceRate >= 50) {
    performanceText =
      "Poor attendance record. Improvement needed to meet requirements.";
    performanceColor = warningOrange;
  } else {
    performanceText =
      "Critical attendance record. Immediate improvement required.";
    performanceColor = errorRed;
  }

  doc.setTextColor(
    performanceColor[0],
    performanceColor[1],
    performanceColor[2],
  );
  doc.text(performanceText, margin, yPos);

  yPos += 8;
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(`Minimum attendance requirement: 75%`, margin, yPos);

  yPos += 15;

  // Attendance Records Table
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("DETAILED ATTENDANCE RECORDS", margin, yPos);

  yPos += 10;

  // Prepare table data
  const tableData = studentData.attendanceRecords.map((record, index) => [
    (index + 1).toString(),
    record.session_id.session_code,
    formatDate(record.session_id.start_ts),
    record.status.charAt(0).toUpperCase() + record.status.slice(1),
    record.submitted_at ? formatDate(record.submitted_at) : "Not Submitted",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Session Code", "Session Date", "Status", "Submitted At"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: borderGray,
      lineWidth: 0.1,
      textColor: darkText,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: darkText,
      fontStyle: "bold",
      fontSize: 10,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { halign: "center", cellWidth: 30 },
      2: { cellWidth: 45 },
      3: { halign: "center", cellWidth: 25 },
      4: { cellWidth: 45, fontSize: 8 },
    },
    didParseCell: (data) => {
      // Color code status column
      if (data.column.index === 3 && data.row.index >= 0) {
        const status = String(data.cell.raw).toLowerCase();
        if (status === "present") {
          data.cell.styles.textColor = successGreen;
          data.cell.styles.fontStyle = "bold";
        } else if (status === "absent") {
          data.cell.styles.textColor = warningOrange;
          data.cell.styles.fontStyle = "bold";
        } else if (status === "rejected") {
          data.cell.styles.textColor = errorRed;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: margin, right: margin },
    showHead: "firstPage",
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Simple footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);

    // Left: Generation date
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US")}`,
      margin,
      footerY,
    );

    // Right: Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, {
      align: "right",
    });

    // Center: Student and course info
    doc.text(
      `${studentData.student.matric_no} - ${studentData.course.course_code}`,
      pageWidth / 2,
      footerY,
      { align: "center" },
    );
  }

  // Generate filename
  const studentMatric = studentData.student.matric_no.replace(
    /[^a-zA-Z0-9]/g,
    "_",
  );
  const courseCode = studentData.course.course_code.replace(
    /[^a-zA-Z0-9]/g,
    "_",
  );
  const date = new Date().toISOString().split("T")[0];
  const filename = `Student_Report_${studentMatric}_${courseCode}_${date}.pdf`;

  doc.save(filename);
};

export const generateCourseAttendanceReportPDF = (
  reportData: AttendanceReportData,
) => {
  // Create new document with simple settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Simple color scheme
  const primaryBlue: [number, number, number] = [41, 98, 255];
  const darkText: [number, number, number] = [33, 33, 33];
  const lightGray: [number, number, number] = [128, 128, 128];
  const successGreen: [number, number, number] = [34, 139, 34];
  const warningOrange: [number, number, number] = [255, 140, 0];
  const errorRed: [number, number, number] = [220, 53, 69];
  const borderGray: [number, number, number] = [200, 200, 200];

  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Simple date formatter
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLevel = (level: number) => {
    const levelMap: { [key: number]: string } = {
      100: "1st Year",
      200: "2nd Year",
      300: "3rd Year",
      400: "4th Year",
      500: "5th Year",
      600: "6th Year",
    };
    return levelMap[level] || `Level ${level}`;
  };

  // Header
  doc.setFontSize(20);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("COURSE ATTENDANCE REPORT", margin, 25);

  // Course and info
  doc.setFontSize(12);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(
    `${reportData.course.course_code} - ${reportData.course.title}`,
    margin,
    35,
  );

  doc.setFontSize(10);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(`Level: ${formatLevel(reportData.course.level)}`, margin, 43);
  doc.text(`Generated: ${formatDate(reportData.generated_at)}`, margin, 51);

  // Divider
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, 58, pageWidth - margin, 58);

  // Key Statistics - Large display
  let yPos = 75;

  // Overall attendance rate as main metric
  doc.setFontSize(32);
  if (reportData.summary.overall_attendance_rate >= 75) {
    doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  } else {
    doc.setTextColor(errorRed[0], errorRed[1], errorRed[2]);
  }
  doc.text(
    `${reportData.summary.overall_attendance_rate.toFixed(0)}%`,
    margin,
    yPos,
  );

  doc.setFontSize(11);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text("Overall Attendance Rate", margin, yPos + 12);

  // Statistics grid
  yPos += 25;
  const statsData = [
    {
      label: "Total Sessions",
      value: reportData.summary.total_sessions,
      color: darkText,
    },
    {
      label: "Total Students",
      value: reportData.summary.total_students,
      color: primaryBlue,
    },
    {
      label: "Meeting 75%",
      value: reportData.summary.students_meeting_75_percent,
      color: successGreen,
    },
    {
      label: "At Risk",
      value: reportData.risk_analysis.total_at_risk,
      color: errorRed,
    },
  ];

  // Draw stats in a 2x2 grid
  statsData.forEach((stat, index) => {
    const cardWidth = (pageWidth - margin * 2 - 10) / 2;
    const cardHeight = 30;
    const xPos = margin + (index % 2) * (cardWidth + 10);
    const yOffset = Math.floor(index / 2) * (cardHeight + 10);

    // Simple border
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.rect(xPos, yPos + yOffset, cardWidth, cardHeight);

    // Value
    doc.setFontSize(18);
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value.toString(), xPos + cardWidth / 2, yPos + yOffset + 15, {
      align: "center",
    });

    // Label
    doc.setFontSize(9);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(stat.label, xPos + cardWidth / 2, yPos + yOffset + 25, {
      align: "center",
    });
  });

  yPos += 80;

  // Risk Analysis Section
  doc.setFontSize(14);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("RISK ANALYSIS", margin, yPos);

  yPos += 15;
  doc.setFontSize(10);

  // Risk breakdown
  const riskData = [
    {
      label: "Critical Risk (Below 50%)",
      value: reportData.risk_analysis.critical_risk,
      color: errorRed,
    },
    {
      label: "High Risk (50-65%)",
      value: reportData.risk_analysis.high_risk,
      color: warningOrange,
    },
    {
      label: "Medium Risk (65-74%)",
      value: reportData.risk_analysis.medium_risk,
      color: [255, 193, 7],
    },
  ];

  riskData.forEach((risk, index) => {
    doc.setTextColor(risk.color[0], risk.color[1], risk.color[2]);
    doc.text(`${risk.label}: ${risk.value} students`, margin, yPos + index * 8);
  });

  yPos += 40;

  // Students Below 75% Table (only if there are any)
  if (reportData.students_below_75_percent.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text("STUDENTS NOT MEETING 75% REQUIREMENT", margin, yPos);

    yPos += 10;

    // Prepare table data for at-risk students
    const atRiskTableData = reportData.students_below_75_percent
      .slice(0, 15) // Limit to first 15 to fit on page
      .map((studentData, index: number) => [
        (index + 1).toString(),
        studentData.name,
        studentData.matric_no,
        `${studentData.attendance_rate.toFixed(1)}%`,
        `${studentData.sessions_attended}/${studentData.sessions_attended + studentData.sessions_missed}`,
        studentData.risk_level.toUpperCase(),
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [
        [
          "#",
          "Student Name",
          "Matric No",
          "Attendance",
          "Sessions",
          "Risk Level",
        ],
      ],
      body: atRiskTableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: borderGray,
        lineWidth: 0.1,
        textColor: darkText,
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: darkText,
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { halign: "center", cellWidth: 30 },
        3: { halign: "center", cellWidth: 25 },
        4: { halign: "center", cellWidth: 25 },
        5: { halign: "center", cellWidth: 25 },
      },
      didParseCell: (data) => {
        // Color code risk level column
        if (data.column.index === 5 && data.row.index >= 0) {
          const riskLevel = String(data.cell.raw).toLowerCase();
          if (riskLevel === "critical") {
            data.cell.styles.textColor = errorRed;
            data.cell.styles.fontStyle = "bold";
          } else if (riskLevel === "high") {
            data.cell.styles.textColor = warningOrange;
            data.cell.styles.fontStyle = "bold";
          } else if (riskLevel === "medium") {
            data.cell.styles.textColor = [255, 193, 7];
            data.cell.styles.fontStyle = "bold";
          }
        }
        // Color code attendance column
        if (data.column.index === 3 && data.row.index >= 0) {
          const attendanceStr = String(data.cell.raw);
          const attendance = parseFloat(attendanceStr.replace("%", ""));
          if (attendance < 50) {
            data.cell.styles.textColor = errorRed;
          } else if (attendance < 65) {
            data.cell.styles.textColor = warningOrange;
          } else {
            data.cell.styles.textColor = [255, 193, 7];
          }
          data.cell.styles.fontStyle = "bold";
        }
      },
      margin: { left: margin, right: margin },
      showHead: "firstPage",
    });

    // Note if there are more students
    if (reportData.students_below_75_percent.length > 15) {
      const docWithAutoTable = doc as jsPDF & {
        lastAutoTable?: { finalY: number };
      };
      const finalY = docWithAutoTable.lastAutoTable?.finalY || 0;
      doc.setFontSize(8);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(
        `Note: Showing first 15 of ${reportData.students_below_75_percent.length} students below 75% requirement.`,
        margin,
        finalY,
      );
    }
  }

  // Add new page for insights if needed
  const docWithAutoTable = doc as jsPDF & {
    lastAutoTable?: { finalY: number };
  };
  if (
    doc.internal.pageSize.height -
      (docWithAutoTable.lastAutoTable?.finalY || 0) <
    80
  ) {
    doc.addPage();
    yPos = 25;
  } else {
    yPos = (docWithAutoTable.lastAutoTable?.finalY || 0) + 20 || yPos + 20;
  }

  // Insights Section
  doc.setFontSize(14);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("KEY INSIGHTS", margin, yPos);

  yPos += 15;
  doc.setFontSize(10);

  // Best and worst sessions
  doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.text(
    `Best Session: ${reportData.insights.best_attended_session.session_code} (${reportData.insights.best_attended_session.attendance_rate.toFixed(1)}%)`,
    margin,
    yPos,
  );

  yPos += 8;
  doc.setTextColor(errorRed[0], errorRed[1], errorRed[2]);
  doc.text(
    `Worst Session: ${reportData.insights.worst_attended_session.session_code} (${reportData.insights.worst_attended_session.attendance_rate.toFixed(1)}%)`,
    margin,
    yPos,
  );

  yPos += 12;
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(
    `Average Session Attendance: ${reportData.insights.average_session_attendance.toFixed(1)}%`,
    margin,
    yPos,
  );

  yPos += 8;
  doc.text(
    `Students with Perfect Attendance: ${reportData.insights.students_with_perfect_attendance}`,
    margin,
    yPos,
  );

  // Recommendations
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("RECOMMENDATIONS", margin, yPos);

  yPos += 10;
  doc.setFontSize(9);

  if (reportData.summary.overall_attendance_rate < 50) {
    doc.setTextColor(errorRed[0], errorRed[1], errorRed[2]);
    doc.text(
      "• CRITICAL: Implement immediate intervention strategies",
      margin,
      yPos,
    );
    yPos += 6;
    doc.text("• Consider flexible attendance policies", margin, yPos);
    yPos += 6;
    doc.text("• Provide additional student support services", margin, yPos);
  } else if (reportData.risk_analysis.total_at_risk > 0) {
    doc.setTextColor(warningOrange[0], warningOrange[1], warningOrange[2]);
    doc.text(
      `• Focus on ${reportData.risk_analysis.total_at_risk} at-risk students`,
      margin,
      yPos,
    );
    yPos += 6;
    doc.text("• Implement early warning systems", margin, yPos);
    yPos += 6;
    doc.text("• Provide academic counseling", margin, yPos);
  } else {
    doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
    doc.text("• Excellent attendance performance", margin, yPos);
    yPos += 6;
    doc.text("• Continue current engagement strategies", margin, yPos);
    yPos += 6;
    doc.text("• Share best practices with other courses", margin, yPos);
  }

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Simple footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);

    // Left: Generation date
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US")}`,
      margin,
      footerY,
    );

    // Right: Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, {
      align: "right",
    });

    // Center: Course info
    doc.text(
      `${reportData.course.course_code} - Attendance Report`,
      pageWidth / 2,
      footerY,
      { align: "center" },
    );
  }

  // Generate filename
  const courseCode = reportData.course.course_code.replace(
    /[^a-zA-Z0-9]/g,
    "_",
  );
  const date = new Date().toISOString().split("T")[0];
  const filename = `Course_Attendance_Report_${courseCode}_${date}.pdf`;

  doc.save(filename);
};
