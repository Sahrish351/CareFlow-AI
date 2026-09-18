import { EmergencyEvaluation } from '../types';

interface EmergencyPattern {
  keywords: string[];
  ruleName: string;
  guidance: string;
}

const EMERGENCY_PATTERNS: EmergencyPattern[] = [
  {
    ruleName: 'Potential Acute Coronary Syndrome (Cardiac Alert)',
    keywords: [
      'chest pain', 'chest pressure', 'chest tightness', 'heart attack', 
      'radiating pain to arm', 'radiating to jaw', 'heavy chest', 'crushing chest'
    ],
    guidance: 'Chest pain or heavy chest pressure can be a sign of a life-threatening cardiac event (such as a heart attack). Immediate emergency intervention is essential.'
  },
  {
    ruleName: 'Severe Respiratory Distress',
    keywords: [
      'cannot breathe', 'severe shortness of breath', 'can\'t breathe', 
      'gasping for air', 'lips turning blue', 'choking', 'struggling to breathe'
    ],
    guidance: 'Severe breathing difficulty indicates compromised oxygenation. Do not wait for an outpatient appointment; seek urgent emergency airway support immediately.'
  },
  {
    ruleName: 'Potential Cerebrovascular Accident (Stroke Signs)',
    keywords: [
      'slurred speech', 'facial drooping', 'face drooping', 'sudden numbness', 
      'weakness on one side', 'stroke', 'paralyzed arm', 'cannot move arm'
    ],
    guidance: 'Sudden weakness, facial drooping, or speech impairment are hallmark signs of a stroke. Time is critical for brain tissue preservation (FAST protocol).'
  },
  {
    ruleName: 'Severe Hemorrhage or Uncontrolled Bleeding',
    keywords: [
      'severe bleeding', 'uncontrolled bleeding', 'spurting blood', 
      'coughing up blood', 'vomiting blood', 'massive bleeding'
    ],
    guidance: 'Uncontrolled bleeding or internal hemorrhage requires immediate emergency trauma care and surgical assessment.'
  },
  {
    ruleName: 'Acute Anaphylaxis / Severe Allergic Reaction',
    keywords: [
      'throat closing', 'swollen tongue', 'swollen lips and throat', 
      'anaphylaxis', 'allergic shock', 'epipen'
    ],
    guidance: 'Rapid swelling of the throat or airway obstruction from an allergic reaction is a life-threatening medical emergency. Use an epinephrine injector if available and call emergency services.'
  },
  {
    ruleName: 'Loss of Consciousness / Acute Trauma',
    keywords: [
      'unconscious', 'fainted and not waking up', 'severe seizure', 
      'passed out cold', 'head trauma unconscious', 'car crash severe injury'
    ],
    guidance: 'Episodes involving unresponsiveness, prolonged seizures, or severe head impact demand immediate emergency evaluation.'
  }
];

export const evaluateEmergencySafety = (userInput: string): EmergencyEvaluation => {
  const normalized = userInput.toLowerCase();

  for (const pattern of EMERGENCY_PATTERNS) {
    const matched = pattern.keywords.some(keyword => normalized.includes(keyword));
    if (matched) {
      return {
        isEmergency: true,
        matchedRule: pattern.ruleName,
        urgencyLevel: 'critical',
        safetyGuidance: pattern.guidance,
        actionRequired: 'Call 911 (or your local emergency number: 112 / 999) or proceed immediately to the nearest Hospital Emergency Room.'
      };
    }
  }

  return {
    isEmergency: false,
    urgencyLevel: 'normal',
    safetyGuidance: '',
    actionRequired: ''
  };
};

