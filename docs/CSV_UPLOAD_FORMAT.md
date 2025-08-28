# Student CSV Upload Format

This document describes the CSV format required for bulk student uploads in UniTrack.

## Required CSV Format

Your CSV file must contain the following columns (case-insensitive):

| Column      | Description                  | Example            |
| ----------- | ---------------------------- | ------------------ |
| `matric_no` | Student matriculation number | CSC/2024/001       |
| `name`      | Full name of the student     | John Doe           |
| `email`     | Student's email address      | john.doe@email.com |
| `level`     | Academic level               | 200                |

## Sample CSV Content

```csv
matric_no,name,email,level
CSC/2024/001,John Doe,john.doe@email.com,200
CSC/2024/002,Jane Smith,jane.smith@email.com,200
CSC/2024/003,Bob Johnson,bob.johnson@email.com,200
```

## Important Notes

1. **Headers**: The first row must contain the column headers
2. **Required Fields**: All fields are required for each student
3. **Course Information**: The course code is automatically assigned from the current course
4. **Email Format**: Must be a valid email address format
5. **Level**: Must be a valid academic level (100, 200, 300, 400, 500, 600)
6. **File Format**: Must be saved as `.csv` file

## API Request Format

When uploaded, the data is converted to this format:

```json
{
  "students": [
    {
      "course_code": "CS 102",
      "matric_no": "CSC/2024/001",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "level": 200
    }
  ]
}
```

## Single Student Addition

For adding individual students, the API accepts:

```json
{
  "matric_no": "CSC/2024/001",
  "name": "Test Student",
  "email": "test.student@email.com",
  "level": 200
}
```

## Features Implemented

- ✅ CSV file validation
- ✅ Preview before upload
- ✅ Sample CSV download
- ✅ Error handling for invalid formats
- ✅ Bulk upload to API endpoint `/courses/{courseId}/students/bulk`
- ✅ Single student addition via `/courses/{courseId}/students`
- ✅ Real-time feedback and notifications
- ✅ Dedicated students management page at `/students/{courseId}`
- ✅ Course update functionality
- ✅ Detailed upload result reporting
