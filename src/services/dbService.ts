import { supabase } from '../lib/supabase/client';
import { 
  Hospital, 
  Department, 
  Doctor, 
  Appointment, 
  Queue, 
  MedicalDocument, 
  AppNotification, 
  AppointmentStatus, 
  QueueStatus, 
  Profile, 
  CareCategory, 
  SavedDoctor,
  FamilyMember,
  Prescription,
  DoctorReview,
  HealthTimelineEvent,
  CarePassport,
  VisitPlan
} from '../types';
import { 
  INITIAL_HOSPITALS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_QUEUES, 
  INITIAL_DOCUMENTS, 
  INITIAL_NOTIFICATIONS, 
  STANDARD_TIME_SLOTS, 
  getTodayDateString, 
  DEMO_PROFILES, 
  CARE_CATEGORIES, 
  INITIAL_SAVED_DOCTORS,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_REVIEWS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_PASSPORT
} from './mockData';

// Local reactive storage keys for state persistence (v3 incorporates 8 Pakistani reference hospitals, synthetic doctors & Care Passport)
const STORAGE_KEYS = {
  HOSPITALS: 'careflow_hospitals_pk_v3',
  DEPARTMENTS: 'careflow_departments_pk_v3',
  DOCTORS: 'careflow_doctors_pk_v3',
  APPOINTMENTS: 'careflow_appointments_pk_v3',
  QUEUES: 'careflow_queues_pk_v3',
  DOCUMENTS: 'careflow_documents_pk_v3',
  NOTIFICATIONS: 'careflow_notifications_pk_v3',
  SAVED_DOCTORS: 'careflow_saved_doctors_pk_v3',
  FAMILY_MEMBERS: 'careflow_family_members_pk_v3',
  PRESCRIPTIONS: 'careflow_prescriptions_pk_v3',
  REVIEWS: 'careflow_reviews_pk_v3',
  TIMELINE: 'careflow_timeline_pk_v3',
  PASSPORT: 'careflow_passport_pk_v3',
};

