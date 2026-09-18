import { evaluateEmergencySafety } from './emergencyRules';
import { dbService } from './dbService';
import { AiMessage, Doctor, Department, AiCareSearchResult, Hospital } from '../types';
import { CARE_CATEGORIES } from './mockData';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let geminiAvailable = !!GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIzaSy');

interface NavigationIntent {
  intent: 'emergency' | 'recommend_department' | 'find_doctor' | 'view_appointment' | 'view_queue' | 'view_reports' | 'general_help';
  departmentName?: string;
  doctorName?: string;
  explanation: string;
}

// System prompt enforcing grounding & non-diagnostic boundaries
const SYSTEM_PROMPT = `
You are CareFlow AI, a specialized Hospital Patient Navigation Assistant.
Your sole job is to help patients understand hospital departments, navigate care pathways, and connect with real hospital doctors and appointments.

CRITICAL MEDICAL & SAFETY RULES:
1. You are NOT a doctor. You MUST NEVER diagnose diseases, suggest specific medical conditions, prescribe drugs, or claim medical certainty.
2. If the user mentions severe red-flag emergency symptoms (chest pain, stroke signs, difficulty breathing, profuse bleeding), immediate emergency warnings will take precedence.
3. For non-emergencies, recommend the appropriate hospital department (e.g., Dermatology for skin issues, Orthopedics for joint issues, Cardiology for heart health, etc.) based solely on the hospital's available departments.
4. ONLY reference real doctors, departments, and slots provided in the database context. NEVER hallucinate or invent fake names, clinics, or times.
5. Always answer calmly, empathetically, clearly, and concisely, ending with actionable navigation advice.
`;

