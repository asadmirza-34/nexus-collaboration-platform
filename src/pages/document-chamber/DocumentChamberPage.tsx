import React, { useMemo, useRef, useState } from 'react';
import { FileText, Upload, Trash2, Eye, PenLine, RefreshCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useDropzone } from 'react-dropzone';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentChamberStore } from '../../features/documentChamber/store';
import { ChamberDocument, DocumentChamberStatus } from '../../features/documentChamber/types';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function statusBadge(status: DocumentChamberStatus) {
  if (status === 'draft') return <Badge variant="gray">Draft</Badge>;
  if (status === 'in_review') return <Badge variant="warning">In Review</Badge>;
  return <Badge variant="success">Signed</Badge>;
}

export const DocumentChamberPage: React.FC = () => {
  const { user } = useAuth();
  const store = useDocumentChamberStore();
  const sigRef = useRef<SignatureCanvas | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [uiError, setUiError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selected = useMemo(
    () => store.state.documents.find(d => d.id === selectedId) ?? null,
    [selectedId, store.state.documents]
  );

  const docsForUser = useMemo(() => {
    if (!user) return [];
    return store.state.documents.filter(d => d.ownerId === user.id);
  }, [store.state.documents, user]);

  const onDrop = async (files: File[]) => {
    if (!user) return;
    setUiError(null);
    const file = files[0];
    if (!file) return;

    // keep mock persistence safe: large data URLs can exceed localStorage
    const maxBytes = 4 * 1024 * 1024; // 4MB file size cap for demo
    if (file.size > maxBytes) {
      setUiError('File is too large for the mock Document Chamber (max 4MB).');
      return;
    }

    setIsUploading(true);
    try {
      const doc = await store.addDocument({ ownerId: user.id, file });
      setSelectedId(doc.id);
      setNotesDraft(doc.notes ?? '');
    } catch {
      setUiError('Upload failed. Please try a smaller file.');
    } finally {
      setIsUploading(false);
    }
  };

  const dropzone = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleSelect = (doc: ChamberDocument) => {
    setSelectedId(doc.id);
    setNotesDraft(doc.notes ?? '');
    sigRef.current?.clear();
  };

  const saveNotes = () => {
    if (!selected) return;
    store.updateNotes(selected.id, notesDraft);
  };

  const signSelected = () => {
    if (!selected) return;
    const canvas = sigRef.current;
    if (!canvas || canvas.isEmpty()) {
      setUiError('Please add a signature before signing.');
      return;
    }
    const dataUrl = canvas.getTrimmedCanvas().toDataURL('image/png');
    store.attachSignature(selected.id, dataUrl);
    setUiError(null);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, review, and sign deal documents (frontend mock)</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gray">{docsForUser.length} docs</Badge>
        </div>
      </div>

      {uiError && (
        <div className="rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          {uiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Your documents</h2>
            <Badge variant="gray" size="sm">Mock</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <div
              {...dropzone.getRootProps()}
              className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
                dropzone.isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input {...dropzone.getInputProps()} />
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-md">
                  <Upload size={18} className="text-primary-700" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Upload a document</div>
                  <div className="text-sm text-gray-600">
                    Drag & drop PDF/DOC/DOCX (max 4MB) — stored in localStorage for demo.
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" isLoading={isUploading} disabled={isUploading}>
                  Choose file
                </Button>
              </div>
            </div>

            {docsForUser.length === 0 ? (
              <p className="text-sm text-gray-600">No documents yet. Upload a deal/contract to start.</p>
            ) : (
              <div className="space-y-2">
                {docsForUser.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelect(doc)}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      selectedId === doc.id ? 'border-primary-200 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 truncate">{doc.name}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatBytes(doc.sizeBytes)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      {statusBadge(doc.status)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-gray-900">Preview & workflow</h2>
              {selected && statusBadge(selected.status)}
            </div>
            {selected && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => {
                    store.removeDocument(selected.id);
                    setSelectedId(null);
                    setNotesDraft('');
                    sigRef.current?.clear();
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </CardHeader>
          <CardBody className="space-y-6">
            {!selected ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                Select a document to preview, set status, and sign.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye size={18} className="text-gray-600" />
                        <h3 className="text-sm font-medium text-gray-900">Preview</h3>
                      </div>
                      <Badge variant="gray" size="sm">{selected.mimeType || 'file'}</Badge>
                    </CardHeader>
                    <CardBody>
                      {selected.mimeType === 'application/pdf' ? (
                        <object
                          data={selected.fileDataUrl}
                          type="application/pdf"
                          className="w-full h-[420px] rounded-md border border-gray-200"
                        >
                          <div className="text-sm text-gray-600">
                            Preview not supported. Download and open locally.
                          </div>
                        </object>
                      ) : (
                        <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-600">
                          DOC/DOCX preview is limited in-browser. You can still manage status and signatures.
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <h3 className="text-sm font-medium text-gray-900">Status</h3>
                    </CardHeader>
                    <CardBody className="space-y-2">
                      <Button
                        variant={selected.status === 'draft' ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth
                        onClick={() => store.setStatus(selected.id, 'draft')}
                      >
                        Draft
                      </Button>
                      <Button
                        variant={selected.status === 'in_review' ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth
                        onClick={() => store.setStatus(selected.id, 'in_review')}
                      >
                        In Review
                      </Button>
                      <Button
                        variant={selected.status === 'signed' ? 'success' : 'outline'}
                        size="sm"
                        fullWidth
                        disabled={selected.status !== 'signed'}
                      >
                        Signed
                      </Button>
                      {selected.signedAt && (
                        <div className="pt-2 text-xs text-gray-500">
                          Signed {new Date(selected.signedAt).toLocaleString()}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm">
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PenLine size={18} className="text-gray-600" />
                        <h3 className="text-sm font-medium text-gray-900">Signature</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<RefreshCcw size={16} />}
                          onClick={() => sigRef.current?.clear()}
                        >
                          Clear
                        </Button>
                        <Button size="sm" variant="success" onClick={signSelected}>
                          Sign
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-3">
                      <div className="rounded-md border border-gray-200 overflow-hidden">
                        <SignatureCanvas
                          ref={ref => {
                            sigRef.current = ref;
                          }}
                          penColor="#111827"
                          canvasProps={{ width: 520, height: 180, className: 'w-full h-[180px] bg-white' }}
                        />
                      </div>
                      {selected.signatureDataUrl && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-700">Saved signature</div>
                          <img
                            src={selected.signatureDataUrl}
                            alt="Signature"
                            className="h-20 w-auto rounded-md border border-gray-200 bg-white"
                          />
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Signing sets status to <span className="font-medium">Signed</span> automatically (mock).
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <h3 className="text-sm font-medium text-gray-900">Notes</h3>
                    </CardHeader>
                    <CardBody className="space-y-3">
                      <Input
                        label="Internal notes"
                        value={notesDraft}
                        onChange={e => setNotesDraft(e.target.value)}
                        fullWidth
                      />
                      <Button variant="outline" onClick={saveNotes}>
                        Save notes
                      </Button>
                      <div className="text-xs text-gray-500">
                        Use notes for review feedback, deal terms, or reminders (stored locally).
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

