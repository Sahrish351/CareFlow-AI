import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/aiService';
import { dbService } from '../../services/dbService';
import { AiMessage, Doctor, Department } from '../../types';
import { BookingModal } from '../../components/appointments/BookingModal';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Send,
  Sparkles,
  AlertTriangle,
  PhoneCall,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  ShieldAlert,
  ChevronRight,
  Info,
  Building,
  CheckCircle2,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react';

export const AiNavigationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Real database doctors and departments for grounded context
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<string>('General Care');
  const [contextEmergency, setContextEmergency] = useState<boolean>(false);

  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      conversation_id: 'default',
      sender: 'assistant',
      message: `Hello ${user?.full_name?.split(' ')[0] || 'there'}, I'm your CareFlow Hospital Navigation Agent. \n\nDescribe your symptoms or what care you're seeking today. I will safely analyze your request, guide you to the right department, and present real available specialists.`,
      metadata: {
        disclaimer: 'CareFlow AI provides administrative navigation guidance only and does not diagnose conditions or prescribe medications.'
      },
      created_at: new Date().toISOString()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dbService.getDoctors().then(docs => setAvailableDoctors(docs.slice(0, 3)));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      conversation_id: 'default',
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await aiService.processUserMessage(text, user?.id || '');
      setMessages(prev => [...prev, response]);

      // Update right-hand context drawer based on response metadata
      if (response.metadata?.is_emergency) {
        setContextEmergency(true);
      } else {
        setContextEmergency(false);
        if (response.metadata?.recommended_department) {
          setActiveDepartment(response.metadata.recommended_department);
          const allDocs = await dbService.getDoctors();
          const matched = allDocs.filter(d => 
            d.specialty.toLowerCase().includes(response.metadata!.recommended_department!.toLowerCase())
          );
          setAvailableDoctors(matched.length > 0 ? matched : allDocs.slice(0, 3));
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          conversation_id: 'default',
          sender: 'assistant',
          message: 'Sorry, I had trouble processing that request. Please try selecting one of the suggested navigation chips below.',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.type === 'book_doctor' && action.payload?.doctorId) {
      dbService.getDoctorById(action.payload.doctorId).then(doc => {
        if (doc) setSelectedDoctorForBooking(doc);
      });
    } else if (action.type === 'view_appointment') {
      navigate('/patient/appointments');
    } else if (action.type === 'view_queue') {
      navigate('/patient/queue');
    } else if (action.type === 'view_reports') {
      navigate('/patient/reports');
    } else if (action.type === 'find_department') {
      navigate('/patient/doctors');
    }
  };

  const suggestionPrompts = [
    { label: '🩺 "I have a skin rash"', text: 'I have an itchy red skin rash and want to see a specialist' },
    { label: '❤️ "Elevated blood pressure"', text: 'I have high blood pressure and need a heart doctor' },
    { label: '📅 "Show upcoming appointment"', text: 'Show my upcoming appointment' },
    { label: '⏳ "Where am I in the queue?"', text: 'Where am I in the queue?' },
    { label: '🚨 Test Emergency Routing', text: 'I have severe chest pain radiating to my left arm and cannot breathe' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
              <Bot className="w-5 h-5" />
            </span>
            CareFlow AI Patient Navigation Agent
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Action-oriented clinical companion for symptoms, verified specialists, and live queue tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Grounded</span>
          </span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-teal-50/70 border border-teal-200/70 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs text-teal-950 shadow-2xs">
        <Info className="w-4 h-4 text-teal-600 shrink-0" />
        <p className="flex-1 leading-relaxed">
          <span className="font-bold">Clinical Safety Notice:</span> CareFlow AI guides hospital navigation and scheduling. It does not provide medical diagnoses or prescriptions. If experiencing severe symptoms, proceed directly to official emergency care.
        </p>
      </div>

      {/* Flagship Dual-Pane Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[550px]">
        {/* Left Column: Conversational Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isEmergency = msg.metadata?.is_emergency;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-teal-600 text-white font-bold text-xs'
                        : isEmergency
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30'
                        : 'bg-slate-100 text-teal-700 border border-slate-200'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : isEmergency ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                        isUser
                          ? 'bg-teal-600 text-white rounded-tr-none'
                          : isEmergency
                          ? 'bg-rose-50 text-rose-950 border border-rose-200 rounded-tl-none ring-2 ring-rose-500/20'
                          : 'bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-none'
                      }`}
                    >
                      {isEmergency && (
                        <div className="flex items-center gap-1.5 font-bold text-rose-700 uppercase tracking-wider text-[11px] mb-2 pb-2 border-b border-rose-200">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          Emergency Safety Rule Triggered
                        </div>
                      )}
                      {msg.message}

                      {/* Emergency Hotline CTA Buttons */}
                      {isEmergency && (
                        <div className="mt-4 pt-3 border-t border-rose-200 flex flex-wrap gap-2">
                          <a
                            href="tel:911"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Call 911 / Emergency
                          </a>
                          <button
                            onClick={() => alert('Nearest ER: Metropolitan General Hospital - 24/7 Trauma Care (0.8 miles)')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-rose-900 border border-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-100/50 transition-colors"
                          >
                            Find Nearest Emergency Room
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actionable buttons */}
                    {!isEmergency && msg.metadata?.actions && msg.metadata.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.metadata.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
                          >
                            {act.type === 'book_doctor' && <Calendar className="w-3.5 h-3.5 text-teal-600" />}
                            {act.type === 'view_queue' && <Clock className="w-3.5 h-3.5 text-sky-600" />}
                            {act.type === 'view_reports' && <FileText className="w-3.5 h-3.5 text-purple-600" />}
                            <span>{act.label}</span>
                            <ChevronRight className="w-3 h-3 text-teal-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-teal-700 flex items-center justify-center border border-slate-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt chips */}
          <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestionPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="shrink-0 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe symptoms, request an appointment, or ask about reports..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Live Context & Action Drawer (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">Hospital Action Context</h3>
              </div>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                {activeDepartment}
              </span>
            </div>

            {contextEmergency ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-xs text-rose-950">
                <div className="flex items-center gap-2 font-bold text-rose-700 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Critical Care Priority</span>
                </div>
                <p className="leading-relaxed">
                  CareFlow AI has flagged potential acute symptoms. Outpatient routine booking is disabled for this query to prioritize patient safety.
                </p>
                <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                  <span className="font-bold text-rose-800 block">Emergency Hotline:</span>
                  <p className="text-slate-600">United States: 911 • Europe: 112 • UK: 999</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recommended Specialists
                  </span>
                  <span className="text-[11px] text-teal-600 font-medium">Real Availability</span>
                </div>

                {availableDoctors.map(doctor => (
                  <div
                    key={doctor.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.profile?.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                        alt={doctor.profile?.full_name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {doctor.profile?.full_name}
                        </h4>
                        <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-xs text-slate-900 block">${doctor.consultation_fee}</span>
                        <span className="text-[10px] text-slate-400">Fee</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{doctor.experience_years} yrs exp</span>
                      <button
                        onClick={() => setSelectedDoctorForBooking(doctor)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Select Slot</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hospital Services Shortcut Bar */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
            <button
              onClick={() => navigate('/patient/queue')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold flex flex-col items-center gap-1"
            >
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Live Queue</span>
            </button>
            <button
              onClick={() => navigate('/patient/reports')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold flex flex-col items-center gap-1"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold flex flex-col items-center gap-1"
            >
              <Building className="w-4 h-4 text-teal-600" />
              <span>Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onSuccess={() => {
            setSelectedDoctorForBooking(null);
            navigate('/patient/dashboard');
          }}
        />
      )}
    </div>
  );
};
