import { User, Patient, Appointment, Prescription, DiagnosisLog } from './types';

// ── Users ──
export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Dr. Sarah Khan', email: 'admin@clinic.com', role: 'admin', isActive: true, subscriptionPlan: 'pro', createdAt: '2024-01-01' },
  { id: 'doc-1', name: 'Dr. Ahmed Ali', email: 'ahmed@clinic.com', role: 'doctor', specialization: 'General Physician', isActive: true, createdAt: '2024-01-10' },
  { id: 'doc-2', name: 'Dr. Fatima Noor', email: 'fatima@clinic.com', role: 'doctor', specialization: 'Dermatologist', isActive: true, createdAt: '2024-02-15' },
  { id: 'doc-3', name: 'Dr. Hassan Raza', email: 'hassan@clinic.com', role: 'doctor', specialization: 'Cardiologist', isActive: false, createdAt: '2024-03-01' },
  { id: 'rec-1', name: 'Ayesha Malik', email: 'ayesha@clinic.com', role: 'receptionist', isActive: true, createdAt: '2024-01-15' },
  { id: 'rec-2', name: 'Bilal Shah', email: 'bilal@clinic.com', role: 'receptionist', isActive: true, createdAt: '2024-04-01' },
  { id: 'pat-1', name: 'Ali Hussain', email: 'ali@patient.com', role: 'patient', createdAt: '2024-05-01' },
  { id: 'pat-2', name: 'Sara Iqbal', email: 'sara@patient.com', role: 'patient', createdAt: '2024-05-15' },
];

// ── Patients ──
export const mockPatients: Patient[] = [
  { id: 'p-1', name: 'Ali Hussain', age: 32, gender: 'Male', contact: '0300-1234567', email: 'ali@patient.com', bloodGroup: 'O+', allergies: ['Penicillin'], createdBy: 'rec-1', createdAt: '2024-05-01' },
  { id: 'p-2', name: 'Sara Iqbal', age: 28, gender: 'Female', contact: '0312-9876543', email: 'sara@patient.com', bloodGroup: 'A+', allergies: [], createdBy: 'rec-1', createdAt: '2024-05-15' },
  { id: 'p-3', name: 'Usman Tariq', age: 45, gender: 'Male', contact: '0321-5551234', bloodGroup: 'B+', allergies: ['Aspirin'], createdBy: 'rec-2', createdAt: '2024-06-01' },
  { id: 'p-4', name: 'Zainab Fatima', age: 55, gender: 'Female', contact: '0333-7778899', bloodGroup: 'AB-', allergies: [], createdBy: 'rec-1', createdAt: '2024-06-10' },
  { id: 'p-5', name: 'Hamza Sheikh', age: 22, gender: 'Male', contact: '0345-1112233', bloodGroup: 'O-', allergies: ['Sulfa drugs'], createdBy: 'rec-2', createdAt: '2024-07-01' },
  { id: 'p-6', name: 'Nadia Khan', age: 38, gender: 'Female', contact: '0300-4445566', bloodGroup: 'A-', allergies: [], createdBy: 'rec-1', createdAt: '2024-07-15' },
];

