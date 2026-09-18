import React, { useState } from 'react';
import { Appointment, DoctorReview } from '../../types';
import { dbService } from '../../services/dbService';
import { X, Star, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';

interface AppointmentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patientName?: string;
  onReviewSubmitted: (review: DoctorReview) => void;
}

export const AppointmentReviewModal: React.FC<AppointmentReviewModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patientName = 'Verified Patient',
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newReview = await dbService.submitDoctorReview({
        doctor_id: appointment.doctor_id,
        patient_id: appointment.patient_id,
        appointment_id: appointment.id,
        rating,
        comment: comment.trim() || 'Attentive and thorough clinical consultation.',
        patient_name: patientName,
      });

      setSubmitted(true);
      onReviewSubmitted(newReview);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['Select rating', 'Needs Improvement', 'Fair Experience', 'Good Quality Care', 'Very Good', 'Exceptional Service'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Your verified review helps maintain high healthcare standards across CareFlow clinics.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1">
                <Star className="w-3.5 h-3.5 fill-teal-600" />
                Verified Patient Review
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Rate Your Consultation
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                How was your visit with{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {appointment.doctor?.profile?.full_name || 'the physician'}
                </span>{' '}
                at {appointment.hospital?.name || 'CareFlow Medical Center'}?
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Interactive Stars */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoveredRating !== null ? hoveredRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          isFilled
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300 dark:text-gray-600'
                        } transition`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {ratingLabels[hoveredRating !== null ? hoveredRating : rating]}
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                Comments & Clinical Experience (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on doctor attentiveness, explanation clarity, clinic punctuality, and staff courtesy..."
                rows={4}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

