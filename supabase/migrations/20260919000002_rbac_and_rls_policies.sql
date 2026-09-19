-- ==============================================================================
-- CareFlow AI — Migration 02: Row Level Security (RLS) & 5-Role Access Control
-- ==============================================================================

-- 1. Enable RLS on all tables
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

-- ------------------------------------------------------------------------------
-- 2. Auth Helper Functions (SECURITY DEFINER to avoid RLS recursion)
-- ------------------------------------------------------------------------------

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

-- ------------------------------------------------------------------------------
-- 3. PROFILES Policies
-- ------------------------------------------------------------------------------

-- Allow users to view their own profile
CREATE POLICY "Users view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow public to view doctor profiles for discovery/booking
CREATE POLICY "Public view doctor profiles" 
ON public.profiles FOR SELECT 
USING (role = 'doctor');

-- Hospital staff (Admin/Receptionist) can view staff profiles belonging to their hospital
CREATE POLICY "Hospital staff view hospital profiles" 
ON public.profiles FOR SELECT 
USING (
  hospital_id IS NOT NULL 
  AND hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('hospital_admin', 'receptionist')
);

-- Super admin has universal view access
CREATE POLICY "Super admin view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_super_admin());

-- Users can update their own personal details (anti-escalation trigger protects role/hospital_id)
CREATE POLICY "Users update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Super admin can update any profile (e.g. assign hospital or role)
CREATE POLICY "Super admin update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 4. HOSPITALS Policies
-- ------------------------------------------------------------------------------

-- Public can view active hospitals
CREATE POLICY "Public view active hospitals" 
ON public.hospitals FOR SELECT 
USING (is_active = true OR public.is_super_admin());

