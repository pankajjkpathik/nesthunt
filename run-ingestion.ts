import { ingestProjectEvidence } from './src/lib/ingest-evidence.functions.ts';

const batch: any[] = [
  // Gardenia Floors
  {
    projectSlug: 'gardenia-floors',
    reraNumber: 'PBRERA-SAS80-PR0839',
    evidenceType: 'RERA_PROGRESS_UPDATE',
    sourceTitle: 'RERA QPR JUN 2025',
    publishedDate: '2025-06-05',
    remarks: 'Official historical update: 38.42% construction progress as per disclosure.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  // Celestia Family
  {
    projectSlug: 'celestia-royal-2',
    reraNumber: 'PBRERA-SAS80-PR0885',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0885)',
    remarks: 'Verified official registration record for PR0885.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  {
    projectSlug: 'celestia-royal-2b',
    reraNumber: 'PBRERA-SAS80-PR0883',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0883)',
    remarks: 'Verified official registration record for PR0883.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  {
    projectSlug: 'celestia-royal-2c',
    reraNumber: 'PBRERA-SAS80-PR0884',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0884)',
    remarks: 'Verified official registration record for PR0884.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  // Omaxe The Lake
  {
    projectSlug: 'omaxe-the-lake',
    reraNumber: 'PBRERA-SAS80-PR0041',
    evidenceType: 'OFFICIAL_COMPLETION_OR_OCCUPANCY_UPDATE',
    sourceTitle: 'OFFICIAL REGULATORY COMPLETION UPDATE',
    remarks: 'Official regulatory update identified in R.1. Phase-specific completion information verified.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  // Muirwoods Family
  {
    projectSlug: 'muirwoods-ecocity-extension-1',
    reraNumber: 'PBRERA-SAS80-PR0905',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0905)',
    remarks: 'Verified official registration record for PR0905.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  {
    projectSlug: 'muirwoods-ecocity-extension-1-pocket-b',
    reraNumber: 'PBRERA-SAS80-PR0904',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0904)',
    remarks: 'Verified official registration record for PR0904.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  {
    projectSlug: 'muirwoods-ecocity-extension-1-pocket-c',
    reraNumber: 'PBRERA-SAS80-PR0902',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0902)',
    remarks: 'Verified official registration record for PR0902.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  {
    projectSlug: 'muirwoods-ecocity-extension-1-pocket-f',
    reraNumber: 'PBRERA-SAS80-PR0906',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0906)',
    remarks: 'Verified official registration record for PR0906.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  {
    projectSlug: 'muirwoods-ecocity-extension-2-pocket-d',
    reraNumber: 'PBRERA-SAS80-PR0912',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0912)',
    remarks: 'Verified official registration record for PR0912.',
    confidence: 'high',
    verificationStatus: 'verified'
  },
  {
    projectSlug: 'muirwoods-ecocity-extension-2-pocket-e',
    reraNumber: 'PBRERA-SAS80-PR0913',
    evidenceType: 'RERA_REGISTRATION',
    sourceTitle: 'OFFICIAL RERA REGISTRATION (PR0913)',
    remarks: 'Verified official registration record for PR0913.',
    confidence: 'high',
    verificationStatus: 'verified'
  }
];

async function run() {
  try {
    const results = await ingestProjectEvidence(batch);
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  }
}

run();
