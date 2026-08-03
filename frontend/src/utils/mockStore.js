// Central Mock Data Store for Standalone / Client-Only Mode

export const INITIAL_MOCK_COMPLAINTS = [
  {
    id: 101,
    complaint_number: 'CG-2026-00101',
    description: 'Unauthorized 4th floor construction without sanctioned structural drawings or setback space.',
    address: 'Plot 42, Green Valley Main Road',
    latitude: 18.5204,
    longitude: 73.8567,
    ward_id: 1,
    ward_name: 'Ward 1 - Green Valley',
    category_name: 'Illegal Floor Construction',
    severity: 'critical',
    status: 'pending',
    citizen_name: 'Amit Patel',
    citizen_email: 'citizen1@cityguard.gov',
    created_at: '2026-07-28T10:30:00Z',
    nearby_landmark: 'Near Green Valley Public School',
    ai_predicted_label: 'Illegal Floor Addition',
    ai_confidence: 94.5,
    ai_recommendation: 'Immediate cease work notice recommended. Exceeds FSI ratio.',
    assigned_officer_name: null,
    inspection_report: null
  },
  {
    id: 102,
    complaint_number: 'CG-2026-00102',
    description: 'Commercial shop extending 8 feet onto public footpath blocking pedestrian movement.',
    address: 'Shop 14, Metro Hub Complex',
    latitude: 18.5312,
    longitude: 73.8445,
    ward_id: 2,
    ward_name: 'Ward 2 - Metro Hub',
    category_name: 'Footpath Encroachment',
    severity: 'high',
    status: 'under_review',
    citizen_name: 'Priya Deshmukh',
    citizen_email: 'citizen2@cityguard.gov',
    created_at: '2026-07-29T14:15:00Z',
    nearby_landmark: 'Opposite Metro Station Gate 2',
    ai_predicted_label: 'Pedestrian Encroachment',
    ai_confidence: 91.2,
    ai_recommendation: 'Encroachment on municipal right of way.',
    assigned_officer_name: 'Inspector Vikram Singh',
    inspection_report: null
  },
  {
    id: 103,
    complaint_number: 'CG-2026-00103',
    description: 'Building foundation constructed directly over public drainage line.',
    address: 'Sector 4, Harbor View Road',
    latitude: 18.5140,
    longitude: 73.8620,
    ward_id: 3,
    ward_name: 'Ward 3 - Harbor View',
    category_name: 'Drainage Block Encroachment',
    severity: 'critical',
    status: 'assigned',
    citizen_name: 'Amit Patel',
    citizen_email: 'citizen1@cityguard.gov',
    created_at: '2026-07-30T09:00:00Z',
    nearby_landmark: 'Behind Harbor Heights',
    ai_predicted_label: 'Drainage Line Obstruction',
    ai_confidence: 96.0,
    ai_recommendation: 'High flood hazard. Dispatch field inspector immediately.',
    assigned_officer_name: 'Inspector Vikram Singh',
    assignment_status: 'assigned',
    inspection_report: null
  },
  {
    id: 104,
    complaint_number: 'CG-2026-00104',
    description: 'Temporary tin shed commercial hotel erected without permission on reserved playground land.',
    address: 'Corner Plot, Tech Corridor',
    latitude: 18.5400,
    longitude: 73.8300,
    ward_id: 4,
    ward_name: 'Ward 6 - Tech Corridor',
    category_name: 'Unauthorized Commercial Shed',
    severity: 'critical',
    status: 'inspected',
    citizen_name: 'John Doe',
    citizen_email: 'citizen3@cityguard.gov',
    created_at: '2026-08-01T11:45:00Z',
    nearby_landmark: 'Next to IT Park Gate 1',
    ai_predicted_label: 'Illegal Commercial Shed',
    ai_confidence: 92.4,
    ai_recommendation: 'Land reserved for public park.',
    assigned_officer_name: 'Inspector Vikram Singh',
    assignment_status: 'assigned',
    inspection_report: {
      findings: 'Verified on site. Tin shed structure built without permits.',
      recommendation: 'Issue demolition order.',
      inspected_at: '2026-08-02T10:00:00Z'
    }
  },
  {
    id: 105,
    complaint_number: 'CG-2026-00105',
    description: 'Encroachment fence removed and setback restored according to municipal norms.',
    address: 'Block B, Business District',
    latitude: 18.5250,
    longitude: 73.8500,
    ward_id: 5,
    ward_name: 'Ward 9 - Business District',
    category_name: 'Setback Violation',
    severity: 'medium',
    status: 'resolved',
    citizen_name: 'Amit Patel',
    citizen_email: 'citizen1@cityguard.gov',
    created_at: '2026-08-02T16:20:00Z',
    nearby_landmark: 'Near City Bank Branch',
    ai_predicted_label: 'Setback Encroachment',
    ai_confidence: 89.1,
    ai_recommendation: 'Resolved.',
    assigned_officer_name: 'Inspector Sunita Rao',
    inspection_report: {
      findings: 'Owner voluntarily cleared unauthorized fence.',
      recommendation: 'Close complaint.',
      inspected_at: '2026-08-03T11:00:00Z'
    }
  }
];

export const MOCK_WARDS = [
  { id: 1, name: 'Ward 1 - Green Valley' },
  { id: 2, name: 'Ward 2 - Metro Hub' },
  { id: 3, name: 'Ward 3 - Harbor View' },
  { id: 4, name: 'Ward 6 - Tech Corridor' },
  { id: 5, name: 'Ward 9 - Business District' },
  { id: 6, name: 'Ward 13 - Western Gate' }
];

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Illegal Building / Floor Addition' },
  { id: 2, name: 'Footpath / Road Encroachment' },
  { id: 3, name: 'Setback / Boundary Deviation' },
  { id: 4, name: 'Unauthorized Commercial Shed' },
  { id: 5, name: 'Drainage / Utility Obstruction' }
];

export function getStoredComplaints() {
  const saved = localStorage.getItem('cityguard_complaints');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('cityguard_complaints', JSON.stringify(INITIAL_MOCK_COMPLAINTS));
  return INITIAL_MOCK_COMPLAINTS;
}

export function saveComplaintToStore(newComplaint) {
  const current = getStoredComplaints();
  const updated = [newComplaint, ...current];
  localStorage.setItem('cityguard_complaints', JSON.stringify(updated));
  return updated;
}

export function updateComplaintInStore(id, updates) {
  const current = getStoredComplaints();
  const updated = current.map(c => String(c.id) === String(id) ? { ...c, ...updates } : c);
  localStorage.setItem('cityguard_complaints', JSON.stringify(updated));
  return updated;
}