export const aiService = {
  // ==========================================
  // LANDING PAGE AI CARE PATHWAY SEARCH
  // ==========================================
  async searchCarePathway(query: string): Promise<AiCareSearchResult> {
    const trimmed = query.trim();
    const lowerTrimmed = trimmed.toLowerCase();

    // Detect language
    const isUrduScript = /[\u0600-\u06FF]/.test(trimmed);
    const romanUrduKeywords = ['dard', 'kamar', 'sar', 'dil', 'jild', 'pait', 'haddi', 'bacha', 'bache', 'aankh', 'daant', 'gala', 'kaan', 'naak', 'saans', 'bukhar', 'kamzori', 'sugar', 'gurday', 'peshab', 'chakkar', 'khansi', 'dast', 'tabiat', 'chahiye', 'mein', 'mera', 'meri', 'mere'];
    const hasRomanUrdu = romanUrduKeywords.some(kw => lowerTrimmed.includes(kw));

    let detectedLanguage: 'English' | 'Urdu' | 'Roman Urdu' = 'English';
    if (isUrduScript) detectedLanguage = 'Urdu';
    else if (hasRomanUrdu) detectedLanguage = 'Roman Urdu';

    // 1. EXTRACT PAKISTANI CITY
    let extractedCity: string | undefined = undefined;
    if (lowerTrimmed.includes('lahore')) extractedCity = 'Lahore';
    else if (lowerTrimmed.includes('islamabad') || lowerTrimmed.includes('isb')) extractedCity = 'Islamabad';
    else if (lowerTrimmed.includes('karachi') || lowerTrimmed.includes('khi')) extractedCity = 'Karachi';
    else if (lowerTrimmed.includes('rawalpindi') || lowerTrimmed.includes('pindi') || lowerTrimmed.includes('rwp')) extractedCity = 'Rawalpindi';
    else if (lowerTrimmed.includes('peshawar')) extractedCity = 'Peshawar';
    else if (lowerTrimmed.includes('multan')) extractedCity = 'Multan';
    else if (lowerTrimmed.includes('faisalabad')) extractedCity = 'Faisalabad';

    // 2. EXTRACT DATE INTENT
    let extractedDate: string | undefined = undefined;
    if (lowerTrimmed.includes('tomorrow') || lowerTrimmed.includes('kal')) extractedDate = 'Tomorrow';
    else if (lowerTrimmed.includes('today') || lowerTrimmed.includes('aaj')) extractedDate = 'Today';
    else if (lowerTrimmed.includes('monday') || lowerTrimmed.includes('somwar') || lowerTrimmed.includes('pir')) extractedDate = 'Monday';
    else if (lowerTrimmed.includes('tuesday') || lowerTrimmed.includes('mangal')) extractedDate = 'Tuesday';
    else if (lowerTrimmed.includes('wednesday') || lowerTrimmed.includes('budh')) extractedDate = 'Wednesday';
    else if (lowerTrimmed.includes('thursday') || lowerTrimmed.includes('jumeraat')) extractedDate = 'Thursday';
    else if (lowerTrimmed.includes('friday') || lowerTrimmed.includes('jumma')) extractedDate = 'Friday';
    else if (lowerTrimmed.includes('saturday') || lowerTrimmed.includes('hafta')) extractedDate = 'Saturday';
    else if (lowerTrimmed.includes('sunday') || lowerTrimmed.includes('itwar')) extractedDate = 'Sunday';

    // 3. EXTRACT TIME INTENT
    let extractedTime: string | undefined = undefined;
    if (lowerTrimmed.includes('afternoon') || lowerTrimmed.includes('dopehr')) extractedTime = 'Afternoon (02:00 PM - 05:00 PM)';
    else if (lowerTrimmed.includes('morning') || lowerTrimmed.includes('subah')) extractedTime = 'Morning (09:00 AM - 12:00 PM)';
    else if (lowerTrimmed.includes('evening') || lowerTrimmed.includes('sham')) extractedTime = 'Evening (05:00 PM - 08:00 PM)';
    else if (lowerTrimmed.includes('night') || lowerTrimmed.includes('raat')) extractedTime = 'Night (08:00 PM onwards)';

    // 4. EXTRACT FAMILY DEPENDENT
    let extractedFamilyMember: string | undefined = undefined;
    if (lowerTrimmed.includes('son') || lowerTrimmed.includes('beta') || lowerTrimmed.includes('bete')) extractedFamilyMember = 'Son (Child)';
    else if (lowerTrimmed.includes('daughter') || lowerTrimmed.includes('beti')) extractedFamilyMember = 'Daughter (Child)';
    else if (lowerTrimmed.includes('child') || lowerTrimmed.includes('bacha') || lowerTrimmed.includes('bache') || lowerTrimmed.includes('kid')) extractedFamilyMember = 'Child';
    else if (lowerTrimmed.includes('mother') || lowerTrimmed.includes('ammi') || lowerTrimmed.includes('walida') || lowerTrimmed.includes('maa')) extractedFamilyMember = 'Mother';
    else if (lowerTrimmed.includes('father') || lowerTrimmed.includes('abu') || lowerTrimmed.includes('abbu') || lowerTrimmed.includes('walid') || lowerTrimmed.includes('baba')) extractedFamilyMember = 'Father';
    else if (lowerTrimmed.includes('wife') || lowerTrimmed.includes('biwi') || lowerTrimmed.includes('husband') || lowerTrimmed.includes('shauhar') || lowerTrimmed.includes('spouse')) extractedFamilyMember = 'Spouse';
    else if (lowerTrimmed.includes('myself') || lowerTrimmed.includes('apne liye') || lowerTrimmed.includes('mere liye')) extractedFamilyMember = 'Myself';

    // 5. DETERMINISTIC EMERGENCY SAFETY CHECK
    const emergencyEval = evaluateEmergencySafety(trimmed);
    if (emergencyEval.isEmergency) {
      const allHospitals = await dbService.getHospitals(extractedCity ? { city: extractedCity } : undefined);
      return {
        userQuery: trimmed,
        suggestedCare: 'Emergency Medicine (24/7 Acute Trauma & Resuscitation)',
        explanation: `⚠️ URGENT MEDICAL ATTENTION MAY BE NEEDED: Symptoms matching "${emergencyEval.matchedRule}" require immediate clinical resuscitation. Routine outpatient scheduling is NOT safe. ${emergencyEval.safetyGuidance} Immediate Action: ${emergencyEval.actionRequired}`,
        recommendedHospitals: allHospitals.filter(h => h.facilities?.some(f => f.toLowerCase().includes('emergency') || f.toLowerCase().includes('trauma'))).slice(0, 3),
        doctors: [],
        isEmergency: true,
        detectedLanguage,
        extractedCare: 'Emergency Medicine',
        extractedCity,
        extractedDate: 'Immediate',
        extractedTime: 'Now',
        extractedFamilyMember,
        suggestedActions: [
          { label: 'Find Emergency Department', type: 'emergency' },
          { label: 'Call Rescue 1122 (Ambulance)', type: 'emergency' },
          { label: 'Call Hospital Emergency Hotline', type: 'emergency' }
        ]
      };
    }

    // 6. MATCH CARE SPECIALTY
    const matchedCategories = dbService.searchCareCategories(trimmed);
    let matchedCategory = matchedCategories.length > 0 ? matchedCategories[0] : null;

    if (!matchedCategory) {
      const words = lowerTrimmed.split(/\s+/);
      for (const word of words) {
        if (word.length > 2) {
          const match = CARE_CATEGORIES.find(c => 
            c.name.toLowerCase().includes(word) || 
            c.specialty.toLowerCase().includes(word) ||
            c.keywords.some(k => k.toLowerCase().includes(word) || word.includes(k.toLowerCase()))
          );
          if (match) {
            matchedCategory = match;
            break;
          }
        }
      }
    }

    const careName = matchedCategory ? matchedCategory.name : 'General Medicine';
    
    // Bilingual friendly explanation
    let explanationText = '';
    const cityNote = extractedCity ? ` in ${extractedCity}` : ' across Pakistan';
    if (detectedLanguage === 'Roman Urdu') {
      explanationText = matchedCategory
        ? `Aapki inquiry ke mutabiq ${matchedCategory.name} (${matchedCategory.specialty}) sabse munasib care pathway hai. Humne ${extractedCity || 'Lahore aur Islamabad'} ke verified reference hospitals aur specialists find kiye hain.`
        : `Aapki tabiat ke liye General Medicine department sabse pehle consult karna behtar hai. Hospitals aur doctors ki availability niche di gayi hai.`;
    } else {
      explanationText = matchedCategory
        ? `${matchedCategory.name} addresses ${matchedCategory.specialty.toLowerCase()} and common concerns such as ${matchedCategory.commonSymptoms.slice(0, 2).join(' or ').toLowerCase()}. Verified hospital care options${cityNote} are ready for your inquiry.`
        : `General Medicine provides comprehensive initial clinical evaluation and diagnostic triage. We found verified healthcare facilities${cityNote} ready to assist you.`;
    }

    // 7. FETCH HOSPITALS & SPECIALISTS (CITY AWARE)
    const hospitals = await dbService.getHospitalsBySpecialty(careName, extractedCity);
    const allDoctors = await dbService.getDoctors();
    
    // Filter doctors matching careName and optionally city
    let doctors = allDoctors.filter(d => {
      const matchesSpec = d.specialty.toLowerCase().includes(careName.toLowerCase()) || 
                          careName.toLowerCase().includes(d.specialty.toLowerCase());
      const matchesCity = !extractedCity || (d.hospital?.city.toLowerCase().includes(extractedCity.toLowerCase()));
      return matchesSpec && matchesCity;
    });

    if (doctors.length === 0) {
      doctors = allDoctors.filter(d => 
        d.specialty.toLowerCase().includes(careName.toLowerCase()) || 
        careName.toLowerCase().includes(d.specialty.toLowerCase())
      );
    }

    if (doctors.length === 0) {
      doctors = allDoctors.slice(0, 4);
    }

    // Optional Gemini enhancement for natural phrasing if available
    let polishedExplanation = explanationText;
    if (geminiAvailable) {
      try {
        const geminiPrompt = `
You are CareFlow AI, a hospital navigation assistant in Pakistan.
User query: "${trimmed}"
Detected Language: ${detectedLanguage}
Matched Care Specialty: ${careName}
Location: ${extractedCity || 'Pakistan'}
Grounding Rule: NEVER diagnose diseases, NEVER prescribe drugs, NEVER claim clinical certainty. Always provide objective, polite guidance directing the patient to appropriate hospital departments.
In 1 or 2 calm, concise sentences (max 35 words) in ${detectedLanguage === 'Roman Urdu' ? 'Roman Urdu' : 'English'}, explain why ${careName} is the relevant care department and that we found available specialists and reference hospitals.
`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 100 }
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            polishedExplanation = text.trim();
          }
        }
      } catch (err) {
        // Fallback to grounded default explanation
      }
    }

    return {
      userQuery: trimmed,
      suggestedCare: careName,
      explanation: polishedExplanation,
      recommendedHospitals: hospitals.slice(0, 3),
      doctors: doctors.slice(0, 4),
      isEmergency: false,
      matchedCategory,
      detectedLanguage,
      extractedCare: careName,
      extractedCity,
      extractedDate,
      extractedTime,
      extractedFamilyMember,
      suggestedActions: [
        { label: `Find Hospitals ${extractedCity ? 'in ' + extractedCity : ''}`, type: 'hospital', filter: { city: extractedCity, specialty: careName } },
        { label: `Find ${careName} Doctors`, type: 'doctor', filter: { specialty: careName } },
        { label: 'View Available Slots', type: 'slots', filter: { specialty: careName } }
      ]
    };
  },

  async processUserMessage(userInput: string, userId: string): Promise<AiMessage> {
    const trimmed = userInput.trim();

    // 1. DETERMINISTIC EMERGENCY SAFETY CHECK (FIRST STEP!)
    const emergencyEval = evaluateEmergencySafety(trimmed);
    if (emergencyEval.isEmergency) {
      return {
        id: `ai-msg-${Date.now()}`,
        conversation_id: 'active-convo',
        sender: 'assistant',
        message: `⚠️ EMERGENCY SAFETY ALERT: Your described symptoms (${emergencyEval.matchedRule}) require immediate medical attention. CareFlow AI cannot book routine outpatient appointments for potentially life-threatening conditions.\n\n${emergencyEval.safetyGuidance}\n\n🚨 IMMEDIATE ACTION REQUIRED:\n${emergencyEval.actionRequired}`,
        metadata: {
          is_emergency: true,
          actions: [
            {
              type: 'emergency_call',
              label: 'Call Emergency (911 / 112)',
              payload: 'tel:911',
            }
          ],
          disclaimer: 'CareFlow AI is an administrative hospital navigation tool. For severe or urgent symptoms, always seek certified emergency care immediately.'
        },
        created_at: new Date().toISOString()
      };
    }

    // 2. RETRIEVE REAL DATABASE CONTEXT FOR GROUNDING
    const departments = await dbService.getDepartments();
    const doctors = await dbService.getDoctors();
    const userAppointments = await dbService.getAppointments(userId, 'patient');

    // 3. INTENT CLASSIFICATION & GROUNDED ROUTING
    const intentResult = classifyIntent(trimmed, departments, doctors);

    // If Gemini key is present, we can call Gemini with strict grounding context
    if (GEMINI_API_KEY) {
      try {
        const geminiResponse = await callGeminiWithGrounding(trimmed, departments, doctors, intentResult);
        if (geminiResponse) {
          return formatGroundedMessage(intentResult, geminiResponse, departments, doctors, userAppointments);
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to grounded rule engine:', err);
      }
    }

    // Grounded navigation response
    return generateGroundedNavigationResponse(intentResult, departments, doctors, userAppointments);
  },

  // ==========================================
  // AI MEDICAL REPORT UNDERSTANDING (Non-Diagnostic)
  // ==========================================
  async summarizeMedicalReport(reportName: string, reportType: string): Promise<{
    summary: string;
    keyParameters: { name: string; value: string; referenceRange: string; status: 'normal' | 'attention' | 'info'; interpretation: string }[];
    questionsForDoctor: string[];
    disclaimer: string;
  }> {
    const disclaimer = 'IMPORTANT DISCLAIMER: This automated breakdown is strictly designed to help you understand standard lab terminology. It does NOT constitute medical diagnosis, lab certification, or clinical prognosis. Please review all lab findings with your licensed attending physician.';

    // Base mock parameters based on report type
    let parameters: Array<{ name: string; value: string; referenceRange: string; status: 'normal' | 'attention' | 'info'; interpretation: string }> = [
      { name: 'Hemoglobin (Hb)', value: '14.2 g/dL', referenceRange: '13.5 - 17.5 g/dL', status: 'normal' as const, interpretation: 'Well within standard physiological range for adult blood oxygen transport capacity.' },
      { name: 'Total Leukocyte Count (WBC)', value: '6,800 /µL', referenceRange: '4,500 - 11,000 /µL', status: 'normal' as const, interpretation: 'Healthy baseline with no clinical indication of acute bacterial or systemic infection.' },
      { name: 'Platelet Count', value: '240,000 /µL', referenceRange: '150,000 - 450,000 /µL', status: 'normal' as const, interpretation: 'Normal platelet volume supporting standard blood coagulation.' },
      { name: 'Fasting Plasma Glucose', value: '104 mg/dL', referenceRange: '70 - 99 mg/dL', status: 'attention' as const, interpretation: 'Mildly elevated compared to standard fasting threshold. Worth discussing dietary habits with physician.' }
    ];

    let questions = [
      'What lifestyle or dietary modifications are recommended given the borderline fasting glucose level?',
      'Do I need any follow-up blood tests before my next routine consultation?',
      'Are there any specific symptoms I should monitor between visits?'
    ];

    let summaryText = `This ${reportType || 'laboratory report'} (${reportName}) shows predominantly standard baseline parameters across key hematological markers. Red blood cell count, white blood cell count, and platelets are stable within standard ranges. A mildly elevated fasting glucose level was identified which should be reviewed with your primary physician.`;

    if (reportType.toLowerCase().includes('ultrasound') || reportName.toLowerCase().includes('echo')) {
      parameters = [
        { name: 'Left Ventricular Ejection Fraction (LVEF)', value: '62%', referenceRange: '55% - 70%', status: 'normal' as const, interpretation: 'Normal systolic pump function and left ventricle contraction.' },
        { name: 'Regional Wall Motion', value: 'Normal', referenceRange: 'Normal contractility', status: 'normal' as const, interpretation: 'No focal wall motion abnormalities detected in resting myocardial segments.' },
        { name: 'Mitral Valve Doppler', value: 'Trace Regurgitation', referenceRange: 'None to Trace', status: 'info' as const, interpretation: 'Minimal physiological leak common in healthy individuals; not hemodynamically significant.' },
        { name: 'Resting Cardiac Rhythm', value: '74 bpm', referenceRange: '60 - 100 bpm', status: 'normal' as const, interpretation: 'Regular sinus rhythm observed throughout the ultrasound examination.' }
      ];
      questions = [
        'Does the trace mitral valve finding require any routine follow-up echo scans?',
        'Are there any exercise or physical activity guidelines I should observe?',
        'Should I continue monitoring my home blood pressure readings?'
      ];
      summaryText = `This echocardiogram / cardiac ultrasound document shows healthy left ventricular systolic function with an estimated ejection fraction of 62%. Heart valves show preserved structure with trace mitral valve regurgitation that is within expected physiological norms.`;
    }

    // Try Gemini enhancement if key is configured
    if (geminiAvailable) {
      try {
        const prompt = `
You are CareFlow AI's Patient Report Explainer.
Document: ${reportName}
Type: ${reportType}
Strict Non-Diagnostic Grounding Rules:
1. Explain the medical document in calm, friendly, accessible language suitable for a patient.
2. NEVER diagnose disease. NEVER say "you have X disease".
3. Under 90 words.
4. Conclude by advising the patient to discuss the findings directly with their physician.
`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 150 }
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (txt && txt.trim()) {
            summaryText = txt.trim();
          }
        }
      } catch (err) {
        // Fallback to pre-grounded structured text
      }
    }

    return {
      summary: summaryText,
      keyParameters: parameters,
      questionsForDoctor: questions,
      disclaimer
    };
  },

  // ==========================================
  // DOCTOR CLINICAL BRIEFING NOTE (Pre-Consultation)
  // ==========================================
  async generateDoctorBriefing(patientName: string, reason: string, pastVisitsCount: number, recentReports: string[]): Promise<{
    briefingSummary: string;
    clinicalAlerts: string[];
    suggestedDiscussionPoints: string[];
  }> {
    const summary = `${patientName} presents today for: "${reason}". Patient has ${pastVisitsCount} prior consultation(s) on record within the CareFlow healthcare system. Available laboratory records include ${recentReports.length > 0 ? recentReports.join(', ') : 'standard CBC panel'}.`;

    const clinicalAlerts = [
      'Verify patient medication compliance for prescribed anti-hypertensive regimen if applicable.',
      'Check recent resting blood pressure log and evaluate exertional symptoms.',
      'Review any newly uploaded diagnostic panels prior to treatment plan adjustment.'
    ];

    const suggestedDiscussionPoints = [
      `Chief concern timeline: "${reason}" onset and aggravating/relieving factors.`,
      'Review lifestyle factors: daily physical exercise, sodium intake, and sleep hygiene.',
      'Determine necessity for scheduled follow-up or diagnostic re-evaluation.'
    ];

    return {
      briefingSummary: summary,
      clinicalAlerts,
      suggestedDiscussionPoints
    };
  }
};

