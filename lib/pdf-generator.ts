import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
  _id: string;
  name: string;
  email: string;
  matric_no: string;
  level: number;
  attendance_status: "present" | "absent" | "rejected";
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
  status: "present" | "absent" | "rejected";
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
    student.attendance_status.toUpperCase(),
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
        if (status === "present") {
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
