import { useMemo } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { ChamberDocument, DocumentChamberState, DocumentChamberStatus } from './types';

const DOC_CHAMBER_STORAGE_KEY = 'business_nexus_document_chamber_v1';

function createId() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cryptoAny = crypto as any;
  if (typeof cryptoAny?.randomUUID === 'function') return cryptoAny.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const emptyState: DocumentChamberState = { documents: [] };

export function useDocumentChamberStore() {
  const [state, setState] = useLocalStorageState<DocumentChamberState>(DOC_CHAMBER_STORAGE_KEY, emptyState);

  const api = useMemo(() => {
    const addDocument = async (input: {
      ownerId: string;
      file: File;
      initialStatus?: DocumentChamberStatus;
    }) => {
      const fileDataUrl = await readFileAsDataUrl(input.file);
      const doc: ChamberDocument = {
        id: createId(),
        ownerId: input.ownerId,
        name: input.file.name,
        mimeType: input.file.type || 'application/octet-stream',
        sizeBytes: input.file.size,
        uploadedAt: new Date().toISOString(),
        status: input.initialStatus ?? 'draft',
        fileDataUrl,
      };
      setState(prev => ({ ...prev, documents: [doc, ...prev.documents] }));
      return doc;
    };

    const setStatus = (documentId: string, status: DocumentChamberStatus) => {
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(d => (d.id === documentId ? { ...d, status } : d)),
      }));
    };

    const attachSignature = (documentId: string, signatureDataUrl: string) => {
      const now = new Date().toISOString();
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(d =>
          d.id === documentId
            ? { ...d, signatureDataUrl, status: 'signed', signedAt: now }
            : d
        ),
      }));
    };

    const updateNotes = (documentId: string, notes: string) => {
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(d => (d.id === documentId ? { ...d, notes } : d)),
      }));
    };

    const removeDocument = (documentId: string) => {
      setState(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== documentId) }));
    };

    const reset = () => setState(emptyState);

    return { state, addDocument, setStatus, attachSignature, updateNotes, removeDocument, reset };
  }, [setState, state]);

  return api;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

