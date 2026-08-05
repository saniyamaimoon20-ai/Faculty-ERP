export type UserRole = 'HOD' | 'Faculty';
export type AccountStatus = 'Active' | 'Inactive';

export interface UserProfile {
  id: number;
  user_id: number;
  employee_id: string;
  full_name: string;
  gender: string;
  department_name: string;
  designation: string;
  email: string;
  phone_number?: string;
  qualification?: string;
  date_of_joining?: string;
  biometric_device_id?: string;
  profile_photo?: string;
  weekly_workload: number;
  attendance_status?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  is_password_set: boolean;
  created_at?: string;
  profile?: UserProfile;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface Subject {
  id: number;
  department_id: number;
  subject_code: string;
  subject_name: string;
  short_name: string;
  semester: number;
  credits: number;
}

export interface Room {
  id: number;
  room_number: string;
  building: string;
  floor: string;
  capacity: number;
  room_type: string;
}

export interface TimetableEntry {
  id: number;
  faculty_id: number;
  faculty_name: string;
  employee_id: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  short_name: string;
  room_id: number;
  room_number: string;
  building: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period_number: number;
  start_time: string;
  end_time: string;
  semester: number;
  section: string;
  academic_year: string;
}

export interface NotificationItem {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  is_read: boolean;
  created_at: string;
}

export interface LoginLogItem {
  id: number;
  user_id?: number;
  username: string;
  login_time: string;
  logout_time: string;
  session_duration: string;
  ip_address: string;
  browser: string;
  device: string;
}

export interface ActivityLogItem {
  id: number;
  user_id?: number;
  username: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface BiometricLogItem {
  id: number;
  faculty_id: number;
  faculty_name: string;
  device_id: string;
  punch_time: string;
  punch_type: 'IN' | 'OUT';
  status: string;
}
