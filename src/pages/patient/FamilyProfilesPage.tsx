import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { FamilyMember, FamilyRelationship } from '../../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Calendar, 
  Heart, 
  AlertCircle, 
  ShieldCheck, 
  X, 
  Plus, 
  ArrowRight,
  User
} from 'lucide-react';
import { AppointmentWizardModal } from '../../components/booking/AppointmentWizardModal';

export const FamilyProfilesPage: React.FC = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingMember, setBookingMember] = useState<FamilyMember | null>(null);
  const [showBookingWizard, setShowBookingWizard] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('Child');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergiesText, setAllergiesText] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFamily = async () => {
    if (!user) return;
    setLoading(true);
    const members = await dbService.getFamilyMembers(user.id);
    setFamilyMembers(members);
    setLoading(false);
  };

  useEffect(() => {
    loadFamily();
  }, [user]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim()) return;

    setSubmitting(true);
    try {
      const allergies = allergiesText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await dbService.addFamilyMember({
        patient_id: user.id,
        full_name: fullName.trim(),
        relationship,
        date_of_birth: dob || null,
        gender,
        blood_group: bloodGroup,
        allergies,
        notes: notes.trim() || null,
      });

      // Reset form
      setFullName('');
      setDob('');
      setNotes('');
      setAllergiesText('');
      setShowAddModal(false);
      await loadFamily();
    } catch (err) {
      console.error('Error adding family member:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this family profile?')) {
      await dbService.deleteFamilyMember(id);
      await loadFamily();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/60 text-teal-200 text-xs font-semibold mb-3 border border-teal-700/50">
            <Users className="w-3.5 h-3.5" />
            Family Healthcare Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Family Profiles
          </h1>
          <p className="text-teal-100/80 text-sm mt-2 leading-relaxed">
            Manage dependent profiles for your children, parents, or spouse. Seamlessly book specialized consultations, view clinical records, and track care for your whole household.
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-sm transition shadow-lg shadow-teal-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Family Member
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Grid of Family Members */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <Users className="w-8 h-8 animate-pulse mx-auto mb-2 text-teal-600" />
          <p className="text-sm font-medium">Loading family records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Account Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-500/40 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-700">
                Primary Account
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold text-lg mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.full_name || 'Myself'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Account Holder • Primary Patient Profile
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Role</span>
                  <span className="font-semibold text-teal-600 uppercase tracking-wide text-[10px]">Verified Patient</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setBookingMember(null);
                  setShowBookingWizard(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book for Myself
              </button>
            </div>
          </div>

          {/* Family Member Cards */}
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                    {member.full_name[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {member.relationship}
                    </span>
                    <button
                      onClick={() => handleDelete(member.id)}
                      title="Remove Member"
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {member.full_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {member.gender || 'Not specified'} • Blood Group: <span className="font-semibold text-rose-600">{member.blood_group || 'O+'}</span>
                </p>

                {member.date_of_birth && (
                  <p className="text-xs text-gray-400 mt-1">
                    DOB: {member.date_of_birth}
                  </p>
                )}

                {/* Allergies & Notes */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  {member.allergies && member.allergies.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                        Allergies
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {member.allergies.map((all, i) => (
                          <span
                            key={i}
                            className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] px-2 py-0.5 rounded-md font-medium border border-rose-200/60 dark:border-rose-800/40"
                          >
                            {all}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                      "{member.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setBookingMember(member);
                    setShowBookingWizard(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book for {member.full_name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}

          {/* Add New Member Quick Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-teal-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition group min-h-[260px] bg-gray-50/50 dark:bg-gray-900/30"
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 group-hover:scale-110 transition flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">
              Add Another Dependent
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Register children, elderly parents, or relatives for centralized care scheduling.
            </p>
          </button>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Add Family Member
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ali Khan, Fatima Begum"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Relationship *
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as FamilyRelationship)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Child">Child / Dependent</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Known Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Clinical Notes or Chronic History
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Routine childhood vaccines, monitored for hypertension..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Save Member Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Wizard with selected member preloaded */}
      <AppointmentWizardModal
        isOpen={showBookingWizard}
        onClose={() => setShowBookingWizard(false)}
        initialFamilyMemberId={bookingMember?.id}
        onSuccess={() => {
          setShowBookingWizard(false);
          loadFamily();
        }}
      />
    </div>
  );
};