// ── Appointments ──
export const mockAppointments: Appointment[] = [
  { id: 'apt-1', patientId: 'p-1', patientName: 'Ali Hussain', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali', date: '2024-12-20', time: '09:00', status: 'Completed', reason: 'Fever and headache', createdAt: '2024-12-18' },
  { id: 'apt-2', patientId: 'p-2', patientName: 'Sara Iqbal', doctorId: 'doc-2', doctorName: 'Dr. Fatima Noor', date: '2024-12-20', time: '10:30', status: 'Completed', reason: 'Skin rash', createdAt: '2024-12-18' },
  { id: 'apt-3', patientId: 'p-3', patientName: 'Usman Tariq', doctorId: 'doc-3', doctorName: 'Dr. Hassan Raza', date: '2024-12-21', time: '11:00', status: 'Confirmed', reason: 'Chest pain', createdAt: '2024-12-19' },
  { id: 'apt-4', patientId: 'p-4', patientName: 'Zainab Fatima', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali', date: '2024-12-22', time: '09:30', status: 'Pending', reason: 'Routine checkup', createdAt: '2024-12-20' },
  { id: 'apt-5', patientId: 'p-5', patientName: 'Hamza Sheikh', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali', date: '2024-12-22', time: '14:00', status: 'Pending', reason: 'Sore throat', createdAt: '2024-12-20' },
  { id: 'apt-6', patientId: 'p-1', patientName: 'Ali Hussain', doctorId: 'doc-2', doctorName: 'Dr. Fatima Noor', date: '2024-12-23', time: '10:00', status: 'Pending', reason: 'Follow-up skin check', createdAt: '2024-12-21' },
  { id: 'apt-7', patientId: 'p-6', patientName: 'Nadia Khan', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali', date: '2024-12-19', time: '15:00', status: 'Cancelled', reason: 'Back pain', createdAt: '2024-12-17' },
  { id: 'apt-8', patientId: 'p-2', patientName: 'Sara Iqbal', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali', date: '2024-12-23', time: '11:30', status: 'Confirmed', reason: 'Joint pain', createdAt: '2024-12-21' },
];

// ── Prescriptions ──
export const mockPrescriptions: Prescription[] = [
  {
    id: 'rx-1', patientId: 'p-1', patientName: 'Ali Hussain', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali', appointmentId: 'apt-1',
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once at night', duration: '7 days' },
    ],
    instructions: 'Take after meals. Drink plenty of fluids.', diagnosis: 'Viral Fever with Allergic Rhinitis',
    aiExplanation: 'You have a common viral fever combined with nasal allergy. Paracetamol will bring down the fever, and Cetirizine will help with the sneezing and runny nose. Rest well and stay hydrated.',
    createdAt: '2024-12-20',
  },
  {
    id: 'rx-2', patientId: 'p-2', patientName: 'Sara Iqbal', doctorId: 'doc-2', doctorName: 'Dr. Fatima Noor', appointmentId: 'apt-2',
    medicines: [
      { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Apply twice daily', duration: '10 days' },
      { name: 'Loratadine', dosage: '10mg', frequency: 'Once daily', duration: '14 days' },
    ],
    instructions: 'Avoid hot water on affected area. Use mild soap.', diagnosis: 'Contact Dermatitis',
    createdAt: '2024-12-20',
  },
];

// ── Diagnosis Logs ──
export const mockDiagnosisLogs: DiagnosisLog[] = [
  {
    id: 'dx-1', patientId: 'p-1', patientName: 'Ali Hussain', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali',
    symptoms: ['Fever', 'Headache', 'Runny nose', 'Sneezing'],
    aiResponse: 'Based on the symptoms, the patient likely has viral fever with allergic rhinitis.',
    possibleConditions: ['Viral Fever', 'Allergic Rhinitis', 'Common Cold'],
    riskLevel: 'Low', suggestedTests: ['CBC', 'Allergy Panel'],
    createdAt: '2024-12-20',
  },
  {
    id: 'dx-2', patientId: 'p-3', patientName: 'Usman Tariq', doctorId: 'doc-3', doctorName: 'Dr. Hassan Raza',
    symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
    aiResponse: 'Symptoms suggest potential cardiac involvement. Recommend ECG and cardiac enzymes.',
    possibleConditions: ['Angina', 'Costochondritis', 'GERD'],
    riskLevel: 'High', suggestedTests: ['ECG', 'Troponin', 'Chest X-ray', 'Lipid Profile'],
    createdAt: '2024-12-21',
  },
  {
    id: 'dx-3', patientId: 'p-4', patientName: 'Zainab Fatima', doctorId: 'doc-1', doctorName: 'Dr. Ahmed Ali',
    symptoms: ['Joint pain', 'Stiffness', 'Swelling in knees'],
    aiResponse: 'Symptoms may indicate early osteoarthritis or rheumatoid arthritis.',
    possibleConditions: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Gout'],
    riskLevel: 'Medium', suggestedTests: ['X-ray Knee', 'ESR', 'CRP', 'Uric Acid'],
    createdAt: '2024-12-22',
  },
];

// Demo credentials
export const demoCredentials = [
  { role: 'admin', email: 'admin@clinic.com', password: 'admin123', label: 'Admin' },
  { role: 'doctor', email: 'ahmed@clinic.com', password: 'doctor123', label: 'Doctor' },
  { role: 'receptionist', email: 'ayesha@clinic.com', password: 'reception123', label: 'Receptionist' },
  { role: 'patient', email: 'ali@patient.com', password: 'patient123', label: 'Patient' },
];