// Deterministic intent classifier grounded to database departments & keywords
function classifyIntent(input: string, departments: Department[], doctors: Doctor[]): NavigationIntent {
  const text = input.toLowerCase();

  // Check upcoming appointments
  if (text.includes('my appointment') || text.includes('upcoming appointment') || text.includes('view appointment') || text.includes('show appointment')) {
    return {
      intent: 'view_appointment',
      explanation: 'Here is your upcoming scheduled visit and its current status.'
    };
  }

  // Check queue status
  if (text.includes('queue') || text.includes('waiting time') || text.includes('patients ahead') || text.includes('line')) {
    return {
      intent: 'view_queue',
      explanation: 'Here is your real-time outpatient queue position and estimated wait time.'
    };
  }

  // Check medical reports
  if (text.includes('report') || text.includes('blood test') || text.includes('x-ray') || text.includes('document') || text.includes('lab result')) {
    return {
      intent: 'view_reports',
      explanation: 'You can view, categorize, and download your verified medical reports here.'
    };
  }

  // Check specific department keywords
  if (text.includes('skin') || text.includes('rash') || text.includes('acne') || text.includes('eczema') || text.includes('itch') || text.includes('dermatolog')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Dermatology',
      explanation: 'Based on your symptoms involving skin, rashes, or irritation, a consultation with our Dermatology department is recommended.'
    };
  }

  if (text.includes('heart') || text.includes('palpitation') || text.includes('blood pressure') || text.includes('hypertension') || text.includes('cardio')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Cardiology',
      explanation: 'For concerns related to heart rhythm, blood pressure management, or cardiovascular health, our Cardiology specialists are appropriate.'
    };
  }

  if (text.includes('bone') || text.includes('joint') || text.includes('knee') || text.includes('shoulder') || text.includes('back pain') || text.includes('sprain') || text.includes('ortho')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Orthopedics',
      explanation: 'For musculoskeletal discomfort, joints, sports injuries, or mobility concerns, our Orthopedic specialists can evaluate your condition.'
    };
  }

  if (text.includes('child') || text.includes('baby') || text.includes('infant') || text.includes('pediatric') || text.includes('son') || text.includes('daughter')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Pediatrics',
      explanation: 'For children and adolescents, our Pediatrics department provides dedicated age-appropriate medical care.'
    };
  }

  if (text.includes('headache') || text.includes('migraine') || text.includes('dizzy') || text.includes('tingling') || text.includes('nerve') || text.includes('neuro')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Neurology',
      explanation: 'For persistent headaches, nerve discomfort, or vestibular balance issues, our Neurology department offers specialized diagnostics.'
    };
  }

  if (text.includes('cough') || text.includes('asthma') || text.includes('bronchitis') || text.includes('lung') || text.includes('pulmon')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Pulmonology',
      explanation: 'For respiratory concerns, recurring coughs, or asthma care, our Pulmonology clinic provides lung assessments.'
    };
  }

  if (text.includes('eye') || text.includes('vision') || text.includes('blurry') || text.includes('ophthalm') || text.includes('sight')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Ophthalmology',
      explanation: 'For visual acuity changes, eye discomfort, or optical checkups, our Ophthalmology clinic is ready to assist.'
    };
  }

  if (text.includes('ear') || text.includes('throat') || text.includes('sinus') || text.includes('tonsil') || text.includes('ent')) {
    return {
      intent: 'recommend_department',
      departmentName: 'ENT (Ear, Nose & Throat)',
      explanation: 'For sinus congestion, auditory balance, or throat discomfort, an ENT consultation is indicated.'
    };
  }

  if (text.includes('stomach') || text.includes('digestion') || text.includes('acid') || text.includes('reflux') || text.includes('gut') || text.includes('gastro')) {
    return {
      intent: 'recommend_department',
      departmentName: 'Gastroenterology',
      explanation: 'For persistent digestive tract discomfort, acid reflux, or gut symptoms, our Gastroenterology specialists provide expert care.'
    };
  }

  // Doctor search
  const matchedDoc = doctors.find(d => 
    (d.profile?.full_name && text.includes(d.profile.full_name.toLowerCase())) ||
    text.includes(d.specialty.toLowerCase())
  );
  if (matchedDoc) {
    return {
      intent: 'find_doctor',
      doctorName: matchedDoc.profile?.full_name,
      departmentName: matchedDoc.specialty,
      explanation: `Here is the profile and next available booking slots for ${matchedDoc.profile?.full_name}.`
    };
  }

  // Default: General Navigation & Primary Care
  return {
    intent: 'general_help',
    departmentName: 'General Medicine',
    explanation: 'I can assist you with department recommendations, booking an appointment with an available specialist, tracking your queue, or organizing reports.'
  };
}

