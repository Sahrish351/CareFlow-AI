-- ==============================================================================
-- CareFlow AI — PostgreSQL Database Schema
-- Single Source of Truth matching 03_SYSTEM_ARCHITECTURE.md
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Application Users: patient, doctor, admin)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. HOSPITALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. DEPARTMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. DOCTORS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  bio TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. DOCTOR_DEPARTMENTS (Junction Table)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor_departments (
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, department_id)
);

-- ------------------------------------------------------------------------------
-- 6. DOCTOR_SCHEDULES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. APPOINTMENTS (With double-booking protection constraint)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Database-level constraint strictly preventing double-booking of any doctor slot
  CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, start_time)
);

-- ------------------------------------------------------------------------------
-- 8. QUEUES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  queue_date DATE NOT NULL,
  position INTEGER NOT NULL,
  patients_ahead INTEGER NOT NULL DEFAULT 0,
  estimated_wait_minutes INTEGER NOT NULL DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. MEDICAL_DOCUMENTS (Storage metadata for private bucket 'medical-reports')
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- e.g. 'Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Prescription', 'Other'
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'booking_confirmed', 'booking_cancelled', 'queue_update', 'reminder', 'report_ready'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. AI_CONVERSATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. AI_MESSAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_departments_hospital ON departments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_date ON doctor_schedules(doctor_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_queues_appointment ON queues(appointment_id);
CREATE INDEX IF NOT EXISTS idx_queues_date_status ON queues(queue_date, status);
CREATE INDEX IF NOT EXISTS idx_medical_documents_patient ON medical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_messages_convo ON ai_messages(conversation_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users read their own or doctors/admins, update own
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Hospitals & Departments: anyone can view active, admin can manage
CREATE POLICY "Public read active hospitals" ON hospitals FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admin manage hospitals" ON hospitals FOR ALL USING (is_admin());

CREATE POLICY "Public read active departments" ON departments FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admin manage departments" ON departments FOR ALL USING (is_admin());

-- Doctors & Schedules: public read active, doctor manage own, admin manage all
CREATE POLICY "Public read active doctors" ON doctors FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Doctor update own doctor record" ON doctors FOR UPDATE USING (profile_id = auth.uid() OR is_admin());
CREATE POLICY "Admin manage doctors" ON doctors FOR ALL USING (is_admin());

CREATE POLICY "Public read doctor_departments" ON doctor_departments FOR SELECT USING (true);
CREATE POLICY "Admin manage doctor_departments" ON doctor_departments FOR ALL USING (is_admin());

CREATE POLICY "Public read active schedules" ON doctor_schedules FOR SELECT USING (is_available = true OR is_admin());
CREATE POLICY "Doctors manage own schedules" ON doctor_schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM doctors WHERE doctors.id = doctor_schedules.doctor_id AND doctors.profile_id = auth.uid()) OR is_admin()
);

-- Appointments: patient can view/create/cancel own, doctor can view/update assigned, admin can view all
CREATE POLICY "Patients manage own appointments" ON appointments FOR SELECT USING (patient_id = auth.uid() OR is_admin());
CREATE POLICY "Patients insert own appointments" ON appointments FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients update own appointments" ON appointments FOR UPDATE USING (patient_id = auth.uid() OR is_admin());

CREATE POLICY "Doctors view assigned appointments" ON appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.profile_id = auth.uid())
);
CREATE POLICY "Doctors update assigned appointments" ON appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.profile_id = auth.uid())
);

-- Queues: accessible by patient of appointment, assigned doctor, and admin
CREATE POLICY "View queues for own or assigned appointments" ON queues FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments WHERE appointments.id = queues.appointment_id AND (appointments.patient_id = auth.uid() OR is_admin()))
  OR EXISTS (SELECT 1 FROM appointments JOIN doctors ON doctors.id = appointments.doctor_id WHERE appointments.id = queues.appointment_id AND doctors.profile_id = auth.uid())
);
CREATE POLICY "Manage queues" ON queues FOR ALL USING (
  EXISTS (SELECT 1 FROM appointments JOIN doctors ON doctors.id = appointments.doctor_id WHERE appointments.id = queues.appointment_id AND doctors.profile_id = auth.uid())
  OR is_admin()
);

-- Medical Documents: only patient can view and upload their private documents
CREATE POLICY "Patients view own documents" ON medical_documents FOR SELECT USING (
  patient_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM appointments JOIN doctors ON doctors.id = appointments.doctor_id WHERE appointments.patient_id = medical_documents.patient_id AND doctors.profile_id = auth.uid())
  OR is_admin()
);
CREATE POLICY "Patients insert own documents" ON medical_documents FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients delete own documents" ON medical_documents FOR DELETE USING (patient_id = auth.uid() OR is_admin());

-- Notifications: user can view and update own notifications
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- AI Conversations & Messages: user can manage own
CREATE POLICY "Users manage own ai conversations" ON ai_conversations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own ai messages" ON ai_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid())
);

