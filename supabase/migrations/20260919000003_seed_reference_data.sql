-- ==============================================================================
-- CareFlow AI — Migration 03: Seed 9 Reference Pakistani Hospitals & Specialties
-- ==============================================================================

-- 1. Insert 9 Standard Pakistani Hospitals (Fixed UUIDs for reference integrity)
INSERT INTO public.hospitals (id, name, slug, address, city, phone, emergency_phone, google_maps_url, description, rating, total_reviews, is_active)
VALUES
(
  'a0000001-0000-0000-0000-000000000001',
  'Shifa International Hospital',
  'shifa-international-islamabad',
  'Pitras Bukhari Road, Sector H-8/4',
  'Islamabad',
  '+92 (51) 846-3000',
  '+92 (51) 846-3111',
  'https://maps.google.com/?q=Shifa+International+Hospital+Islamabad',
  'Premier JCI-accredited tertiary care medical center in the capital city offering 40+ medical specialties, robotic surgery, and organ transplantation.',
  4.9,
  2840,
  true
),
(
  'a0000001-0000-0000-0000-000000000002',
  'Shaukat Khanum Memorial Cancer Hospital & Research Centre',
  'shaukat-khanum-lahore',
  '7A Block R-3, Johar Town',
  'Lahore',
  '+92 (42) 3590-5000',
  '+92 (42) 3590-5112',
  'https://maps.google.com/?q=Shaukat+Khanum+Hospital+Lahore',
  'World-renowned charitable oncology institution offering state-of-the-art chemotherapy, radiation therapy, and specialized surgical oncology.',
  4.9,
  3420,
  true
),
(
  'a0000001-0000-0000-0000-000000000003',
  'Aga Khan University Hospital',
  'aga-khan-karachi',
  'National Stadium Road',
  'Karachi',
  '+92 (21) 111-911-911',
  '+92 (21) 3486-1111',
  'https://maps.google.com/?q=Aga+Khan+University+Hospital+Karachi',
  'Internationally renowned academic medical center with dual JCI and CAP accreditations, delivering gold-standard clinical care across Sindh.',
  4.9,
  4150,
  true
),
(
  'a0000001-0000-0000-0000-000000000004',
  'Punjab Institute of Cardiology (PIC)',
  'pic-lahore',
  'Ghaus-ul-Azam Road, Jail Road',
  'Lahore',
  '+92 (42) 9920-3051',
  '+92 (42) 9920-3055',
  'https://maps.google.com/?q=Punjab+Institute+of+Cardiology+Lahore',
  'Largest dedicated cardiovascular tertiary center in Pakistan performing complex bypass surgeries, primary angioplasties, and pediatric cardiac interventions.',
  4.7,
  1980,
  true
),
(
  'a0000001-0000-0000-0000-000000000005',
  'Services Hospital',
  'services-hospital-lahore',
  'Ghaus-ul-Azam Road, Shadman',
  'Lahore',
  '+92 (42) 9920-3402',
  '+92 (42) 9920-3420',
  'https://maps.google.com/?q=Services+Hospital+Lahore',
  'Prominent 1,400-bed public tertiary care hospital affiliated with Services Institute of Medical Sciences (SIMS), renowned for pediatric and internal medicine.',
  4.5,
  1420,
  true
),
(
  'a0000001-0000-0000-0000-000000000006',
  'Mayo Hospital',
  'mayo-hospital-lahore',
  'Hospital Road, Anarkali',
  'Lahore',
  '+92 (42) 9921-1100',
  '+92 (42) 9921-1122',
  'https://maps.google.com/?q=Mayo+Hospital+Lahore',
  'Historic 3,000-bed apex healthcare institution and teaching hospital of King Edward Medical University, housing specialized trauma and surgical units.',
  4.6,
  2150,
  true
),
(
  'a0000001-0000-0000-0000-000000000007',
  'Pakistan Institute of Medical Sciences (PIMS)',
  'pims-islamabad',
  'Sector G-8/3',
  'Islamabad',
  '+92 (51) 926-1170',
  '+92 (51) 926-1180',
  'https://maps.google.com/?q=Pakistan+Institute+of+Medical+Sciences+Islamabad',
  'National apex healthcare center in Islamabad providing subsidized and tertiary healthcare including Children Hospital and specialized Burn Care Center.',
  4.6,
  1890,
  true
),
(
  'a0000001-0000-0000-0000-000000000008',
  'Combined Military Hospital (CMH)',
  'cmh-lahore',
  'Abid Majeed Road, Lahore Cantt',
  'Lahore',
  '+92 (42) 3660-3100',
  '+92 (42) 3660-3111',
  'https://maps.google.com/?q=CMH+Lahore',
  'Top-tier military-civilian tertiary referral center known for advanced neurosurgery, orthopedic joint reconstruction, and disciplined critical care.',
  4.8,
  1670,
  true
),
(
  'a0000001-0000-0000-0000-000000000009',
  'Doctors Hospital & Medical Center',
  'doctors-hospital-lahore',
  '152/G-1, Canal Bank, Johar Town',
  'Lahore',
  '+92 (42) 3530-2701',
  '+92 (42) 3530-2715',
  'https://maps.google.com/?q=Doctors+Hospital+Lahore',
  'Comprehensive 250-bed modern private specialty hospital recognized for advanced interventional cardiology, laparoscopic surgery, and intensive care.',
  4.7,
  1560,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  phone = EXCLUDED.phone,
  emergency_phone = EXCLUDED.emergency_phone,
  google_maps_url = EXCLUDED.google_maps_url,
  description = EXCLUDED.description;

-- 2. Insert Core Clinical Departments for each Hospital
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