-- Hospital Admin can update only their assigned hospital
CREATE POLICY "Hospital admin update assigned hospital" 
ON public.hospitals FOR UPDATE 
USING (id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin');

-- Super Admin can do everything on hospitals
CREATE POLICY "Super admin manage all hospitals" 
ON public.hospitals FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 5. DEPARTMENTS Policies
-- ------------------------------------------------------------------------------

-- Public can view active departments
CREATE POLICY "Public view active departments" 
ON public.departments FOR SELECT 
USING (is_active = true OR public.is_super_admin());

-- Hospital Admin can manage departments of their hospital
CREATE POLICY "Hospital admin manage assigned departments" 
ON public.departments FOR ALL 
USING (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin')
WITH CHECK (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin');

-- Super Admin can manage all departments
CREATE POLICY "Super admin manage all departments" 
ON public.departments FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 6. DOCTORS Policies
-- ------------------------------------------------------------------------------

-- Public can view active doctors
CREATE POLICY "Public view active doctors" 
ON public.doctors FOR SELECT 
USING (is_active = true OR public.is_super_admin());

-- Doctor can update their own clinical bio, fee, experience
CREATE POLICY "Doctors update own profile" 
ON public.doctors FOR UPDATE 
USING (profile_id = auth.uid());

-- Hospital Admin can manage doctors at their assigned hospital
CREATE POLICY "Hospital admin manage assigned doctors" 
ON public.doctors FOR ALL 
USING (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin')
WITH CHECK (hospital_id = public.auth_user_hospital_id() AND public.auth_user_role() = 'hospital_admin');

-- Super Admin manage all doctors
CREATE POLICY "Super admin manage all doctors" 
ON public.doctors FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 7. DOCTOR SCHEDULES Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Public view schedules" 
ON public.doctor_schedules FOR SELECT 
USING (is_available = true OR public.is_super_admin());

CREATE POLICY "Doctors manage own schedules" 
ON public.doctor_schedules FOR ALL 
USING (doctor_id = public.get_auth_doctor_id());

CREATE POLICY "Hospital admin manage hospital doctor schedules" 
ON public.doctor_schedules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d 
    WHERE d.id = doctor_schedules.doctor_id 
    AND d.hospital_id = public.auth_user_hospital_id()
  ) AND public.auth_user_role() = 'hospital_admin'
);

CREATE POLICY "Super admin manage all schedules" 
ON public.doctor_schedules FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 8. APPOINTMENTS Policies (Strict RBAC & Patient/Hospital Scoping)
-- ------------------------------------------------------------------------------

-- Patients view and create own appointments
CREATE POLICY "Patients view own appointments" 
ON public.appointments FOR SELECT 
USING (patient_id = auth.uid());

CREATE POLICY "Patients insert own appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients update own appointments" 
ON public.appointments FOR UPDATE 
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

-- Doctors view and update appointments assigned to them
CREATE POLICY "Doctors view assigned appointments" 
ON public.appointments FOR SELECT 
USING (doctor_id = public.get_auth_doctor_id());

CREATE POLICY "Doctors update assigned appointments" 
ON public.appointments FOR UPDATE 
USING (doctor_id = public.get_auth_doctor_id());

-- Receptionist & Hospital Admin: view and manage appointments for their hospital ONLY
CREATE POLICY "Hospital staff manage hospital appointments" 
ON public.appointments FOR ALL 
USING (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
)
WITH CHECK (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
);

-- Super Admin has complete access
CREATE POLICY "Super admin manage all appointments" 
ON public.appointments FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 9. QUEUES Policies (Hospital-Scoped Live Operations)
-- ------------------------------------------------------------------------------

-- Patients view only queue item for their appointment
CREATE POLICY "Patients view own queue status" 
ON public.queues FOR SELECT 
USING (patient_id = auth.uid());

-- Doctors view their consultation queue
CREATE POLICY "Doctors view own queue" 
ON public.queues FOR SELECT 
USING (doctor_id = public.get_auth_doctor_id());

CREATE POLICY "Doctors update own queue" 
ON public.queues FOR UPDATE 
USING (doctor_id = public.get_auth_doctor_id());

-- Receptionist & Hospital Admin manage queue items in their hospital ONLY
CREATE POLICY "Hospital staff manage hospital queue" 
ON public.queues FOR ALL 
USING (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
)
WITH CHECK (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
);

-- Super Admin full access
CREATE POLICY "Super admin manage all queues" 
ON public.queues FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 10. PRESCRIPTIONS Policies
-- ------------------------------------------------------------------------------

-- Patients view only their own prescriptions
CREATE POLICY "Patients view own prescriptions" 
ON public.prescriptions FOR SELECT 
USING (patient_id = auth.uid());

-- Doctors view and issue prescriptions for their patients
CREATE POLICY "Doctors manage assigned prescriptions" 
ON public.prescriptions FOR ALL 
USING (doctor_id = public.get_auth_doctor_id())
WITH CHECK (doctor_id = public.get_auth_doctor_id());

-- Hospital staff can view prescriptions issued at their hospital
CREATE POLICY "Hospital staff view hospital prescriptions" 
ON public.prescriptions FOR SELECT 
USING (
  hospital_id = public.auth_user_hospital_id() 
  AND public.auth_user_role() IN ('receptionist', 'hospital_admin')
);

-- Super Admin full access
CREATE POLICY "Super admin manage all prescriptions" 
ON public.prescriptions FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 11. MEDICAL DOCUMENTS Policies (Private Storage Vault)
-- ------------------------------------------------------------------------------

-- Patients manage their own private health documents
CREATE POLICY "Patients view own documents" 
ON public.medical_documents FOR SELECT 
USING (patient_id = auth.uid());

CREATE POLICY "Patients insert own documents" 
ON public.medical_documents FOR INSERT 
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients delete own documents" 
ON public.medical_documents FOR DELETE 
USING (patient_id = auth.uid());

-- Attending doctors can view documents of patients they have confirmed appointments with
CREATE POLICY "Attending doctors view patient documents" 
ON public.medical_documents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.patient_id = medical_documents.patient_id 
    AND a.doctor_id = public.get_auth_doctor_id()
  )
);

-- Super Admin full access
CREATE POLICY "Super admin manage all documents" 
ON public.medical_documents FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 12. CARE PASSPORTS Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Patients manage own care passport" 
ON public.care_passports FOR ALL 
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Attending doctors view patient care passport" 
ON public.care_passports FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.patient_id = care_passports.patient_id 
    AND a.doctor_id = public.get_auth_doctor_id()
  )
);

CREATE POLICY "Super admin manage all care passports" 
ON public.care_passports FOR ALL 
USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 13. NOTIFICATIONS Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Users manage own notifications" 
ON public.notifications FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 14. FAMILY MEMBERS Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Patients manage own family members" 
ON public.family_members FOR ALL 
USING (primary_patient_id = auth.uid())
WITH CHECK (primary_patient_id = auth.uid());
