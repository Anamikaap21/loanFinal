import React from 'react';
import { Upload, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function KycDocumentUploadFields({
  aadhaarFile,
  setAadhaarFile,
  panFile,
  setPanFile,
  bankProofFile,
  setBankProofFile,
  accentColor = 'red', // 'red' | 'blue' | 'purple' | 'emerald'
  isOptional = false,
}) {
  const accentClasses = {
    red: {
      badge: 'bg-brand-red/10 text-brand-red border-brand-red/25',
      icon: 'text-brand-red',
      borderHover: 'hover:border-brand-red/50',
      activeBorder: 'border-brand-red',
    },
    blue: {
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      icon: 'text-blue-400',
      borderHover: 'hover:border-blue-500/50',
      activeBorder: 'border-blue-500',
    },
    purple: {
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      icon: 'text-purple-400',
      borderHover: 'hover:border-purple-500/50',
      activeBorder: 'border-purple-500',
    },
    emerald: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      icon: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/50',
      activeBorder: 'border-emerald-500',
    },
  }[accentColor] || {
    badge: 'bg-brand-red/10 text-brand-red border-brand-red/25',
    icon: 'text-brand-red',
    borderHover: 'hover:border-brand-red/50',
    activeBorder: 'border-brand-red',
  };

  const handleFileSelection = (e, setFile) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please upload a smaller file.');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file format. Only PDF, JPG, JPEG, and PNG files are accepted.');
      e.target.value = '';
      return;
    }

    setFile(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const docs = [
    {
      id: 'aadhaar_card',
      label: 'Aadhaar Card',
      sublabel: 'Front & Back Copy (PDF / Image)',
      file: aadhaarFile,
      setFile: setAadhaarFile,
      required: !isOptional,
    },
    {
      id: 'pan_card',
      label: 'PAN Card',
      sublabel: 'Clear photograph or scanned copy',
      file: panFile,
      setFile: setPanFile,
      required: !isOptional,
    },
    {
      id: 'bank_proof',
      label: 'Bank Proof',
      sublabel: 'Cancelled Cheque, Passbook, or Statement',
      file: bankProofFile,
      setFile: setBankProofFile,
      required: !isOptional,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <Upload className={`w-4 h-4 ${accentClasses.icon}`} />
            <span>KYC & Verification Documents</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${accentClasses.badge}`}>
              {isOptional ? 'Optional at Submission' : '3 Required Documents'}
            </span>
          </div>
          <p className="text-[11px] text-brand-grey mt-0.5">
            Supported formats: PDF, JPG, JPEG, PNG (Max 10MB per document).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className={`p-3.5 rounded-2xl bg-brand-black/60 border transition-all ${
              doc.file
                ? `${accentClasses.activeBorder} bg-white/[0.02]`
                : `border-brand-border/60 ${accentClasses.borderHover}`
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-bold text-white block">
                  {doc.label} {doc.required && <span className="text-brand-red">*</span>}
                </span>
                <span className="text-[10px] text-brand-grey block mt-0.5">
                  {doc.sublabel}
                </span>
              </div>
              {doc.file ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <FileText className="w-4 h-4 text-brand-grey shrink-0 mt-0.5" />
              )}
            </div>

            {doc.file ? (
              <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">
                    {doc.file.name}
                  </div>
                  <div className="text-[10px] text-brand-grey">
                    {formatFileSize(doc.file.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => doc.setFile(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-brand-grey hover:text-brand-red transition-colors shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="mt-3 block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileSelection(e, doc.setFile)}
                  className="hidden"
                />
                <div className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-center transition-colors">
                  <span className="text-xs text-brand-lightGrey font-medium flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                  </span>
                </div>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