// Call Gemini API with grounding parameters
async function callGeminiWithGrounding(
  userInput: string, 
  departments: Department[], 
  doctors: Doctor[],
  intent: NavigationIntent
): Promise<string | null> {
  if (!geminiAvailable) return null;
  const deptListStr = departments.map(d => `${d.name} (${d.specialty})`).join(', ');
  const docListStr = doctors.map(d => `${d.profile?.full_name} [${d.specialty}, Fee: $${d.consultation_fee}]`).join(', ');

  const prompt = `
System Context:
${SYSTEM_PROMPT}

Active Hospital Departments:
${deptListStr}

Real Hospital Doctors:
${docListStr}

Patient Request: "${userInput}"
Pre-classified Intent: ${intent.intent} (Suggested Department: ${intent.departmentName || 'None'})

Task: Respond to the patient with a warm, helpful, clinical navigation guidance message.
1. Guide them to the appropriate department.
2. Suggest 1 or 2 real doctors from the list above.
3. Explicitly state this is guidance and not a medical diagnosis.
4. Keep it concise (under 80 words).
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 250,
      }
    })
  });

  if (!response.ok) {
    console.warn('Gemini response status:', response.status, response.statusText);
    return null;
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Format grounded response
function generateGroundedNavigationResponse(
  intent: NavigationIntent,
  departments: Department[],
  doctors: Doctor[],
  userAppointments: any[]
): AiMessage {
  let message = intent.explanation;
  let suggestedDocs: Doctor[] = [];
  let actions: any[] = [];

  if (intent.intent === 'recommend_department' || intent.intent === 'find_doctor' || intent.intent === 'general_help') {
    const targetDept = intent.departmentName || 'General Medicine';
    suggestedDocs = doctors.filter(d => 
      d.specialty.toLowerCase().includes(targetDept.toLowerCase()) || 
      targetDept.toLowerCase().includes(d.specialty.toLowerCase())
    );

    if (suggestedDocs.length > 0) {
      actions = suggestedDocs.slice(0, 2).map(doc => ({
        type: 'book_doctor',
        label: `Book with ${doc.profile?.full_name || 'Doctor'} (${doc.specialty})`,
        payload: { doctorId: doc.id, departmentName: doc.specialty }
      }));
    }

    message += `\n\nI have retrieved available specialists in ${targetDept} from the hospital directory. Would you like to select a slot?`;
  } else if (intent.intent === 'view_appointment') {
    const upcoming = userAppointments.find(a => a.status === 'confirmed');
    if (upcoming) {
      message = `You have an upcoming appointment with ${upcoming.doctor?.profile?.full_name || 'your physician'} on ${upcoming.appointment_date} at ${upcoming.start_time.slice(0, 5)}. Status: Confirmed.`;
      actions = [
        { type: 'view_appointment', label: 'View Appointment Details', payload: { appointmentId: upcoming.id } },
        { type: 'view_queue', label: 'Check Live Queue', payload: { appointmentId: upcoming.id } }
      ];
    } else {
      message = 'You do not have any upcoming confirmed appointments at this time. You can search our doctor directory to book a visit.';
      actions = [{ type: 'find_department', label: 'Browse Departments & Doctors', payload: {} }];
    }
  } else if (intent.intent === 'view_queue') {
    const active = userAppointments.find(a => a.status === 'confirmed' && a.queue);
    if (active && active.queue) {
      message = `For your appointment with ${active.doctor?.profile?.full_name || 'Dr.'}, you are currently #${active.queue.position} in line (${active.queue.patients_ahead} patient${active.queue.patients_ahead === 1 ? '' : 's'} ahead). Estimated wait time is approximately ${active.queue.estimated_wait_minutes} minutes.`;
      actions = [{ type: 'view_queue', label: 'Open Live Queue Tracker', payload: { appointmentId: active.id } }];
    } else {
      message = 'You do not currently have an active queue ticket for today. Queue tracking becomes active on your appointment day.';
    }
  } else if (intent.intent === 'view_reports') {
    message = 'You have 3 verified medical documents in your record (including Blood Test and Ultrasound reports). You can access and organize them in your Medical Document Center.';
    actions = [{ type: 'view_reports', label: 'Open Medical Reports', payload: {} }];
  }

  return {
    id: `ai-msg-${Date.now()}`,
    conversation_id: 'active-convo',
    sender: 'assistant',
    message,
    metadata: {
      recommended_department: intent.departmentName,
      suggested_doctors: suggestedDocs.slice(0, 2),
      actions,
      disclaimer: 'CareFlow AI provides administrative navigation guidance only and does not provide clinical medical diagnosis or prescriptions.'
    },
    created_at: new Date().toISOString(),
  };
}

function formatGroundedMessage(
  intent: NavigationIntent,
  geminiText: string,
  departments: Department[],
  doctors: Doctor[],
  userAppointments: any[]
): AiMessage {
  const base = generateGroundedNavigationResponse(intent, departments, doctors, userAppointments);
  return {
    ...base,
    message: geminiText,
  };
}