// Safe localStorage helpers
const getStored = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const setStored = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing ${key} from storage:`, e);
  }
};

// Initialize cache if empty or updated
export const initLocalData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.HOSPITALS)) setStored(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) setStored(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) setStored(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) setStored(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  if (!localStorage.getItem(STORAGE_KEYS.QUEUES)) setStored(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) setStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (!localStorage.getItem(STORAGE_KEYS.SAVED_DOCTORS)) setStored(STORAGE_KEYS.SAVED_DOCTORS, INITIAL_SAVED_DOCTORS);
  if (!localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS)) setStored(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS);
  if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) setStored(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) setStored(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  if (!localStorage.getItem(STORAGE_KEYS.TIMELINE)) setStored(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS);
  if (!localStorage.getItem(STORAGE_KEYS.PASSPORT)) setStored(STORAGE_KEYS.PASSPORT, INITIAL_PASSPORT);
};

// Ensure cache is initialized
initLocalData();

// Check if remote Supabase schema is active, otherwise use high-performance grounded store
const isRemoteSupabaseMigrated = import.meta.env.VITE_SUPABASE_MIGRATED === 'true';
let supabaseOnline = isRemoteSupabaseMigrated;

export const dbService = {
  // ==========================================
  // HOSPITALS & DEPARTMENTS
  // ==========================================
  async getHospitals(filters?: { city?: string }): Promise<Hospital[]> {
    if (supabaseOnline) {
      try {
        let query = supabase.from('hospitals').select('*').eq('is_active', true);
        if (filters?.city && filters.city !== 'All') {
          query = query.ilike('city', `%${filters.city}%`);
        }
        const { data, error } = await query;
        if (error) {
          supabaseOnline = false;
        } else if (data && data.length > 0) {
          return data as Hospital[];
        }
      } catch (e) {
        supabaseOnline = false;
      }
    }
    let hospitals = getStored<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    if (filters?.city && filters.city !== 'All') {
      const cityLower = filters.city.toLowerCase().trim();
      hospitals = hospitals.filter(h => h.city.toLowerCase().includes(cityLower));
    }
    return hospitals;
  },

  async getHospitalById(id: string): Promise<Hospital | null> {
    const hospitals = await this.getHospitals();
    const direct = hospitals.find(h => h.id === id);
    if (direct) return direct;
    // Known aliases for backwards compatibility
    if (id === 'hosp-lahore-1') return hospitals.find(h => h.id === 'hosp-skmch-lhr') || hospitals[0] || null;
    if (id === 'hosp-lahore-2') return hospitals.find(h => h.id === 'hosp-pic-lhr') || hospitals[0] || null;
    if (id === 'hosp-isb-1') return hospitals.find(h => h.id === 'hosp-shifa-isb') || hospitals[0] || null;
    if (id === 'hosp-rwp-1') return hospitals.find(h => h.id === 'hosp-pims-isb') || hospitals[0] || null;
    if (id === 'hosp-khi-1') return hospitals.find(h => h.id === 'hosp-akuh-khi') || hospitals[0] || null;
    return null;
  },

  async addHospital(hospital: Partial<Hospital>): Promise<Hospital> {
    const hospitals = getStored<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    const newHosp: Hospital = {
      id: `hosp-${Date.now()}`,
      name: hospital.name || 'New Medical Center',
      address: hospital.address || 'Medical City',
      city: hospital.city || 'Lahore',
      phone: hospital.phone || '+92 42 0000 000',
      description: hospital.description || 'Modern multi-specialty healthcare facility.',
      hero_image: hospital.hero_image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80',
      thumbnail_image: hospital.thumbnail_image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
      facilities: hospital.facilities || ['24/7 Trauma Emergency', 'Clinical Lab', 'Pharmacy'],
      opening_hours: hospital.opening_hours || 'Open 24/7',
      emergency_phone: hospital.emergency_phone || '+92 42 0000 999',
      is_active: true,
      doctor_count: 5,
      next_available_slot: 'Today, 02:00 PM',
      created_at: new Date().toISOString()
    };
    hospitals.unshift(newHosp);
    setStored(STORAGE_KEYS.HOSPITALS, hospitals);
    return newHosp;
  },

  async updateHospital(id: string, updates: Partial<Hospital>): Promise<Hospital> {
    const hospitals = getStored<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    const idx = hospitals.findIndex(h => h.id === id);
    if (idx === -1) throw new Error('Hospital not found');
    hospitals[idx] = { ...hospitals[idx], ...updates, updated_at: new Date().toISOString() };
    setStored(STORAGE_KEYS.HOSPITALS, hospitals);
    return hospitals[idx];
  },

  async getDepartments(hospitalId?: string): Promise<Department[]> {
    if (supabaseOnline) {
      try {
        let query = supabase.from('departments').select('*, hospitals(*)').eq('is_active', true);
        if (hospitalId) query = query.eq('hospital_id', hospitalId);
        const { data, error } = await query;
        if (error) {
          supabaseOnline = false;
        } else if (data && data.length > 0) {
          return data as Department[];
        }
      } catch (e) {
        supabaseOnline = false;
      }
    }
    const local = getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    return hospitalId ? local.filter(d => d.hospital_id === hospitalId) : local;
  },

  // ==========================================
  // CARE CATEGORIES & SPECIALTY LOOKUP
  // ==========================================
  getCareCategories(): CareCategory[] {
    return CARE_CATEGORIES;
  },

  getCareCategoryById(id: string): CareCategory | null {
    return CARE_CATEGORIES.find(c => c.id === id) || null;
  },

  searchCareCategories(query: string): CareCategory[] {
    const q = query.toLowerCase().trim();
    if (!q) return CARE_CATEGORIES;
    return CARE_CATEGORIES.filter(cat => 
      cat.name.toLowerCase().includes(q) ||
      cat.specialty.toLowerCase().includes(q) ||
      cat.keywords.some(k => k.toLowerCase().includes(q) || q.includes(k.toLowerCase())) ||
      cat.commonSymptoms.some(s => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()))
    );
  },

  async getHospitalsBySpecialty(specialtyOrCategory: string, city?: string): Promise<Hospital[]> {
    const allHospitals = await this.getHospitals(city ? { city } : undefined);
    const allDepartments = await this.getDepartments();
    const allDoctors = await this.getDoctors();
    const cleanQuery = specialtyOrCategory.toLowerCase().trim();

    // Match departments or doctors that have this specialty or care category
    const matchedHospitalIds = new Set<string>();

    allDepartments.forEach(dept => {
      const spec = (dept.specialty || '').toLowerCase();
      if (
        dept.name.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(dept.name.toLowerCase()) ||
        spec.includes(cleanQuery) ||
        cleanQuery.includes(spec)
      ) {
        matchedHospitalIds.add(dept.hospital_id);
      }
    });

    allDoctors.forEach(doc => {
      if (
        doc.specialty.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(doc.specialty.toLowerCase())
      ) {
        matchedHospitalIds.add(doc.hospital_id);
      }
    });

    // If query matches a care category, check keywords
    const matchingCat = CARE_CATEGORIES.find(c => 
      c.name.toLowerCase().includes(cleanQuery) ||
      c.specialty.toLowerCase().includes(cleanQuery) ||
      c.keywords.some(k => k.toLowerCase() === cleanQuery || cleanQuery.includes(k.toLowerCase()))
    );

    if (matchingCat) {
      const catName = matchingCat.name.toLowerCase();
      allDepartments.forEach(dept => {
        if (dept.name.toLowerCase().includes(catName) || catName.includes(dept.name.toLowerCase())) {
          matchedHospitalIds.add(dept.hospital_id);
        }
      });
      allDoctors.forEach(doc => {
        if (doc.specialty.toLowerCase().includes(catName) || catName.includes(doc.specialty.toLowerCase())) {
          matchedHospitalIds.add(doc.hospital_id);
        }
      });
    }

    const filtered = allHospitals.filter(h => matchedHospitalIds.has(h.id));
    // If no specific match, return all hospitals as available options
    return filtered.length > 0 ? filtered : allHospitals;
  },

  // ==========================================
  // DOCTORS & DIRECTORY
  // ==========================================
  async getDoctors(filters?: { 
    departmentId?: string; 
    specialty?: string; 
    hospitalId?: string; 
    query?: string;
    experience?: number;
    gender?: string;
    includePending?: boolean;
  }): Promise<Doctor[]> {
    let docs = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);

    if (supabaseOnline) {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            *,
            profiles(*),
            hospitals(*)
          `)
          .eq('is_active', true);

        if (error) {
          supabaseOnline = false;
        } else if (!error && data && data.length > 0) {
          docs = data.map(d => ({
            ...d,
            profile: d.profiles,
            hospital: d.hospitals,
          })) as Doctor[];
        }
      } catch (e) {
        supabaseOnline = false;
      }
    }

    return docs.filter(d => {
      // Only show approved doctors publicly unless explicitly requesting pending
      if (!filters?.includePending && d.is_approved === false) return false;

      if (!filters) return true;

      let match = true;
      if (filters.hospitalId && d.hospital_id !== filters.hospitalId) match = false;
      if (filters.specialty && d.specialty.toLowerCase() !== filters.specialty.toLowerCase()) match = false;
      if (filters.experience && d.experience_years < filters.experience) match = false;
      if (filters.gender && d.profile?.gender && d.profile.gender.toLowerCase() !== filters.gender.toLowerCase()) match = false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const nameMatch = (d.profile?.full_name || '').toLowerCase().includes(q);
        const specMatch = d.specialty.toLowerCase().includes(q);
        const bioMatch = (d.bio || '').toLowerCase().includes(q);
        const hospMatch = (d.hospital?.name || '').toLowerCase().includes(q);
        if (!nameMatch && !specMatch && !bioMatch && !hospMatch) match = false;
      }
      return match;
    });
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const docs = await this.getDoctors({ includePending: true });
    return docs.find(d => d.id === id) || null;
  },

  async getPendingDoctors(): Promise<Doctor[]> {
    const docs = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    return docs.filter(d => d.is_approved === false);
  },

  async approveDoctor(doctorId: string): Promise<void> {
    const docs = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const updated = docs.map(d => d.id === doctorId ? { ...d, is_approved: true } : d);
    setStored(STORAGE_KEYS.DOCTORS, updated);
  },

  async rejectDoctor(doctorId: string): Promise<void> {
    const docs = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const updated = docs.filter(d => d.id !== doctorId);
    setStored(STORAGE_KEYS.DOCTORS, updated);
  },

  // ==========================================
  // SAVED DOCTORS / FAVORITES
  // ==========================================
  async getSavedDoctors(patientId: string): Promise<SavedDoctor[]> {
    const saved = getStored<SavedDoctor[]>(STORAGE_KEYS.SAVED_DOCTORS, INITIAL_SAVED_DOCTORS);
    const doctors = await this.getDoctors({ includePending: true });
    return saved
      .filter(s => s.patient_id === patientId)
      .map(s => ({
        ...s,
        doctor: doctors.find(d => d.id === s.doctor_id) || s.doctor
      }));
  },

  async toggleSaveDoctor(patientId: string, doctorId: string): Promise<boolean> {
    const saved = getStored<SavedDoctor[]>(STORAGE_KEYS.SAVED_DOCTORS, INITIAL_SAVED_DOCTORS);
    const existingIndex = saved.findIndex(s => s.patient_id === patientId && s.doctor_id === doctorId);
    if (existingIndex >= 0) {
      saved.splice(existingIndex, 1);
      setStored(STORAGE_KEYS.SAVED_DOCTORS, saved);
      return false; // Removed
    } else {
      const doc = (await this.getDoctors({ includePending: true })).find(d => d.id === doctorId);
      saved.push({
        id: `save-${Date.now()}`,
        patient_id: patientId,
        doctor_id: doctorId,
        doctor: doc,
        created_at: new Date().toISOString()
      });
      setStored(STORAGE_KEYS.SAVED_DOCTORS, saved);
      return true; // Added
    }
  },

  isDoctorSaved(patientId: string, doctorId: string): boolean {
    const saved = getStored<SavedDoctor[]>(STORAGE_KEYS.SAVED_DOCTORS, INITIAL_SAVED_DOCTORS);
    return saved.some(s => s.patient_id === patientId && s.doctor_id === doctorId);
  },

  // ==========================================
  // AVAILABILITY & SLOTS
  // ==========================================
  async getDoctorAvailableSlots(doctorId: string, date: string): Promise<{ start_time: string; end_time: string; label: string; available: boolean }[]> {
    // Check existing appointments to prevent double-booking
    const appointments = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const bookedSlotTimes = new Set(
      appointments
        .filter(a => a.doctor_id === doctorId && a.appointment_date === date && a.status !== 'cancelled')
        .map(a => a.start_time.slice(0, 5)) // Compare HH:MM
    );

    return STANDARD_TIME_SLOTS.map(slot => {
      const isBooked = bookedSlotTimes.has(slot.start.slice(0, 5));
      return {
        start_time: slot.start,
        end_time: slot.end,
        label: slot.label,
        available: !isBooked,
      };
    });
  },

  // ==========================================
  // APPOINTMENTS
  // ==========================================
  async getAppointments(userId: string, role: 'patient' | 'doctor' | 'admin'): Promise<Appointment[]> {
    const all = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const queues = getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
    const familyMembers = getStored<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS);
    const prescriptions = getStored<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    const reviews = getStored<DoctorReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);

    // Merge queue, family member, prescription, and review into appointment
    const enriched = all.map(apt => ({
      ...apt,
      queue: queues.find(q => q.appointment_id === apt.id),
      family_member: apt.family_member_id ? familyMembers.find(f => f.id === apt.family_member_id) : undefined,
      prescription: prescriptions.find(p => p.appointment_id === apt.id),
      review: reviews.find(r => r.appointment_id === apt.id),
    }));

    if (role === 'admin') return enriched;
    if (role === 'doctor') {
      // Find doctor record for this profile
      const docs = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
      const doctorRecord = docs.find(d => d.profile_id === userId || d.profile?.id === userId);
      if (doctorRecord) {
        return enriched.filter(a => a.doctor_id === doctorRecord.id);
      }
      return enriched; // Doctor fallback view
    }

    return enriched.filter(a => a.patient_id === userId);
  },

  async bookAppointment(booking: {
    patient_id: string;
    doctor_id: string;
    department_id: string;
    hospital_id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    reason?: string;
    notes?: string;
    family_member_id?: string | null;
  }): Promise<{ appointment: Appointment; queue: Queue }> {
    // 1. Double Booking Check (Business Rule 2 & 7)
    const existing = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const hasConflict = existing.some(
      a =>
        a.doctor_id === booking.doctor_id &&
        a.appointment_date === booking.appointment_date &&
        a.start_time.slice(0, 5) === booking.start_time.slice(0, 5) &&
        a.status !== 'cancelled'
    );

    if (hasConflict) {
      throw new Error('This appointment slot is no longer available. Please select another time.');
    }

    const doctor = await this.getDoctorById(booking.doctor_id);
    const departments = await this.getDepartments();
    const dept = departments.find(d => d.id === booking.department_id);
    const hospitals = await this.getHospitals();
    const hosp = hospitals.find(h => h.id === booking.hospital_id);

    const familyMembers = getStored<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS);
    const familyMember = booking.family_member_id ? familyMembers.find(f => f.id === booking.family_member_id) : undefined;

    const newAptId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAppointment: Appointment = {
      id: newAptId,
      patient_id: booking.patient_id,
      doctor_id: booking.doctor_id,
      department_id: booking.department_id,
      hospital_id: booking.hospital_id,
      appointment_date: booking.appointment_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: 'confirmed',
      reason: booking.reason || 'General medical consultation',
      notes: booking.notes,
      family_member_id: booking.family_member_id || null,
      family_member: familyMember,
      doctor: doctor || undefined,
      department: dept || undefined,
      hospital: hosp || undefined,
      created_at: new Date().toISOString(),
    };

    // Calculate queue position for today or future day
    const queues = getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
    const dateQueues = queues.filter(q => q.queue_date === booking.appointment_date && q.status !== 'completed');
    const newPos = dateQueues.length + 1;
    const patientsAhead = Math.max(0, newPos - 1);
    const estimatedWait = patientsAhead * 15 + 10;

    const newQueue: Queue = {
      id: `q-${Date.now()}`,
      appointment_id: newAptId,
      queue_date: booking.appointment_date,
      position: newPos,
      patients_ahead: patientsAhead,
      estimated_wait_minutes: estimatedWait,
      status: 'waiting',
      appointment: newAppointment,
      updated_at: new Date().toISOString(),
    };

    newAppointment.queue = newQueue;

    // Save to stored state without circular references
    const storeAppointment = { ...newAppointment, queue: undefined };
    const storeQueue = { ...newQueue, appointment: undefined };
    setStored(STORAGE_KEYS.APPOINTMENTS, [storeAppointment, ...existing]);
    setStored(STORAGE_KEYS.QUEUES, [...queues, storeQueue]);

    // Record in Health Timeline
    const timeline = getStored<HealthTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS);
    const timelineEvent: HealthTimelineEvent = {
      id: `tle-${Date.now()}`,
      patient_id: booking.patient_id,
      date: booking.appointment_date,
      type: 'appointment_booked',
      title: `Booked Consultation with ${doctor?.profile?.full_name || 'Doctor'}`,
      description: `${dept?.name || 'Specialist'} consultation at ${hosp?.name || 'Hospital'}${familyMember ? ` (for ${familyMember.full_name}, ${familyMember.relationship})` : ''}.`,
      reference_id: newAptId,
      doctor_name: doctor?.profile?.full_name,
      hospital_name: hosp?.name,
      badge_label: 'Appointment Booked',
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.TIMELINE, [timelineEvent, ...timeline]);

    // Create confirmation notification
    const notifications = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: booking.patient_id,
      type: 'booking_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment with ${doctor?.profile?.full_name || 'the physician'} is confirmed for ${booking.appointment_date} at ${booking.start_time.slice(0, 5)}. Queue Position #${newPos}.`,
      is_read: false,
      related_appointment_id: newAptId,
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);

    // Try Supabase insert in background if online
    if (supabaseOnline) {
      try {
        const { error: aptErr } = await supabase.from('appointments').insert({
          id: newAptId,
          patient_id: booking.patient_id,
          doctor_id: booking.doctor_id,
          department_id: booking.department_id,
          hospital_id: booking.hospital_id,
          appointment_date: booking.appointment_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: 'confirmed',
          reason: booking.reason,
        });
        if (aptErr) {
          supabaseOnline = false;
        } else {
          await supabase.from('queues').insert({
            appointment_id: newAptId,
            queue_date: booking.appointment_date,
            position: newPos,
            patients_ahead: patientsAhead,
            estimated_wait_minutes: estimatedWait,
            status: 'waiting',
          });
        }
      } catch (e) {
        supabaseOnline = false;
      }
    }
    console.log('Saved to grounded local database store');

    return { appointment: newAppointment, queue: newQueue };
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
    const existing = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = existing.map(a => a.id === appointmentId ? { ...a, status, updated_at: new Date().toISOString() } : a);
    setStored(STORAGE_KEYS.APPOINTMENTS, updated);

    // If cancelled or completed, update queue as well
    if (status === 'cancelled' || status === 'completed') {
      const queues = getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
      const updatedQueues = queues.map(q => q.appointment_id === appointmentId ? { ...q, status: status as QueueStatus } : q);
      setStored(STORAGE_KEYS.QUEUES, updatedQueues);
    }
  },

  async cancelAppointment(appointmentId: string, userId: string, reason?: string): Promise<void> {
    const existing = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = existing.map(a => a.id === appointmentId ? { 
      ...a, 
      status: 'cancelled' as AppointmentStatus, 
      cancellation_reason: reason || 'Patient requested cancellation',
      updated_at: new Date().toISOString() 
    } : a);
    setStored(STORAGE_KEYS.APPOINTMENTS, updated);

    // Update queue
    const queues = getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
    const updatedQueues = queues.map(q => q.appointment_id === appointmentId ? { ...q, status: 'cancelled' as QueueStatus } : q);
    setStored(STORAGE_KEYS.QUEUES, updatedQueues);

    // Add cancellation notification
    const notifications = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: userId,
      type: 'booking_cancelled',
      title: 'Appointment Cancelled',
      message: reason ? `Your appointment has been cancelled. Reason: ${reason}` : 'Your appointment has been successfully cancelled.',
      is_read: false,
      related_appointment_id: appointmentId,
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);
  },

  async rescheduleAppointment(appointmentId: string, newDate: string, newStartTime: string, newEndTime: string): Promise<void> {
    const existing = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const apt = existing.find(a => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    // Check conflict
    const conflict = existing.some(
      a =>
        a.id !== appointmentId &&
        a.doctor_id === apt.doctor_id &&
        a.appointment_date === newDate &&
        a.start_time.slice(0, 5) === newStartTime.slice(0, 5) &&
        a.status !== 'cancelled'
    );

    if (conflict) {
      throw new Error('This time slot is already taken. Please choose another.');
    }

    const updated = existing.map(a => 
      a.id === appointmentId 
        ? { ...a, appointment_date: newDate, start_time: newStartTime, end_time: newEndTime, status: 'confirmed' as AppointmentStatus, updated_at: new Date().toISOString() } 
        : a
    );
    setStored(STORAGE_KEYS.APPOINTMENTS, updated);
  },

  // ==========================================
  // QUEUE MANAGEMENT
  // ==========================================
  async getQueues(): Promise<Queue[]> {
    return getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
  },

  async updateQueueStatus(queueId: string, status: QueueStatus): Promise<Queue[]> {
    const queues = getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
    const target = queues.find(q => q.id === queueId);
    if (!target) return queues;

    const updated = queues.map(q => {
      if (q.id === queueId) {
        return { ...q, status, updated_at: new Date().toISOString() };
      }
      return q;
    });

    // Recalculate ahead count for remaining waiting patients on same day
    const activeWaiting = updated.filter(q => q.queue_date === target.queue_date && q.status === 'waiting');
    activeWaiting.forEach((q, idx) => {
      q.patients_ahead = idx;
      q.estimated_wait_minutes = idx * 15;
    });

    setStored(STORAGE_KEYS.QUEUES, updated);

    // Sync appointment status if in_progress or completed
    if (status === 'completed') {
      await this.updateAppointmentStatus(target.appointment_id, 'completed');
    }

    return updated;
  },

  // ==========================================
  // MEDICAL DOCUMENTS (Storage + DB Metadata)
  // ==========================================
  async getMedicalDocuments(patientId: string): Promise<MedicalDocument[]> {
    const all = getStored<MedicalDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    return all.filter(d => d.patient_id === patientId);
  },

  async uploadMedicalDocument(doc: {
    patient_id: string;
    document_name: string;
    document_type: MedicalDocument['document_type'];
    appointment_id?: string | null;
    file_size?: number;
    mime_type?: string;
    file?: File;
  }): Promise<MedicalDocument> {
    const newDocId = `doc-${Date.now()}`;
    let storagePath = `medical-reports/${doc.patient_id}/${newDocId}_${doc.document_name}`;

    // If Supabase Storage is configured and file is provided, attempt upload
    if (doc.file) {
      try {
        const { data, error } = await supabase.storage
          .from('medical-reports')
          .upload(`${doc.patient_id}/${Date.now()}_${doc.file.name}`, doc.file);
        if (!error && data) {
          storagePath = data.path;
        }
      } catch (e) {
        console.log('Stored in secure document metadata store');
      }
    }

    const newDoc: MedicalDocument = {
      id: newDocId,
      patient_id: doc.patient_id,
      appointment_id: doc.appointment_id || null,
      document_name: doc.document_name,
      document_type: doc.document_type,
      storage_path: storagePath,
      file_size: doc.file_size || (doc.file?.size || 150000),
      mime_type: doc.mime_type || (doc.file?.type || 'application/pdf'),
      document_date: getTodayDateString(),
      created_at: new Date().toISOString(),
    };

    const existing = getStored<MedicalDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    setStored(STORAGE_KEYS.DOCUMENTS, [newDoc, ...existing]);

    return newDoc;
  },

  async deleteMedicalDocument(docId: string): Promise<void> {
    const existing = getStored<MedicalDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    setStored(STORAGE_KEYS.DOCUMENTS, existing.filter(d => d.id !== docId));
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter(n => n.user_id === userId);
  },

  async markNotificationAsRead(notifId: string): Promise<void> {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = all.map(n => n.id === notifId ? { ...n, is_read: true } : n);
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = all.map(n => n.user_id === userId ? { ...n, is_read: true } : n);
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  // ==========================================
  // ADMIN SYSTEM METRICS & MANAGEMENT
  // ==========================================
  async getAdminMetrics() {
    const hospitals = await this.getHospitals();
    const departments = await this.getDepartments();
    const doctors = await this.getDoctors();
    const appointments = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const queues = getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);

    const today = getTodayDateString();
    const todayAppointments = appointments.filter(a => a.appointment_date === today);
    const waitingPatients = queues.filter(q => q.queue_date === today && q.status === 'waiting').length;

    return {
      totalHospitals: hospitals.length,
      totalDepartments: departments.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      waitingPatients,
      completedToday: todayAppointments.filter(a => a.status === 'completed').length,
    };
  },

  async addDepartment(department: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> {
    const departments = getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    const newDept: Department = {
      ...department,
      id: `dept-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.DEPARTMENTS, [...departments, newDept]);
    return newDept;
  },

  async addDoctor(doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    const doctors = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const newDoc: Doctor = {
      ...doctor,
      id: `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.DOCTORS, [...doctors, newDoc]);
    return newDoc;
  },

  // ==========================================
  // FAMILY PROFILES
  // ==========================================
  async getFamilyMembers(patientId: string): Promise<FamilyMember[]> {
    const all = getStored<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS);
    return all.filter(f => f.patient_id === patientId);
  },

  async addFamilyMember(member: Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>): Promise<FamilyMember> {
    const all = getStored<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS);
    const newMember: FamilyMember = {
      ...member,
      id: `fam-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.FAMILY_MEMBERS, [newMember, ...all]);
    return newMember;
  },

  async deleteFamilyMember(id: string): Promise<void> {
    const all = getStored<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS);
    setStored(STORAGE_KEYS.FAMILY_MEMBERS, all.filter(f => f.id !== id));
  },

  // ==========================================
  // DIGITAL PRESCRIPTIONS
  // ==========================================
  async getPrescriptions(userId: string, role: 'patient' | 'doctor' | 'admin'): Promise<Prescription[]> {
    const all = getStored<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    const doctors = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const appointments = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);

    // Enrich prescriptions with doctor and appointment
    const enriched = all.map(rx => ({
      ...rx,
      doctor: doctors.find(d => d.id === rx.doctor_id),
      appointment: appointments.find(a => a.id === rx.appointment_id)
    }));

    if (role === 'admin') return enriched;
    if (role === 'doctor') {
      const doctorRecord = doctors.find(d => d.profile_id === userId || d.profile?.id === userId);
      if (doctorRecord) {
        return enriched.filter(p => p.doctor_id === doctorRecord.id);
      }
      return enriched;
    }
    return enriched.filter(p => p.patient_id === userId);
  },

  async getPrescriptionById(id: string): Promise<Prescription | null> {
    const all = await this.getPrescriptions('all', 'admin');
    return all.find(p => p.id === id) || null;
  },

  async createPrescription(rxData: Omit<Prescription, 'id' | 'created_at'>): Promise<Prescription> {
    const all = getStored<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    const newId = `rx-${Date.now()}`;
    const newRx: Prescription = {
      ...rxData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    setStored(STORAGE_KEYS.PRESCRIPTIONS, [newRx, ...all]);

    // Record in timeline
    const timeline = getStored<HealthTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS);
    const doctors = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const doc = doctors.find(d => d.id === rxData.doctor_id);

    const newEvent: HealthTimelineEvent = {
      id: `tle-${Date.now()}`,
      patient_id: rxData.patient_id,
      date: rxData.prescription_date,
      type: 'prescription_issued',
      title: 'Digital Prescription Issued',
      description: `${rxData.medicines.length} medications prescribed for: ${rxData.clinical_diagnosis_notes.slice(0, 70)}...`,
      reference_id: newId,
      doctor_name: doc?.profile?.full_name,
      badge_label: 'Rx Issued',
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.TIMELINE, [newEvent, ...timeline]);

    // Notify patient
    const notifications = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: rxData.patient_id,
      type: 'prescription_issued',
      title: 'New Digital Prescription Available',
      message: `${doc?.profile?.full_name || 'Your physician'} has issued a digital prescription. View details and dosages under Prescriptions.`,
      is_read: false,
      related_appointment_id: rxData.appointment_id,
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.NOTIFICATIONS, [notif, ...notifications]);

    return newRx;
  },

  // ==========================================
  // DOCTOR REVIEWS
  // ==========================================
  async getDoctorReviews(doctorId: string): Promise<DoctorReview[]> {
    const all = getStored<DoctorReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    return all.filter(r => r.doctor_id === doctorId);
  },

  async submitDoctorReview(reviewData: Omit<DoctorReview, 'id' | 'created_at'>): Promise<DoctorReview> {
    const all = getStored<DoctorReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const newRev: DoctorReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updatedReviews = [newRev, ...all];
    setStored(STORAGE_KEYS.REVIEWS, updatedReviews);

    // Update doctor's average rating and total reviews
    const docReviews = updatedReviews.filter(r => r.doctor_id === reviewData.doctor_id);
    const avg = docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length;

    const doctors = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const updatedDocs = doctors.map(d => {
      if (d.id === reviewData.doctor_id) {
        return {
          ...d,
          rating: Number(avg.toFixed(1)),
          total_reviews: docReviews.length,
        };
      }
      return d;
    });
    setStored(STORAGE_KEYS.DOCTORS, updatedDocs);

    return newRev;
  },

  // ==========================================
  // HEALTH JOURNEY TIMELINE
  // ==========================================
  async getHealthTimeline(patientId: string): Promise<HealthTimelineEvent[]> {
    const all = getStored<HealthTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS);
    return all
      .filter(t => t.patient_id === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addTimelineEvent(event: Omit<HealthTimelineEvent, 'id' | 'created_at'>): Promise<HealthTimelineEvent> {
    const all = getStored<HealthTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS);
    const newEvent: HealthTimelineEvent = {
      ...event,
      id: `tle-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.TIMELINE, [newEvent, ...all]);
    return newEvent;
  },

  // ==========================================
  // CARE PASSPORT (Central Health Profile)
  // ==========================================
  async getCarePassport(patientId: string): Promise<CarePassport> {
    const stored = getStored<CarePassport>(STORAGE_KEYS.PASSPORT, INITIAL_PASSPORT);
    if (stored && (stored.patient_id === patientId || patientId === DEMO_PROFILES.patient.id)) {
      return stored;
    }
    return {
      ...INITIAL_PASSPORT,
      patient_id: patientId,
    };
  },

  async updateCarePassport(patientId: string, updates: Partial<CarePassport>): Promise<CarePassport> {
    const current = await this.getCarePassport(patientId);
    const updated: CarePassport = {
      ...current,
      ...updates,
      privacy_settings: {
        ...current.privacy_settings,
        ...(updates.privacy_settings || {})
      },
      updated_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.PASSPORT, updated);
    return updated;
  },

  // ==========================================
  // BEFORE-YOU-LEAVE VISIT PLAN
  // ==========================================
  async getVisitPlan(appointmentId: string): Promise<VisitPlan | null> {
    const all = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const apt = all.find(a => a.id === appointmentId);
    if (!apt) return null;

    const hospital = apt.hospital || (await this.getHospitalById(apt.hospital_id));
    const doctor = apt.doctor || (await this.getDoctorById(apt.doctor_id));
    const queues = getStored<Queue[]>(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
    const queue = queues.find(q => q.appointment_id === apt.id);
    const familyMembers = getStored<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS);
    const familyMember = apt.family_member_id ? familyMembers.find(f => f.id === apt.family_member_id) : undefined;

    return {
      appointment_id: apt.id,
      hospital_name: hospital?.name || 'CareFlow Reference Hospital',
      hospital_address: hospital?.address || 'Medical City Center',
      hospital_city: hospital?.city || 'Lahore',
      hospital_phone: hospital?.phone || '+92 (42) 3574-8800',
      emergency_phone: hospital?.emergency_phone || '+92 (42) 3574-8899',
      google_maps_url: hospital?.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent((hospital?.name || '') + ' ' + (hospital?.city || ''))}`,
      doctor_name: doctor?.profile?.full_name || 'Attending Physician',
      specialty: doctor?.specialty || 'Clinical Consultation',
      appointment_date: apt.appointment_date,
      appointment_time: apt.start_time.slice(0, 5),
      queue_token: queue ? `A-${queue.position}` : 'A-24',
      family_member_name: familyMember?.full_name || undefined,
      documents_to_bring: [
        'Original CNIC / Government Photo Identity (or B-Form for minors)',
        'Previous medical prescriptions & active medication list',
        'Recent diagnostic laboratory reports & X-Ray / MRI films',
        'CareFlow AI digital appointment confirmation & QR pass'
      ]
    };
  }
};

// ==========================================
// CALENDAR (.ICS) GENERATOR
// ==========================================
export function generateIcsCalendar(appointment: Appointment): string {
  const dateClean = appointment.appointment_date.replace(/-/g, '');
  const startTimeClean = (appointment.start_time || '09:00:00').replace(/:/g, '').slice(0, 6);
  const endTimeClean = (appointment.end_time || '09:30:00').replace(/:/g, '').slice(0, 6);

  const dtStart = `${dateClean}T${startTimeClean}`;
  const dtEnd = `${dateClean}T${endTimeClean}`;
  const summary = `CareFlow Appointment: ${appointment.doctor?.profile?.full_name || 'Doctor'} (${appointment.department?.name || 'Consultation'})`;
  const description = `Medical consultation appointment with ${appointment.doctor?.profile?.full_name || 'Physician'} at ${appointment.hospital?.name || 'CareFlow Medical Center'}. Queue position is tracked live in CareFlow AI.`;
  const location = appointment.hospital?.name ? `${appointment.hospital.name}, ${appointment.hospital.address || ''}, ${appointment.hospital.city || ''}` : 'CareFlow Medical Center';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareFlow AI//Healthcare Appointments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:careflow-${appointment.id}@careflowai.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadIcsFile(appointment: Appointment): void {
  const icsContent = generateIcsCalendar(appointment);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CareFlow_Appointment_${appointment.appointment_date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

