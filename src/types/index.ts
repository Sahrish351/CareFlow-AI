// CareFlow AI — Core Domain TypeScript Interfaces

export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'hospital_admin' | 'super_admin' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  hospital_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  description?: string | null;
  hero_image?: string;
  thumbnail_image?: string;
  facilities?: string[];
  opening_hours?: string;
  emergency_phone?: string;
  is_active: boolean;
  is_reference_network?: boolean;
  availability_status?: 'AVAILABLE' | 'LIMITED' | 'FULLY BOOKED';
  google_maps_url?: string;
  departments?: Department[];
  doctor_count?: number;
  next_available_slot?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  specialty?: string | null;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  hospital?: Hospital;
  created_at?: string;
  updated_at?: string;
}

export interface CareCategory {
  id: string;
  name: string;
  specialty: string;
  description: string;
  icon: string;
  keywords: string[];
  commonSymptoms: string[];
  doctor_count?: number;
}

export interface Doctor {
  id: string;
  profile_id?: string | null;
  hospital_id: string;
  specialty: string;
  bio?: string | null;
  experience_years: number;
  consultation_fee: number;
  consultation_fee_pkr?: number;
  available_days?: string[];
  is_active: boolean;
  is_approved?: boolean;
  is_demo_profile?: boolean;
  rating?: number;
  review_count?: number;
  total_reviews?: number;
  languages?: string[];
  education?: string;
  qualifications?: string[] | string;
  next_available_slot?: string;
  profile?: Profile;
  hospital?: Hospital;
  departments?: Department[];
  created_at?: string;
  updated_at?: string;
}

export interface SavedDoctor {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor?: Doctor;
  created_at: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  schedule_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  slot_duration_minutes: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  department_id: string;
  hospital_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  cancellation_reason?: string | null;
  rescheduled_at?: string | null;
  family_member_id?: string | null;
  family_member?: FamilyMember | null;
  prescription?: Prescription | null;
  review?: DoctorReview | null;
  patient?: Profile;
  doctor?: Doctor;
  department?: Department;
  hospital?: Hospital;
  queue?: Queue;
  created_at?: string;
  updated_at?: string;
}

export type QueueStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface Queue {
  id: string;
  appointment_id: string;
  queue_date: string;
  position: number;
  patients_ahead: number;
  estimated_wait_minutes: number;
  status: QueueStatus;
  appointment?: Appointment;
  updated_at?: string;
}

export type DocumentType = 
  | 'Blood Test' 
  | 'X-Ray' 
  | 'MRI' 
  | 'CT Scan' 
  | 'Ultrasound' 
  | 'Prescription' 
  | 'Other';

export interface MedicalDocument {
  id: string;
  patient_id: string;
  appointment_id?: string | null;
  document_name: string;
  document_type: DocumentType;
  storage_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  document_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_appointment_id?: string | null;
  created_at?: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  title?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AiMessageAction {
  type: 'book_doctor' | 'view_appointment' | 'view_queue' | 'view_reports' | 'emergency_call' | 'find_department' | 'view_hospital';
  label: string;
  payload?: any;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant' | 'system';
  message: string;
  metadata?: {
    is_emergency?: boolean;
    recommended_department?: string;
    explanation?: string;
    suggested_doctors?: Doctor[];
    suggested_hospitals?: Hospital[];
    available_slots?: string[];
    actions?: AiMessageAction[];
    disclaimer?: string;
  } | null;
  created_at?: string;
}

export interface EmergencyEvaluation {
  isEmergency: boolean;
  matchedRule?: string;
  urgencyLevel: 'critical' | 'high' | 'normal';
  safetyGuidance: string;
  actionRequired: string;
}

export interface AiCareSearchResult {
  userQuery: string;
  suggestedCare: string;
  explanation: string;
  recommendedHospitals: Hospital[];
  doctors: Doctor[];
  isEmergency?: boolean;
  matchedCategory?: CareCategory | null;
  detectedLanguage?: 'English' | 'Urdu' | 'Roman Urdu';
  extractedCare?: string;
  extractedCity?: string;
  extractedDate?: string;
  extractedTime?: string;
  extractedFamilyMember?: string;
  suggestedActions?: {
    label: string;
    type: 'hospital' | 'doctor' | 'slots' | 'emergency';
    filter?: any;
  }[];
}

export type FamilyRelationship = 'Child' | 'Mother' | 'Father' | 'Spouse' | 'Sibling' | 'Other';

export interface FamilyMember {
  id: string;
  patient_id: string;
  full_name: string;
  relationship: FamilyRelationship;
  date_of_birth?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | null;
  blood_group?: string | null;
  allergies?: string[];
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PrescriptionItem {
  medicine_name: string;
  name?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export type PrescriptionMedicine = PrescriptionItem;

export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  prescription_date: string;
  clinical_diagnosis_notes: string;
  medicines: PrescriptionItem[];
  advice_notes?: string;
  follow_up_date?: string | null;
  follow_up_instructions?: string | null;
  doctor?: Doctor;
  patient?: Profile;
  appointment?: Appointment;
  created_at?: string;
}

export interface DoctorReview {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string;
  rating: number; // 1 to 5
  comment?: string | null;
  patient_name?: string;
  created_at: string;
}

export type HealthTimelineEventType = 
  | 'appointment_booked'
  | 'visit_completed'
  | 'report_uploaded'
  | 'prescription_issued'
  | 'followup_scheduled';

export interface HealthTimelineEvent {
  id: string;
  patient_id: string;
  date: string;
  type: HealthTimelineEventType;
  title: string;
  description: string;
  reference_id?: string;
  doctor_name?: string;
  hospital_name?: string;
  badge_label?: string;
  created_at: string;
}

export interface CarePassportPrivacySettings {
  share_timeline: boolean;
  share_prescriptions: boolean;
  share_reports: boolean;
  share_allergies: boolean;
  share_conditions: boolean;
  allow_doctor_briefing: boolean;
}

export interface CarePassport {
  id: string;
  patient_id: string;
  cnic?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  privacy_settings: CarePassportPrivacySettings;
  created_at: string;
  updated_at: string;
}

export interface VisitPlan {
  appointment_id: string;
  hospital_name: string;
  hospital_address: string;
  hospital_city: string;
  hospital_phone: string;
  emergency_phone?: string;
  google_maps_url?: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  queue_token: string;
  family_member_name?: string;
  documents_to_bring: string[];
}

