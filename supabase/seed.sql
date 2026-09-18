-- ==============================================================================
-- CareFlow AI — Fictional Demo Seed Data
-- ==============================================================================

-- 1. HOSPITALS
INSERT INTO hospitals (id, name, address, city, phone, description, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Metropolitan General Hospital', '742 Evergreen Healthcare Blvd', 'New York', '+1 (555) 234-5678', 'Premier tertiary care hospital featuring state-of-the-art diagnostic and surgical centers.', true),
('22222222-2222-2222-2222-222222222222', 'St. Jude Memorial Medical Center', '108 Beacon Hill Road', 'Boston', '+1 (555) 876-5432', 'Leading regional clinical hub renowned for cardiology, neurology, and pediatric care.', true),
('33333333-3333-3333-3333-333333333333', 'Apex Specialty Health & Surgical Center', '45 Innovation Way', 'San Francisco', '+1 (555) 432-1098', 'Advanced outpatient institute focused on dermatology, orthopedics, and preventative health.', true)
ON CONFLICT (id) DO NOTHING;

-- 2. DEPARTMENTS
INSERT INTO departments (id, hospital_id, name, specialty, description, icon, is_active) VALUES
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Cardiology', 'Heart & Vascular', 'Diagnosis and treatment of heart failure, arrhythmias, hypertension, and coronary artery disease.', 'HeartPulse', true),
('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Dermatology', 'Skin, Hair & Nails', 'Care for acute and chronic skin disorders, rashes, eczema, psoriasis, acne, and skin oncology.', 'Sparkles', true),
('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Orthopedics', 'Bones & Joints', 'Expert assessment for joint pain, sports injuries, fracture management, and spine health.', 'Bone', true),
('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Pediatrics', 'Children & Adolescents', 'Dedicated infant to adolescent medical care, vaccinations, and growth assessments.', 'Baby', true),
('d5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Neurology', 'Brain & Nervous System', 'Comprehensive care for persistent headaches, migraines, neuropathies, and neurological disorders.', 'Brain', true),
('d6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'General Medicine', 'Internal Medicine & Primary Care', 'First-line clinical evaluation, chronic condition management, and routine health checks.', 'Stethoscope', true),
('d7777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Pulmonology', 'Lungs & Respiration', 'Management of asthma, chronic cough, bronchitis, and respiratory tract issues.', 'Wind', true),
('d8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'Ophthalmology', 'Vision & Eye Care', 'Vision examinations, cataract evaluation, eye allergies, and optical therapies.', 'Eye', true),
('d9999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'ENT (Ear, Nose & Throat)', 'Otolaryngology', 'Treatment for sinus congestion, ear infections, hearing issues, and throat discomfort.', 'Ear', true),
('daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Gastroenterology', 'Digestive Health', 'Care for abdominal discomfort, reflux, gastritis, IBS, and digestive tract disorders.', 'Activity', true)
ON CONFLICT (id) DO NOTHING;

-- 3. DEMO PROFILES (Synthetic Doctors, Patients, Admins)
-- Note: Replace or connect with auth.users IDs when real auth is used.
INSERT INTO profiles (id, role, full_name, email, phone, avatar_url) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin', 'Hospital Administrator', 'admin@careflow.ai', '+1 (555) 000-0001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000001', 'doctor', 'Dr. Sarah Jenkins, MD', 'dr.sarah.jenkins@careflow.ai', '+1 (555) 100-0001', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000002', 'doctor', 'Dr. Marcus Vance, MD', 'dr.marcus.vance@careflow.ai', '+1 (555) 100-0002', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000003', 'doctor', 'Dr. Elena Rostova, MD', 'dr.elena.rostova@careflow.ai', '+1 (555) 100-0003', 'https://images.unsplash.com/photo-1594824813684-25e6ffc6b541?w=150&auto=format&fit=crop&q=80'),
('c0000000-0000-0000-0000-000000000001', 'patient', 'Alexander Hayes', 'patient.alex@careflow.ai', '+1 (555) 900-0001', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 4. DOCTORS (16 Doctors across all 10 departments)
INSERT INTO doctors (id, profile_id, hospital_id, specialty, bio, experience_years, consultation_fee, is_active) VALUES
('doc11111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Cardiology', 'Board-certified cardiologist specializing in preventative cardiology, echocardiography, and hypertension management.', 14, 180.00, true),
('doc22222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Dermatology', 'Consultant dermatologist with extensive focus on acute skin lesions, inflammatory eczema, and laser dermatology.', 11, 150.00, true),
('doc33333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Orthopedics', 'Specialist in sports injury rehabilitation, minimally invasive knee & shoulder arthroscopy, and joint preservation.', 16, 200.00, true),
('doc44444-4444-4444-4444-444444444444', NULL, '11111111-1111-1111-1111-111111111111', 'Pediatrics', 'Dedicated pediatrician passionate about neonatal care, developmental milestones, and childhood immunization.', 9, 130.00, true),
('doc55555-5555-5555-5555-555555555555', NULL, '22222222-2222-2222-2222-222222222222', 'Neurology', 'Renowned neurologist specialized in chronic headache pathways, movement disorders, and vestibular diagnostics.', 18, 220.00, true),
('doc66666-6666-6666-6666-666666666666', NULL, '22222222-2222-2222-2222-222222222222', 'General Medicine', 'Primary care physician providing holistic assessments, health screenings, and continuous chronic care.', 12, 110.00, true),
('doc77777-7777-7777-7777-777777777777', NULL, '22222222-2222-2222-2222-222222222222', 'Pulmonology', 'Expert pulmonologist treating obstructive pulmonary diseases, adult asthma, and post-viral lung recovery.', 15, 175.00, true),
('doc88888-8888-8888-8888-888888888888', NULL, '33333333-3333-3333-3333-333333333333', 'Ophthalmology', 'Ophthalmic surgeon specializing in corneal treatments, diabetic retinopathy screening, and visual acuity correction.', 13, 160.00, true),
('doc99999-9999-9999-9999-999999999999', NULL, '33333333-3333-3333-3333-333333333333', 'ENT (Ear, Nose & Throat)', 'Otolaryngologist skilled in endoscopic sinus surgeries, allergy management, and hearing balance restoration.', 10, 145.00, true),
('docaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, '33333333-3333-3333-3333-333333333333', 'Gastroenterology', 'Senior gastroenterologist focused on diagnostic endoscopy, inflammatory bowel disease, and hepatic health.', 17, 195.00, true),
('docbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '11111111-1111-1111-1111-111111111111', 'Dermatology', 'Dermatologic surgeon skilled in mole mapping, psoriasis biologics, and pediatric skin conditions.', 8, 140.00, true),
('docccccc-cccc-cccc-cccc-cccccccccccc', NULL, '22222222-2222-2222-2222-222222222222', 'Cardiology', 'Interventional cardiologist specializing in coronary artery health, cardiac rehab, and rhythm disorders.', 20, 240.00, true)
ON CONFLICT (id) DO NOTHING;

-- 5. DOCTOR DEPARTMENTS JUNCTION
INSERT INTO doctor_departments (doctor_id, department_id) VALUES
('doc11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111'),
('doc22222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222'),
('doc33333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333'),
('doc44444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444'),
('doc55555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555'),
('doc66666-6666-6666-6666-666666666666', 'd6666666-6666-6666-6666-666666666666'),
('doc77777-7777-7777-7777-777777777777', 'd7777777-7777-7777-7777-777777777777'),
('doc88888-8888-8888-8888-888888888888', 'd8888888-8888-8888-8888-888888888888'),
('doc99999-9999-9999-9999-999999999999', 'd9999999-9999-9999-9999-999999999999'),
('docaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('docbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd2222222-2222-2222-2222-222222222222'),
('docccccc-cccc-cccc-cccc-cccccccccccc', 'd1111111-1111-1111-1111-111111111111')
ON CONFLICT (doctor_id, department_id) DO NOTHING;

-- 6. DOCTOR SCHEDULES (Today & Tomorrow slots)
INSERT INTO doctor_schedules (id, doctor_id, schedule_date, start_time, end_time, slot_duration_minutes, is_available) VALUES
(gen_random_uuid(), 'doc11111-1111-1111-1111-111111111111', CURRENT_DATE, '09:00:00', '09:30:00', 30, true),
(gen_random_uuid(), 'doc11111-1111-1111-1111-111111111111', CURRENT_DATE, '10:00:00', '10:30:00', 30, true),
(gen_random_uuid(), 'doc11111-1111-1111-1111-111111111111', CURRENT_DATE, '11:00:00', '11:30:00', 30, true),
(gen_random_uuid(), 'doc11111-1111-1111-1111-111111111111', CURRENT_DATE + 1, '09:30:00', '10:00:00', 30, true),
(gen_random_uuid(), 'doc11111-1111-1111-1111-111111111111', CURRENT_DATE + 1, '14:00:00', '14:30:00', 30, true),

(gen_random_uuid(), 'doc22222-2222-2222-2222-222222222222', CURRENT_DATE, '09:30:00', '10:00:00', 30, true),
(gen_random_uuid(), 'doc22222-2222-2222-2222-222222222222', CURRENT_DATE, '10:30:00', '11:00:00', 30, true),
(gen_random_uuid(), 'doc22222-2222-2222-2222-222222222222', CURRENT_DATE + 1, '11:00:00', '11:30:00', 30, true),
(gen_random_uuid(), 'doc22222-2222-2222-2222-222222222222', CURRENT_DATE + 1, '15:00:00', '15:30:00', 30, true),

(gen_random_uuid(), 'doc33333-3333-3333-3333-333333333333', CURRENT_DATE, '14:00:00', '14:30:00', 30, true),
(gen_random_uuid(), 'doc33333-3333-3333-3333-333333333333', CURRENT_DATE + 1, '10:00:00', '10:30:00', 30, true);

-- 7. APPOINTMENTS (Pre-seeded sample appointments for demo patient Alexander Hayes)
INSERT INTO appointments (id, patient_id, doctor_id, department_id, hospital_id, appointment_date, start_time, end_time, status, reason, notes) VALUES
('apt11111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000001', 'doc11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, '11:00:00', '11:30:00', 'confirmed', 'Routine cardiovascular follow-up and blood pressure monitoring.', 'Please bring previous ECG reports.')
ON CONFLICT (id) DO NOTHING;

-- 8. QUEUE ENTRY FOR THE APPOINTMENT
INSERT INTO queues (id, appointment_id, queue_date, position, patients_ahead, estimated_wait_minutes, status) VALUES
('q1111111-1111-1111-1111-111111111111', 'apt11111-1111-1111-1111-111111111111', CURRENT_DATE, 3, 2, 20, 'waiting')
ON CONFLICT (id) DO NOTHING;

-- 9. DEMO MEDICAL DOCUMENTS
INSERT INTO medical_documents (id, patient_id, appointment_id, document_name, document_type, storage_path, file_size, mime_type, document_date) VALUES
('doc-rep-1111', 'c0000000-0000-0000-0000-000000000001', 'apt11111-1111-1111-1111-111111111111', 'Complete_Blood_Count_Panel.pdf', 'Blood Test', 'demo/cbc_report_2026.pdf', 184320, 'application/pdf', CURRENT_DATE - 7),
('doc-rep-2222', 'c0000000-0000-0000-0000-000000000001', NULL, 'Echocardiogram_Summary.pdf', 'Ultrasound', 'demo/echo_cardio_2026.pdf', 342010, 'application/pdf', CURRENT_DATE - 30)
ON CONFLICT (id) DO NOTHING;

-- 10. DEMO NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, title, message, is_read, related_appointment_id) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'booking_confirmed', 'Appointment Confirmed', 'Your appointment with Dr. Sarah Jenkins (Cardiology) is confirmed for today at 11:00 AM.', false, 'apt11111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'queue_update', 'Live Queue Update', 'You are currently #3 in line. Estimated wait time is approximately 20 minutes.', false, 'apt11111-1111-1111-1111-111111111111');

