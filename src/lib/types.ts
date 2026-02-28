export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type SubscriptionPlan = 'free' | 'pro';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  specialization?: string;
  phone?: string;
  isActive?: boolean;
  subscriptionPlan?: SubscriptionPlan;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string[];
  createdBy: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  medicines: Medicine[];
  instructions: string;
  diagnosis: string;
  aiExplanation?: string;
  createdAt: string;
}

export interface DiagnosisLog {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  symptoms: string[];
  aiResponse?: string;
  possibleConditions?: string[];
  riskLevel: RiskLevel;
  suggestedTests?: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  monthlyAppointments: number;
  revenue: number;
  commonDiagnosis?: string;
}

export interface DoctorStats {
  dailyAppointments: number;
  monthlyAppointments: number;
  totalPrescriptions: number;
  totalPatientsSeen: number;
}
