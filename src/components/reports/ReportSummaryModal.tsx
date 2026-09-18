import React, { useState, useEffect } from 'react';
import { MedicalDocument } from '../../types';
import { aiService } from '../../services/aiService';
import { 
  X, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  Download, 
  Loader2 
} from 'lucide-react';

interface ReportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MedicalDocument | null;
}

export const ReportSummaryModal: React.FC<ReportSummaryModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    summary: string;
    keyParameters: Array<{ name: string; value: string; referenceRange: string; status: 'normal' | 'attention' | 'info'; interpretation: string }>;
    questionsForDoctor: string[];
    disclaimer: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && document) {
      setLoading(true);
      aiService.summarizeMedicalReport(document.document_name, document.document_type)
        .then((res) => {
          setSummaryData(res);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setSummaryData(null);
    }
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  AI Report Understanding
                </h2>
                <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {document.document_type}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-md">
                {document.document_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Analyzing clinical lab parameters...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Translating medical terminology into clear patient explanations.
              </p>
            </div>
          ) : summaryData ? (
            <>
              {/* Mandatory Non-Diagnostic Alert Banner */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold">Non-Diagnostic Educational Overview: </span>
                  {summaryData.disclaimer}
                </div>
              </div>

              {/* Plain Language Summary */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Document Summary
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 border border-gray-200/70 dark:border-gray-700/60 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {summaryData.summary}
                </div>
              </div>

              {/* Key Parameters Table */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Evaluated Clinical Markers
                </h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {summaryData.keyParameters.map((param, i) => (
                    <div key={i} className="p-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {param.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                            {param.value}
                          </span>
                          {param.status === 'normal' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Normal
                            </span>
                          )}
                          {param.status === 'attention' && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Note
                            </span>
                          )}
                          {param.status === 'info' && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <Info className="w-3 h-3" /> Standard
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Standard Reference: {param.referenceRange}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 bg-gray-50 dark:bg-gray-800/60 p-2 rounded-lg">
                        {param.interpretation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions for Doctor */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  Suggested Questions for Your Attending Physician
                </h3>
                <div className="space-y-2">
                  {summaryData.questionsForDoctor.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-xs text-gray-700 dark:text-gray-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Unable to generate report overview. Please consult your physician directly.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={() => {
              alert(`Simulating secure download for ${document.document_name}`);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download Original File
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

