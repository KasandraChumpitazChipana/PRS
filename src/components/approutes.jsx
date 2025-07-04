import React from "react";
import { Route } from "react-router-dom";

// Settings
import SettingsThem from "./settings/SettingsThem";
import Setting from "./settings/Setting";

// Doctor
import DoctorList from "./doctor/DoctorList";
import AddDoctor from "./doctor/AddDoctor";
import EditDoctor from "./doctor/EditDoctor";
import DoctorProfile from "./doctor/DoctorProfile";
import Doctor_Settings from "./Dashboard/Doctor_Dashboard/Doctor_Settings";

// Patients
import PatientsList from "./patients/PatientsList";
import AddPatients from "./patients/AddPatients";

// Appointments
import AppoinmentList from "./appoinments/AppoinmentList";
import AddAppoinments from "./appoinments/AddAppoinments";
import EditAppoinments from "./appoinments/EditAppoinments";

// Doctor Schedule
import ScheduleList from "./doctorschedule/ScheduleList";
import AddSchedule from "./doctorschedule/AddSchedule";
import EditSchedule from "./doctorschedule/EditSchedule";

// Students
import StudentList from "../pages/students/StudentList";
import AddStudent from "../pages/students/AddStudent";
import EditStudent from "../pages/students/EditStudent";
import StudentProfile from "../pages/students/StudentProfile";

// Enrollments
import EnrollmentList from "../pages/enrollments/EnrollmentList";
import AddEnrollment from "../pages/enrollments/AddEnrollment";
import EditEnrollment from "../pages/enrollments/EditEnrollment";

// Departments
import DepartmentList from "./department/DepartmentList";
import AddDepartment from "./department/AddDepartment";
import EditDepartment from "./department/EditDepartment";

// Staff
import StaffList from "./staff/StafList";
import AddStaff from "./staff/Add-Staff";
import EditStaff from "./staff/EditStaff";
import StaffProfile from "./staff/StaffProfile";
import AddLeave from "./staff/AddLeave";
import EditLeave from "./staff/EditLeave";
import Attendence from "./staff/Attendence";
import Leave from "./staff/Leave";
import Holiday from "./staff/Holiday";
import Staff_Settings from "./staff/Staff-Settings";

// Accounts
import ProvidentFund from "./accounts/ProvidentFund";
import Add_ProviderFund from "./accounts/Add_ProviderFund";
import Edit_Provident from "./accounts/Edit_Provident";
import Invoice from "./accounts/Invoice";
import Create_Invoice from "./accounts/Create_Invoice";
import Payments from "./accounts/Payments";
import Add_Payment from "./accounts/Add_Payment";
import Edit_Payment from "./accounts/Edit_Payment";
import Expenses from "./accounts/Expenses";
import Add_Expense from "./accounts/Add_Expense";
import Taxes from "./accounts/Taxes";
import Add_Tax from "./accounts/Add_Tax";
import Edit_Taxes from "./accounts/Edit_Taxes";

// Payroll
import EmployeeSalary from "./Payroll/EmployeeSalary/EmployeeSalary";
import AddEmployeeSalary from "./Payroll/EmployeeSalary/AddEmployeeSalary";
import EditEmployeeSalery from "./Payroll/EmployeeSalary/EditEmployeeSalery";
import Payslip from "./Payroll/Payslip";

// Email
import Inbox from "./email/Inbox";
import ComposeMail from "./email/ComposeMail";
import MailView from "./email/MailView";

// Activity
import UserActivity from "./activity/UserActivity";

// Expense Reports
import ExpensesReport from "./ExpenseReport/Expenses/ExpensesReport";
import AddExpenses from "./ExpenseReport/Expenses/AddExpenses";
import Edit_Expenses from "./ExpenseReport/Expenses/Edit_Expenses";
import Invoice_Report from "./ExpenseReport/Invoice-report/Invoice_Report";

// Invoice Management
import InvoiceList from "./Invoice/Invoice-List/InvoiceList";
import OverDue from "./Invoice/Invoice-List/Overdue-Invoice/OverDue";
import Paid_Invoice from "./Invoice/Invoice-List/Paid-Invoice/Paid_Invoice";
import Draft_Invoice from "./Invoice/Invoice-List/Draft_Invoice/Draft_Invoice";
import Recurring_Invoice from "./Invoice/Invoice-List/Recurring_Invoice/Recurring_Invoice";
import Cancelled_Invoice from "./Invoice/Invoice-List/Cancelled_Invoice/Cancelled_Invoice";
import Invoice_Grid from "./Invoice/Invoices_Grid/Invoice_Grid";
import Add_Invoices from "./Invoice/Add_Invoices/Add_Invoices";
import Edit_Invoices from "./Invoice/Edit_Invoices/Edit_Invoices";
import Invoice_Details from "./Invoice/Invoice_Details/Invoice_Details";
import Invoice_GeneralSettings from "./Invoice/Invoice_Settings/General_Settings/Invoice_GeneralSettings";
import Tax_Settings from "./Invoice/Invoice_Settings/Tax_Settings/Tax_Settings";
import Bank_Settings from "./Invoice/Invoice_Settings/Bank_Settings/Bank_Settings";

