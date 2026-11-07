# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# Digi-Manage: attendance, leave, payroll and employee information

The backend calculates everything. These screens only send input (validated first by `src/validators/*`) and show the results.

| Route | Who sees it (sidebar + `PermissionRoute`) | Screen |
|---|---|---|
| `/workforce/portal` | everyone | `PunchCard`: worked / remaining / extra against 8h, or 6h on Saturday. Plus missing punch-out corrections, the leave form (session selector, paid balance) and history with cancel |
| `/workforce/dashboard` | everyone | Stats + `AttendanceCalendar`: holidays, Sundays, leave with AM/PM badge, pending vs approved, status, extra; legend |
| `/workforce/my-salary` | everyone | `MySalaryPage`: own salary breakdown, PDF |
| `/workforce/logs` | Super Admin / Admin | `AdminAttendanceLogs`: attendance, leave and punch-out requests; approve / reject with a note; paid / unpaid override |
| `/workforce/team-leaves` | `attendance.team.read` | `TeamLeaveCalendar` |
| `/workforce/holidays` | `attendance.holiday.manage` | `HolidayManager`: add / edit / delete |
| `/workforce/payroll` | `payroll.salary.read` | `PayrollPage`: month picker, search, paging, Excel / PDF, finalize / re-open, rules dialog. Row -> `PayrollDetailDrawer` (day-by-day + salary profile) |
| `/workforce/employees/create`, `/workforce/employees/:employeeId/edit` | `auth.account.create` / `employee.profile.update` | `EmployeeInfoForm`: 5 steps with per-step validation and save. The draft is kept in localStorage without passwords or bank numbers. Includes `DocumentUploader` |
| `/account/profile` | everyone | Own details (contact, addresses, emergency contact editable), masked bank details, own documents |

Times are always shown in IST with `src/utils/IstTime.js`, whatever the browser's time zone. Date keys (`YYYY-MM-DD`) are never converted, so a date cannot shift by a day.

- **Constants:**
  - `AttendanceStatus.js`: statuses, colours, legend.
  - `LeaveConstants.js`
  - `PayrollConstants.js`: rule defaults for display, columns, the permission names.
  - `EmployeeConstants.js`
- **Shared state:** `store/slices/AttendanceSlice.js` (today + calendar) and `store/slices/PayrollSlice.js`.
- **API:** URLs are in `backend/ApiRoutes.js` (`ATTENDANCE`, `PAYROLL`, `EMPLOYEE_PROFILE`) and calls in `backend/ApiService.js` (`AttendanceService`, `AdminAttendanceService`, `PayrollService`, `EmployeeProfileService`). Components never call axios directly.
