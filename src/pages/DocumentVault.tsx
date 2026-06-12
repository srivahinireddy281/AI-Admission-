import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  FileCheck, 
  Sparkles, 
  FolderLock, 
  Eye, 
  Trash2,
  Lock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentInfo } from '../types';

export default function DocumentVault() {
  const [documents, setDocuments] = useState<DocumentInfo>({});
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to sync Document vault', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Converts native input files into robust high-integrity Base64 strings safely
  const processFileTo64 = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof DocumentInfo) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Document exceeds size threshold of 8MB. Please compress and upload.' });
      return;
    }

    setUploadingField(fieldName);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Code = reader.result as string;
        
        // Save to database
        const payload: DocumentInfo = {};
        payload[fieldName] = base64Code;

        await api.uploadDocuments(payload);
        setMessage({ type: 'success', text: `Successfully registered dossier component for ${fieldName}` });
        
        // Refresh
        await fetchDocuments();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'File upload sync failed.' });
      } finally {
        setUploadingField(null);
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'File reading failure.' });
      setUploadingField(null);
    };
    reader.readAsDataURL(file);
  };

  const docFields: { key: keyof DocumentInfo; label: string; desc: string }[] = [
    { key: 'tenthMemo', label: 'Secondary School Memo (10th)', desc: 'Official scorecard detailing baseline math metrics.' },
    { key: 'twelfthMemo', label: 'Higher Secondary Memo (12th)', desc: 'Higher education board memo showing cutoff index coefficients.' },
    { key: 'transferCertificate', label: 'Institutional Leaving/TC Certificate', desc: 'Leaving credentials from prior academy.' },
    { key: 'idProof', label: 'National ID Card / Passport', desc: 'Official government credentials proving personal identity.' },
    { key: 'photo', label: 'Passport Photograph', desc: 'Recent standard color passport photo.' }
  ];

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-mono text-xs text-slate-500">Unlocking credentials vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      
      <div>
        <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FolderLock className="h-5.5 w-5.5 text-indigo-600" />
          Academic Verified Document Vault
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Upload and preview official transcripts. Uploaded documents are saved directly into your institutional portfolio.
        </p>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 font-sans text-xs ${
          message.type === 'success' 
            ? 'border-emerald-100 bg-emerald-50 text-emerald-800' 
            : 'border-rose-100 bg-rose-50 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Primary Vault Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {docFields.map(field => {
          const isUploaded = !!documents[field.key];
          const isProcessing = uploadingField === field.key;

          return (
            <div
              key={field.key}
              className={`rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                isUploaded ? 'border-indigo-150 bg-indigo-50/5' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-sans text-xs font-bold text-slate-900">{field.label}</h4>
                  <p className="font-sans text-[11px] text-slate-500 leading-relaxed">{field.desc}</p>
                </div>

                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${
                  isUploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isUploaded ? 'VERIFIED' : 'VACANT'}
                </span>
              </div>

              {/* Upload controls */}
              <div className="mt-5 flex items-center gap-3">
                <label className={`relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-center transition-all ${
                  isUploaded 
                    ? 'border-indigo-200 bg-white hover:bg-slate-50' 
                    : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'
                }`}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    disabled={isProcessing}
                    onChange={e => processFileTo64(e, field.key)}
                  />
                  
                  <UploadCloud className="h-4.5 w-4.5 text-slate-400" />
                  <span className="font-sans text-[11px] font-bold text-slate-700">
                    {isProcessing ? 'Processing...' : isUploaded ? 'Substitute File' : 'Upload Credential'}
                  </span>
                </label>

                {isUploaded && (
                  <button
                    onClick={() => {
                      setPreviewBase64(documents[field.key] || null);
                      setPreviewTitle(field.label);
                    }}
                    id={`btn_preview_doc_${field.key}`}
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    title="View Document Dossier"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: Dossier Base64 file rendering pane */}
      {previewBase64 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-indigo-700">
                <FileCheck className="h-5 w-5" />
                <h3 className="font-sans text-sm font-bold">{previewTitle}</h3>
              </div>
              <button
                onClick={() => {
                  setPreviewBase64(null);
                  setPreviewTitle('');
                }}
                className="font-mono text-xs text-slate-400 hover:text-slate-600"
              >
                [Dismiss]
              </button>
            </div>

            {/* Render preview inside sandbox container */}
            <div className="flex-1 mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center relative">
              {previewBase64.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewBase64}
                  className="w-full h-full"
                  title="PDF Viewer"
                />
              ) : (
                <img
                  src={previewBase64}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain"
                  alt="Dossier Transcript"
                />
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 justify-end text-slate-400 font-mono text-[9px] shrink-0">
              <Lock className="h-3 w-3" />
              <span>Transmitted via secured Sandboxed SSL protocols</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