// Forms
import BasicInput from "./Forms/BasicInput";
import InputGroups from "./Forms/InputGroups";
import HorizontalForm from "./Forms/HorizontalForm";
import VerticalForm from "./Forms/VerticalForm";

// Tables
import BasicTable from "./Tables/BasicTable";
import DataTable from "./Tables/DataTable";

// UI Elements
import UiKit from "./Ui_Elements/UiKit";
import Typography from "./Ui_Elements/Typography";

// Dashboards
import Doctor_Dashboard from "./Dashboard/Doctor_Dashboard/Doctor_Dashboard";
import Admin_Dashboard from "./Dashboard/Admin_Dashboard/Admin_Dashboard";
import Patient_Dashboard from "./Dashboard/Patient_Dashboard/Patient_Dashboard";

// Pages
import ServerError from "./pages/login/ServerError";
import BlankPage from "./pages/login/BlankPage";
import Profile from "./Profile";

// Array de rutas para mantener compatibilidad con el código existente
const AppRoutes = [
  // Error Pages
  <Route key="server-error" path="/server-error" element={<ServerError />} />,
  <Route key="blankpage" path="/blankpage" element={<BlankPage />} />,
  
  // Profile & Settings
  <Route key="profile" path="/profile" element={<Profile />} />,
  <Route key="settings" path="/settings" element={<Setting />} />,
  <Route key="settingsthem" path="/settingsthem" element={<SettingsThem />} />,
  
  // Dashboards
  <Route key="admin-dashboard" path="/admin-dashboard" element={<Admin_Dashboard />} />,
  <Route key="doctor-dashboard" path="/doctor-dashboard" element={<Doctor_Dashboard />} />,
  <Route key="patient-dashboard" path="/patient-dashboard" element={<Patient_Dashboard />} />,
  
  // Doctor Management
  <Route key="doctorlist" path="/doctorlist" element={<DoctorList />} />,
  <Route key="add-doctor" path="/add-doctor" element={<AddDoctor />} />,
  <Route key="editdoctor" path="/editdoctor/:id" element={<EditDoctor />} />,
  <Route key="doctorprofile" path="/doctorprofile/:id" element={<DoctorProfile />} />,
  <Route key="doctor-setting" path="/doctor-setting" element={<Doctor_Settings />} />,
  
  // Patient Management
  <Route key="patientslist" path="/patientslist" element={<PatientsList />} />,
  <Route key="addpatients" path="/addpatients" element={<AddPatients />} />,
  <Route key="editpatients" path="/editpatients/:id" element={<AddPatients />} />,
  
  // Appointments
  <Route key="appoinmentlist" path="/appoinmentlist" element={<AppoinmentList />} />,
  <Route key="addappoinments" path="/addappoinments" element={<AddAppoinments />} />,
  <Route key="editappoinments" path="/editappoinments/:id" element={<EditAppoinments />} />,
  
  // Doctor Schedule
  <Route key="schedulelist" path="/schedulelist" element={<ScheduleList />} />,
  <Route key="addschedule" path="/addschedule" element={<AddSchedule />} />,
  <Route key="editschedule" path="/editschedule/:id" element={<EditSchedule />} />,
  
  // Students
  <Route key="studentlist" path="/studentlist" element={<StudentList />} />,
  <Route key="add-student" path="/add-student" element={<AddStudent />} />,
  <Route key="editstudent" path="/editstudent/:id" element={<EditStudent />} />,
  <Route key="studentprofile" path="/studentprofile/:id" element={<StudentProfile />} />,
  
  // Enrollments
  <Route key="enrollmentlist" path="/enrollmentlist" element={<EnrollmentList />} />,
  <Route key="add-enrollment" path="/add-enrollment" element={<AddEnrollment />} />,
  <Route key="editenrollment" path="/editenrollment/:id" element={<EditEnrollment />} />,
  
  // Departments
  <Route key="departmentlist" path="/departmentlist" element={<DepartmentList />} />,
  <Route key="add-department" path="/add-department" element={<AddDepartment />} />,
  <Route key="editdepartment" path="/editdepartment/:id" element={<EditDepartment />} />,
  
  // Staff Management
  <Route key="stafflist" path="/stafflist" element={<StaffList />} />,
  <Route key="addstaff" path="/addstaff" element={<AddStaff />} />,
  <Route key="editstaff" path="/editstaff/:id" element={<EditStaff />} />,
  <Route key="staffprofile" path="/staffprofile/:id" element={<StaffProfile />} />,
  <Route key="staff-settings" path="/staff-settings" element={<Staff_Settings />} />,
  
  // Staff Leave & Attendance
  <Route key="leave" path="/leave" element={<Leave />} />,
  <Route key="add-leave" path="/add-leave" element={<AddLeave />} />,
  <Route key="editleave" path="/editleave/:id" element={<EditLeave />} />,
  <Route key="attendence" path="/attendence" element={<Attendence />} />,
  <Route key="holiday" path="/holiday" element={<Holiday />} />,
  
  // Accounts
  <Route key="providentfund" path="/providentfund" element={<ProvidentFund />} />,
  <Route key="add-providerfund" path="/add-providerfund" element={<Add_ProviderFund />} />,
  <Route key="edit-provident" path="/edit-provident/:id" element={<Edit_Provident />} />,
  <Route key="invoicelist" path="/invoicelist" element={<Invoice />} />,
  <Route key="createinvoice" path="/createinvoice" element={<Create_Invoice />} />,
  <Route key="payments" path="/payments" element={<Payments />} />,
  <Route key="addpayment" path="/addpayment" element={<Add_Payment />} />,
  <Route key="edit-payment" path="/edit-payment/:id" element={<Edit_Payment />} />,
  <Route key="expenses" path="/expenses" element={<Expenses />} />,
  <Route key="addexpense" path="/addexpense" element={<Add_Expense />} />,
  <Route key="taxes" path="/taxes" element={<Taxes />} />,
  <Route key="addtax" path="/addtax" element={<Add_Tax />} />,
  <Route key="edit-taxes" path="/edit-taxes/:id" element={<Edit_Taxes />} />,
  
  // Payroll
  <Route key="employeesalary" path="/employeesalary" element={<EmployeeSalary />} />,
  <Route key="addsalary" path="/addsalary" element={<AddEmployeeSalary />} />,
  <Route key="editsalary" path="/editsalary/:id" element={<EditEmployeeSalery />} />,
  <Route key="payslip" path="/payslip" element={<Payslip />} />,
  
  // Email
  <Route key="inbox" path="/inbox" element={<Inbox />} />,
  <Route key="compose-mail" path="/compose-mail" element={<ComposeMail />} />,
  <Route key="mail-view" path="/mail-view/:id" element={<MailView />} />,
  
  // Activity
  <Route key="user-activity" path="/user-activity" element={<UserActivity />} />,
  
  // Expense Reports
  <Route key="expense-Report" path="/expense-Report" element={<ExpensesReport />} />,
  <Route key="add-expense" path="/add-expense" element={<AddExpenses />} />,
  <Route key="edit-expenses" path="/edit-expenses/:id" element={<Edit_Expenses />} />,
  <Route key="invoice-report" path="/invoice-report" element={<Invoice_Report />} />,
  
  // Invoice Management
  <Route key="invoice-list" path="/invoice-list" element={<InvoiceList />} />,
  <Route key="paid-invoice" path="/paid-invoice" element={<Paid_Invoice />} />,
  <Route key="overdue-invoice" path="/overdue-invoice" element={<OverDue />} />,
  <Route key="draft-invoice" path="/draft-invoice" element={<Draft_Invoice />} />,
  <Route key="recurring-invoice" path="/recurring-invoice" element={<Recurring_Invoice />} />,
  <Route key="cancelled-invoice" path="/cancelled-invoice" element={<Cancelled_Invoice />} />,
  <Route key="invoice-grid" path="/invoice-grid" element={<Invoice_Grid />} />,
  <Route key="add-invoice" path="/add-invoice" element={<Add_Invoices />} />,
  <Route key="edit-invoice" path="/edit-invoice/:id" element={<Edit_Invoices />} />,
  <Route key="invoice-details" path="/invoice-details/:id" element={<Invoice_Details />} />,
  <Route key="invoice-settings" path="/invoice-settings" element={<Invoice_GeneralSettings />} />,
  <Route key="tax-settings" path="/tax-settings" element={<Tax_Settings />} />,
  <Route key="bank-settings" path="/bank-settings" element={<Bank_Settings />} />,
  
  // Forms
  <Route key="basic-input" path="/basic-input" element={<BasicInput />} />,
  <Route key="inputgroup" path="/inputgroup" element={<InputGroups />} />,
  <Route key="horizontal-form" path="/horizontal-form" element={<HorizontalForm />} />,
  <Route key="vertical-form" path="/vertical-form" element={<VerticalForm />} />,
  
  // Tables
  <Route key="basic-table" path="/basic-table" element={<BasicTable />} />,
  <Route key="data-table" path="/data-table" element={<DataTable />} />,
  
  // UI Elements
  <Route key="ui-kit" path="/ui-kit" element={<UiKit />} />,
  <Route key="typography" path="/typography" element={<Typography />} />
];

export default AppRoutes;