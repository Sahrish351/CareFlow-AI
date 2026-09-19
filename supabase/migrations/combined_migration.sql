-- ==============================================================================
-- CareFlow AI — Complete Combined Supabase Migration
-- Includes:
-- 1. Core relational schema with 5 roles: patient, doctor, receptionist, hospital_admin, super_admin
-- 2. Scoped foreign key (hospital_id) on profiles, appointments, queues, prescriptions
-- 3. Row Level Security (RLS) on all private tables
-- 4. Auth triggers: public signup defaulting to 'patient' + anti-privilege escalation
-- 5. Seed reference data for 9 benchmark Pakistani hospitals
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: EXTENSIONS & TABLES
-- ------------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  emergency_phone TEXT,
  google_maps_url TEXT,
  description TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.8,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'receptionist', 'hospital_admin', 'super_admin')),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  specialty TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.9,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctor Schedules Table
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, start_time)
);

-- Queues Table
CREATE TABLE IF NOT EXISTS public.queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_number TEXT NOT NULL,
  position INTEGER NOT NULL,
  patients_ahead INTEGER NOT NULL DEFAULT 0,
  estimated_wait_minutes INTEGER NOT NULL DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_consultation', 'completed', 'cancelled')),
  queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE RESTRICT,
  diagnosis TEXT,
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medical Documents Table
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care Passports Table
CREATE TABLE IF NOT EXISTS public.care_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  cnic TEXT,
  blood_group TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  privacy_settings JSONB DEFAULT '{"share_timeline":true,"share_prescriptions":true,"share_reports":true,"share_vitals":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Family Members Table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  allergies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- PART 2: AUTOMATIC TRIGGERS (Public Signup -> Patient & Anti-Escalation)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    hospital_id,
    full_name,
    email,
    phone,
    avatar_url
  )
  VALUES (
    NEW.id,
    'patient', -- Enforces patient role for public registrations
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'CareFlow Patient'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.care_passports (patient_id)
  VALUES (NEW.id)
  ON CONFLICT (patient_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
  calling_role TEXT;
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) OR (OLD.hospital_id IS DISTINCT FROM NEW.hospital_id) THEN
    SELECT role INTO calling_role FROM public.profiles WHERE id = auth.uid();
    IF calling_role != 'super_admin' AND auth.role() != 'service_role' THEN
      RAISE EXCEPTION 'Access Denied: You cannot modify your role or hospital assignment.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ------------------------------------------------------------------------------
-- PART 3: ROW LEVEL SECURITY & HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auth_user_hospital_id()
RETURNS UUID AS $$
  SELECT hospital_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_doctor_id()
RETURNS UUID AS $$
  SELECT id FROM public.doctors WHERE profile_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public view doctor profiles" ON public.profiles;
CREATE POLICY "Public view doctor profiles" ON public.profiles FOR SELECT USING (role = 'doctor');

DROP POLICY IF EXISTS "Hospital staff view hospital profiles" ON public.profiles;
CREATE POLICY "Hospital staff view hospital profiles" ON public.profiles FOR SELECT 
USING (
  hospital_id IS NOT NULL 
  AND hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('hospital_admin', 'receptionist')
);

DROP POLICY IF EXISTS "Super admin view all profiles" ON public.profiles;
CREATE POLICY "Super admin view all profiles" ON public.profiles FOR SELECT USING (public.is_super_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Super admin update all profiles" ON public.profiles;
CREATE POLICY "Super admin update all profiles" ON public.profiles FOR UPDATE USING (public.is_super_admin());

-- Hospitals Policies
DROP POLICY IF EXISTS "Public view active hospitals" ON public.hospitals;
CREATE POLICY "Public view active hospitals" ON public.hospitals FOR SELECT USING (is_active = true OR public.is_super_admin());

DROP POLICY IF EXISTS "Hospital admin update assigned hospital" ON public.hospitals;
CREATE POLICY "Hospital admin update assigned hospital" ON public.hospitals FOR UPDATE 
USING (id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin');

DROP POLICY IF EXISTS "Super admin manage all hospitals" ON public.hospitals;
CREATE POLICY "Super admin manage all hospitals" ON public.hospitals FOR ALL USING (public.is_super_admin());

-- Departments Policies
DROP POLICY IF EXISTS "Public view active departments" ON public.departments;
CREATE POLICY "Public view active departments" ON public.departments FOR SELECT USING (is_active = true OR public.is_super_admin());

DROP POLICY IF EXISTS "Hospital admin manage assigned departments" ON public.departments;
CREATE POLICY "Hospital admin manage assigned departments" ON public.departments FOR ALL 
USING (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin')
WITH CHECK (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin');

DROP POLICY IF EXISTS "Super admin manage all departments" ON public.departments;
CREATE POLICY "Super admin manage all departments" ON public.departments FOR ALL USING (public.is_super_admin());

-- Doctors Policies
DROP POLICY IF EXISTS "Public view active doctors" ON public.doctors;
CREATE POLICY "Public view active doctors" ON public.doctors FOR SELECT USING (is_active = true OR public.is_super_admin());

DROP POLICY IF EXISTS "Doctors update own profile" ON public.doctors;
CREATE POLICY "Doctors update own profile" ON public.doctors FOR UPDATE USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Hospital admin manage assigned doctors" ON public.doctors;
CREATE POLICY "Hospital admin manage assigned doctors" ON public.doctors FOR ALL 
USING (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin')
WITH CHECK (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin');

DROP POLICY IF EXISTS "Super admin manage all doctors" ON public.doctors;
CREATE POLICY "Super admin manage all doctors" ON public.doctors FOR ALL USING (public.is_super_admin());

-- Doctor Schedules Policies
DROP POLICY IF EXISTS "Public view schedules" ON public.doctor_schedules;
CREATE POLICY "Public view schedules" ON public.doctor_schedules FOR SELECT USING (is_available = true OR public.is_super_admin());

DROP POLICY IF EXISTS "Doctors manage own schedules" ON public.doctor_schedules;
CREATE POLICY "Doctors manage own schedules" ON public.doctor_schedules FOR ALL USING (doctor_id = public.get_auth_doctor_id());

DROP POLICY IF EXISTS "Hospital admin manage hospital doctor schedules" ON public.doctor_schedules;
CREATE POLICY "Hospital admin manage hospital doctor schedules" ON public.doctor_schedules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d 
    WHERE d.id = doctor_schedules.doctor_id 
    AND d.hospital_id = public.auth_user_hospital_id()
  ) AND public.auth_user_role() = 'hospital_admin'
);

DROP POLICY IF EXISTS "Super admin manage all schedules" ON public.doctor_schedules;
CREATE POLICY "Super admin manage all schedules" ON public.doctor_schedules FOR ALL USING (public.is_super_admin());

-- Appointments Policies
DROP POLICY IF EXISTS "Patients view own appointments" ON public.appointments;
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Patients insert own appointments" ON public.appointments;
CREATE POLICY "Patients insert own appointments" ON public.appointments FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "Patients update own appointments" ON public.appointments;
CREATE POLICY "Patients update own appointments" ON public.appointments FOR UPDATE USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors view assigned appointments" ON public.appointments;
CREATE POLICY "Doctors view assigned appointments" ON public.appointments FOR SELECT USING (doctor_id = public.get_auth_doctor_id());

DROP POLICY IF EXISTS "Doctors update assigned appointments" ON public.appointments;
CREATE POLICY "Doctors update assigned appointments" ON public.appointments FOR UPDATE USING (doctor_id = public.get_auth_doctor_id());

DROP POLICY IF EXISTS "Hospital staff manage hospital appointments" ON public.appointments;
CREATE POLICY "Hospital staff manage hospital appointments" ON public.appointments FOR ALL 
USING (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
)
WITH CHECK (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
);

DROP POLICY IF EXISTS "Super admin manage all appointments" ON public.appointments;
CREATE POLICY "Super admin manage all appointments" ON public.appointments FOR ALL USING (public.is_super_admin());

-- Queues Policies
DROP POLICY IF EXISTS "Patients view own queue status" ON public.queues;
CREATE POLICY "Patients view own queue status" ON public.queues FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors view own queue" ON public.queues;
CREATE POLICY "Doctors view own queue" ON public.queues FOR SELECT USING (doctor_id = public.get_auth_doctor_id());

DROP POLICY IF EXISTS "Doctors update own queue" ON public.queues;
CREATE POLICY "Doctors update own queue" ON public.queues FOR UPDATE USING (doctor_id = public.get_auth_doctor_id());

DROP POLICY IF EXISTS "Hospital staff manage hospital queue" ON public.queues;
CREATE POLICY "Hospital staff manage hospital queue" ON public.queues FOR ALL 
USING (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
)
WITH CHECK (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
);

DROP POLICY IF EXISTS "Super admin manage all queues" ON public.queues;
CREATE POLICY "Super admin manage all queues" ON public.queues FOR ALL USING (public.is_super_admin());

-- Prescriptions Policies
DROP POLICY IF EXISTS "Patients view own prescriptions" ON public.prescriptions;
CREATE POLICY "Patients view own prescriptions" ON public.prescriptions FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage assigned prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors manage assigned prescriptions" ON public.prescriptions FOR ALL 
USING (doctor_id = public.get_auth_doctor_id()) WITH CHECK (doctor_id = public.get_auth_doctor_id());

DROP POLICY IF EXISTS "Hospital staff view hospital prescriptions" ON public.prescriptions;
CREATE POLICY "Hospital staff view hospital prescriptions" ON public.prescriptions FOR SELECT 
USING (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
);

DROP POLICY IF EXISTS "Super admin manage all prescriptions" ON public.prescriptions;
CREATE POLICY "Super admin manage all prescriptions" ON public.prescriptions FOR ALL USING (public.is_super_admin());

-- Medical Documents Policies
DROP POLICY IF EXISTS "Patients view own documents" ON public.medical_documents;
CREATE POLICY "Patients view own documents" ON public.medical_documents FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Patients insert own documents" ON public.medical_documents;
CREATE POLICY "Patients insert own documents" ON public.medical_documents FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "Patients delete own documents" ON public.medical_documents;
CREATE POLICY "Patients delete own documents" ON public.medical_documents FOR DELETE USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Attending doctors view patient documents" ON public.medical_documents;
CREATE POLICY "Attending doctors view patient documents" ON public.medical_documents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.patient_id = medical_documents.patient_id 
    AND a.doctor_id = public.get_auth_doctor_id()
  )
);

DROP POLICY IF EXISTS "Super admin manage all documents" ON public.medical_documents;
CREATE POLICY "Super admin manage all documents" ON public.medical_documents FOR ALL USING (public.is_super_admin());

-- Care Passports Policies
DROP POLICY IF EXISTS "Patients manage own care passport" ON public.care_passports;
CREATE POLICY "Patients manage own care passport" ON public.care_passports FOR ALL 
USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "Attending doctors view patient care passport" ON public.care_passports;
CREATE POLICY "Attending doctors view patient care passport" ON public.care_passports FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.patient_id = care_passports.patient_id 
    AND a.doctor_id = public.get_auth_doctor_id()
  )
);

DROP POLICY IF EXISTS "Super admin manage all care passports" ON public.care_passports;
CREATE POLICY "Super admin manage all care passports" ON public.care_passports FOR ALL USING (public.is_super_admin());

-- Notifications & Family Members Policies
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Patients manage own family members" ON public.family_members;
CREATE POLICY "Patients manage own family members" ON public.family_members FOR ALL USING (primary_patient_id = auth.uid()) WITH CHECK (primary_patient_id = auth.uid());

-- ------------------------------------------------------------------------------
-- PART 4: SEED DATA (9 Reference Hospitals)
-- ------------------------------------------------------------------------------

INSERT INTO public.hospitals (id, name, slug, address, city, phone, emergency_phone, google_maps_url, description, rating, total_reviews, is_active)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Shifa International Hospital', 'shifa-international-islamabad', 'Pitras Bukhari Road, Sector H-8/4', 'Islamabad', '+92 (51) 846-3000', '+92 (51) 846-3111', 'https://maps.google.com/?q=Shifa+International+Hospital+Islamabad', 'Premier JCI-accredited tertiary care medical center in the capital city offering 40+ medical specialties, robotic surgery, and organ transplantation.', 4.9, 2840, true),
  ('a0000001-0000-0000-0000-000000000002', 'Shaukat Khanum Memorial Cancer Hospital & Research Centre', 'shaukat-khanum-lahore', '7A Block R-3, Johar Town', 'Lahore', '+92 (42) 3590-5000', '+92 (42) 3590-5112', 'https://maps.google.com/?q=Shaukat+Khanum+Hospital+Lahore', 'World-renowned charitable oncology institution offering state-of-the-art chemotherapy, radiation therapy, and specialized surgical oncology.', 4.9, 3420, true),
  ('a0000001-0000-0000-0000-000000000003', 'Aga Khan University Hospital', 'aga-khan-karachi', 'National Stadium Road', 'Karachi', '+92 (21) 111-911-911', '+92 (21) 3486-1111', 'https://maps.google.com/?q=Aga+Khan+University+Hospital+Karachi', 'Internationally renowned academic medical center with dual JCI and CAP accreditations, delivering gold-standard clinical care across Sindh.', 4.9, 4150, true),
  ('a0000001-0000-0000-0000-000000000004', 'Punjab Institute of Cardiology (PIC)', 'pic-lahore', 'Ghaus-ul-Azam Road, Jail Road', 'Lahore', '+92 (42) 9920-3051', '+92 (42) 9920-3055', 'https://maps.google.com/?q=Punjab+Institute+of+Cardiology+Lahore', 'Largest dedicated cardiovascular tertiary center in Pakistan performing complex bypass surgeries, primary angioplasties, and pediatric cardiac interventions.', 4.7, 1980, true),
  ('a0000001-0000-0000-0000-000000000005', 'Services Hospital', 'services-hospital-lahore', 'Ghaus-ul-Azam Road, Shadman', 'Lahore', '+92 (42) 9920-3402', '+92 (42) 9920-3420', 'https://maps.google.com/?q=Services+Hospital+Lahore', 'Prominent 1,400-bed public tertiary care hospital affiliated with Services Institute of Medical Sciences (SIMS), renowned for pediatric and internal medicine.', 4.5, 1420, true),
  ('a0000001-0000-0000-0000-000000000006', 'Mayo Hospital', 'mayo-hospital-lahore', 'Hospital Road, Anarkali', 'Lahore', '+92 (42) 9921-1100', '+92 (42) 9921-1122', 'https://maps.google.com/?q=Mayo+Hospital+Lahore', 'Historic 3,000-bed apex healthcare institution and teaching hospital of King Edward Medical University, housing specialized trauma and surgical units.', 4.6, 2150, true),
  ('a0000001-0000-0000-0000-000000000007', 'Pakistan Institute of Medical Sciences (PIMS)', 'pims-islamabad', 'Sector G-8/3', 'Islamabad', '+92 (51) 926-1170', '+92 (51) 926-1180', 'https://maps.google.com/?q=Pakistan+Institute+of+Medical+Sciences+Islamabad', 'National apex healthcare center in Islamabad providing subsidized and tertiary healthcare including Children Hospital and specialized Burn Care Center.', 4.6, 1890, true),
  ('a0000001-0000-0000-0000-000000000008', 'Combined Military Hospital (CMH)', 'cmh-lahore', 'Abid Majeed Road, Lahore Cantt', 'Lahore', '+92 (42) 3660-3100', '+92 (42) 3660-3111', 'https://maps.google.com/?q=CMH+Lahore', 'Top-tier military-civilian tertiary referral center known for advanced neurosurgery, orthopedic joint reconstruction, and disciplined critical care.', 4.8, 1670, true),
  ('a0000001-0000-0000-0000-000000000009', 'Doctors Hospital & Medical Center', 'doctors-hospital-lahore', '152/G-1, Canal Bank, Johar Town', 'Lahore', '+92 (42) 3530-2701', '+92 (42) 3530-2715', 'https://maps.google.com/?q=Doctors+Hospital+Lahore', 'Comprehensive 250-bed modern private specialty hospital recognized for advanced interventional cardiology, laparoscopic surgery, and intensive care.', 4.7, 1560, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  phone = EXCLUDED.phone,
  emergency_phone = EXCLUDED.emergency_phone,
  google_maps_url = EXCLUDED.google_maps_url,
  description = EXCLUDED.description;

INSERT INTO public.departments (hospital_id, name, specialty, description, icon)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Cardiology & Cardiac Surgery', 'Cardiology', 'Diagnostic angiographies, catheterization and cardiac bypass.', 'Heart'),
  ('a0000001-0000-0000-0000-000000000001', 'Neurology & Neurosurgery', 'Neurology', 'Brain mapping, stroke management, spinal trauma repair.', 'Brain'),
  ('a0000001-0000-0000-0000-000000000002', 'Medical & Surgical Oncology', 'Oncology', 'Precision chemotherapy, robotic cancer surgery, proton beam therapy.', 'Activity'),
  ('a0000001-0000-0000-0000-000000000003', 'Pediatric Medicine & Neonatology', 'Pediatrics', 'Comprehensive neonate ICU and childhood developmental wellness.', 'Baby'),
  ('a0000001-0000-0000-0000-000000000004', 'Cardiology & Angioplasty', 'Cardiology', '24/7 primary PCI and emergency cardiac catheterization.', 'Heart'),
  ('a0000001-0000-0000-0000-000000000005', 'Dermatology & Skin Center', 'Dermatology', 'Advanced clinical dermatology, allergy testing, laser skin repair.', 'Sparkles'),
  ('a0000001-0000-0000-0000-000000000006', 'General Medicine & Pulmonology', 'General Medicine', 'Respiratory infection control, asthma management, diagnostic triage.', 'Stethoscope'),
  ('a0000001-0000-0000-0000-000000000008', 'Orthopedics & Sports Medicine', 'Orthopedics', 'Minimally invasive arthroscopy, joint reconstruction, spinal care.', 'Bone')
ON CONFLICT DO NOTHING;
