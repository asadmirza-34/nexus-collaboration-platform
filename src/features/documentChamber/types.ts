export type DocumentChamberStatus = 'draft' | 'in_review' | 'signed';

export interface ChamberDocument {
  id: string;
  ownerId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string; // ISO
  status: DocumentChamberStatus;
  // Stored as data URL for mock persistence (small demo files recommended)
  fileDataUrl: string;
  // Signature captured as PNG data URL
  signatureDataUrl?: string;
  signedAt?: string; // ISO
  notes?: string;
}

export interface DocumentChamberState {
  documents: ChamberDocument[];
}

