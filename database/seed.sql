-- CityGuard AI - Seed Data

-- 1. Insert Departments
INSERT INTO departments (name, code) VALUES
('Encroachment Control', 'ENC'),
('Town Planning', 'TP'),
('Building Inspectorate', 'BI'),
('Public Works Department', 'PWD')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Zones
INSERT INTO zones (name, code) VALUES
('North Zone', 'NZ'),
('South Zone', 'SZ'),
('East Zone', 'EZ'),
('West Zone', 'WZ')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Wards
INSERT INTO wards (name, code, zone_id) VALUES
('Ward 1 - Green Valley', 'W1', 1),
('Ward 2 - Metro Hub', 'W2', 1),
('Ward 3 - Harbor View', 'W3', 1),
('Ward 4 - Royal Park', 'W4', 1),
('Ward 5 - Industrial Ridge', 'W5', 2),
('Ward 6 - Tech Corridor', 'W6', 2),
('Ward 7 - Lakeview Meadows', 'W7', 2),
('Ward 8 - Heritage Square', 'W8', 2),
('Ward 9 - Business District', 'W9', 3),
('Ward 10 - Sky Heights', 'W10', 3),
('Ward 11 - Riverside Crest', 'W11', 3),
('Ward 12 - Sunrise Boulevard', 'W12', 3),
('Ward 13 - Western Gate', 'W13', 4),
('Ward 14 - Clover Fields', 'W14', 4),
('Ward 15 - Whispering Pines', 'W15', 4),
('Ward 16 - Summit Point', 'W16', 4)
ON CONFLICT (zone_id, code) DO NOTHING;

-- 4. Insert Users
-- Password BCrypt Hash for 'password123' is '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW'
INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, email_verified) VALUES
('admin@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Commissioner Rajesh Kumar', '+91 98765 43210', 'admin', TRUE, TRUE),
('admin2@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'DC Sandeep Patil', '+91 98765 43219', 'admin', TRUE, TRUE),
('engineer@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Chief Engineer Anjali Sharma', '+91 98765 43211', 'engineer', TRUE, TRUE),
('officer1@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Inspector Vikram Singh', '+91 98765 43212', 'officer', TRUE, TRUE),
('officer2@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Inspector Sunita Rao', '+91 98765 43213', 'officer', TRUE, TRUE),
('officer3@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Inspector David Dsouza', '+91 98765 43214', 'officer', TRUE, TRUE),
('officer4@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Inspector Rajesh Sawant', '+91 98765 43215', 'officer', TRUE, TRUE),
('citizen1@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Amit Patel', '+91 91111 22222', 'citizen', TRUE, TRUE),
('citizen2@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'Priya Deshmukh', '+91 93333 44444', 'citizen', TRUE, TRUE),
('citizen3@cityguard.gov', '$2a$10$UNm.lbUav1TFoEQ/w/mxju1Es1uLMzkSrqRXwHRiKHCGizdjYvtHW', 'John Doe', '+91 95555 66666', 'citizen', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 5. Insert Officers details (referencing users table ids)
INSERT INTO officers (user_id, department_id, zone_id, ward_id, badge_number, availability_status) VALUES
((SELECT id FROM users WHERE email='officer1@cityguard.gov'), 1, 1, 1, 'CG-OFF-101', 'available'),
((SELECT id FROM users WHERE email='officer2@cityguard.gov'), 2, 2, 6, 'CG-OFF-102', 'available'),
((SELECT id FROM users WHERE email='officer3@cityguard.gov'), 3, 3, 9, 'CG-OFF-103', 'busy'),
((SELECT id FROM users WHERE email='officer4@cityguard.gov'), 1, 4, 13, 'CG-OFF-104', 'available')
ON CONFLICT (user_id) DO NOTHING;

-- 6. Insert Construction Categories
INSERT INTO construction_categories (name, description, severity) VALUES
('Illegal Building', 'Entire building constructed without approved plans or on unauthorized land', 'critical'),
('Road Encroachment', 'Extending compound wall, shops or building elements onto public roads/footpaths', 'high'),
('Commercial Conversion', 'Using residential zoned property for commercial shops/warehouses without permit', 'medium'),
('Extra Floor', 'Constructing more floors than approved in the sanctioned plan', 'high'),
('Setback Violation', 'Building structures within the mandatory margin space/setback limits of the plot', 'medium')
ON CONFLICT (name) DO NOTHING;

-- 7. Insert Complaints
-- Latitudes and Longitudes centered around a typical city layout (e.g. Pune/Mumbai area coordinates: lat ~ 18.5, lng ~ 73.8)
INSERT INTO complaints (complaint_number, citizen_id, description, address, latitude, longitude, ward_id, category_id, status, severity, nearby_landmark) VALUES
('CG-2026-0001', (SELECT id FROM users WHERE email='citizen1@cityguard.gov'), 
 'A complete 3-story concrete building is being constructed on a green belt agricultural area without any building permission board.', 
 'Survey No. 45, Green Valley Village Road, near Crest School', 18.520430, 73.856744, 1, 1, 'pending', 'critical', 'Crest School'),

('CG-2026-0002', (SELECT id FROM users WHERE email='citizen1@cityguard.gov'), 
 'Commercial shops are being set up on the ground floor of a residential building. Traffic blockage due to construction materials parked on the footpath.', 
 'Row House 12, Metro Hub Main Road', 18.529220, 73.844111, 2, 3, 'under_review', 'medium', 'Metro Station Gate 2'),

('CG-2026-0003', (SELECT id FROM users WHERE email='citizen2@cityguard.gov'), 
 'The builder of Imperial Heights has constructed a 6th floor, whereas the approval board shows permission only up to 5 floors.', 
 'Imperial Heights, Plot 108, Tech Corridor Phase 1', 18.508922, 73.792518, 6, 4, 'assigned', 'high', 'IT Park circle'),

('CG-2026-0004', (SELECT id FROM users WHERE email='citizen3@cityguard.gov'), 
 'Compound wall construction has encroached onto the public footpath by at least 4 feet, blocking pedestrian path.', 
 '15, Lakeview Meadows Road, opposite Joggers Park', 18.496510, 73.818310, 7, 2, 'inspected', 'high', 'Joggers Park'),

('CG-2026-0005', (SELECT id FROM users WHERE email='citizen2@cityguard.gov'), 
 'New concrete structure constructed directly touching the adjacent building wall, violating the standard 3-meter setback limit.', 
 'Bunglow 42, Sunrise Boulevard Sector 3', 18.552100, 73.882400, 12, 5, 'verified', 'medium', 'Sunrise Temple'),

('CG-2026-0006', (SELECT id FROM users WHERE email='citizen3@cityguard.gov'), 
 'Illegal store shed built over the public drain, blocking municipal cleaning access.', 
 'Clover Fields Market, Shop 18 Area', 18.538100, 73.763100, 14, 2, 'resolved', 'medium', 'Vegetable Market')
ON CONFLICT (complaint_number) DO NOTHING;

-- 8. Insert Complaint Images (Placeholder paths for simulation, will resolve dynamically in backend uploads)
INSERT INTO complaint_images (complaint_id, file_path, file_size, file_type) VALUES
(1, '/uploads/complaint_1.jpg', 1048576, 'image/jpeg'),
(2, '/uploads/complaint_2.jpg', 1572864, 'image/jpeg'),
(3, '/uploads/complaint_3.jpg', 2097152, 'image/jpeg'),
(4, '/uploads/complaint_4.jpg', 838860, 'image/jpeg'),
(5, '/uploads/complaint_5.jpg', 1258291, 'image/jpeg'),
(6, '/uploads/complaint_6.jpg', 943718, 'image/jpeg')
ON CONFLICT (id) DO NOTHING;

-- 9. Insert AI Analysis for complaints
INSERT INTO ai_analysis (complaint_id, image_id, prediction_label, confidence_score, recommendation, raw_response) VALUES
(1, 1, 'Illegal Building', 94.50, 'High probability of illegal land use. Recommend immediate halt order as building is in agricultural zone.', '{"status": "success", "detections": ["building", "greenbelt"], "confidence": 0.945}'),
(2, 2, 'Commercial Conversion', 81.20, 'Commercial shutters detected in residential zone. Verify zone classification and permissions.', '{"status": "success", "detections": ["shutters", "signboard"], "confidence": 0.812}'),
(3, 3, 'Extra Floor', 88.90, 'Floor count (6 floors) exceeds predicted average height for sanctioned plans in area. Compare with master approvals.', '{"status": "success", "detections": ["floors", "height"], "confidence": 0.889}'),
(4, 4, 'Road Encroachment', 76.40, 'Compound boundary exceeds layout guidelines. Cross-check municipal road width.', '{"status": "success", "detections": ["wall", "footpath"], "confidence": 0.764}'),
(5, 5, 'Setback Violation', 72.80, 'Proximity to adjacent structure is less than 1.5 meters. Verify sanctioned setback margin.', '{"status": "success", "detections": ["gap", "setback"], "confidence": 0.728}'),
(6, 6, 'Road Encroachment', 85.00, 'Temporary structure built on public drainage line. Recommend clearing order.', '{"status": "success", "detections": ["shed", "drainage"], "confidence": 0.850}')
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Assignments
INSERT INTO officer_assignments (complaint_id, officer_id, assigned_by, status, remarks) VALUES
(3, (SELECT id FROM officers WHERE user_id=(SELECT id FROM users WHERE email='officer1@cityguard.gov')), (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'assigned', 'Verify the floor count of Imperial Heights and verify with the blueprint approved in 2024.'),
(4, (SELECT id FROM officers WHERE user_id=(SELECT id FROM users WHERE email='officer2@cityguard.gov')), (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'completed', 'Check if the boundary wall extends beyond the property line onto the footpath.'),
(5, (SELECT id FROM officers WHERE user_id=(SELECT id FROM users WHERE email='officer1@cityguard.gov')), (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'completed', 'Verify the gap between the buildings. Take photos of the narrow setback.')
ON CONFLICT (id) DO NOTHING;

-- 11. Insert Inspection Reports
INSERT INTO inspection_reports (assignment_id, officer_id, findings, recommendation, status_update, latitude, longitude) VALUES
(2, (SELECT id FROM officers WHERE user_id=(SELECT id FROM users WHERE email='officer2@cityguard.gov')), 
 'Conducted inspection on site. The boundary wall has indeed been extended by 4.2 feet onto the public footpath, making it impassable for pedestrians.', 
 'Demolition of the extended part of the boundary wall is required to clear the footpath.', 'verified', 18.496515, 73.818305),
(3, (SELECT id FROM officers WHERE user_id=(SELECT id FROM users WHERE email='officer1@cityguard.gov')), 
 'Inspected Bunglow 42. The side margin (setback) is only 0.8 meters, which is a clear violation of the 3-meter municipal requirement.', 
 'Levy penalty and issue rectification notice to maintain standard margin.', 'verified', 18.552098, 73.882410)
ON CONFLICT (id) DO NOTHING;

-- 12. Insert Status History
INSERT INTO complaint_status_history (complaint_id, status, updated_by, remarks) VALUES
(1, 'pending', (SELECT id FROM users WHERE email='citizen1@cityguard.gov'), 'Complaint registered online.'),
(2, 'pending', (SELECT id FROM users WHERE email='citizen1@cityguard.gov'), 'Complaint registered online.'),
(2, 'under_review', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Reviewing building layout blueprint.'),
(3, 'pending', (SELECT id FROM users WHERE email='citizen2@cityguard.gov'), 'Complaint registered online.'),
(3, 'under_review', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Preliminary check on approvals.'),
(3, 'assigned', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Assigned to Inspector Vikram Singh for site verification.'),
(4, 'pending', (SELECT id FROM users WHERE email='citizen3@cityguard.gov'), 'Complaint registered online.'),
(4, 'under_review', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Assigned to officer.'),
(4, 'assigned', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Assigned to Inspector Sunita Rao.'),
(4, 'inspected', (SELECT id FROM users WHERE email='officer2@cityguard.gov'), 'Completed site inspection and uploaded evidence.'),
(5, 'pending', (SELECT id FROM users WHERE email='citizen2@cityguard.gov'), 'Complaint registered online.'),
(5, 'under_review', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Reviewing setback limits.'),
(5, 'assigned', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Assigned to Inspector Vikram.'),
(5, 'inspected', (SELECT id FROM users WHERE email='officer1@cityguard.gov'), 'Inspection report uploaded.'),
(5, 'verified', (SELECT id FROM users WHERE email='engineer@cityguard.gov'), 'Approved inspection findings. Setback violation confirmed.'),
(6, 'resolved', (SELECT id FROM users WHERE email='admin@cityguard.gov'), 'Illegal store shed demolished and public drain cleared. Case closed.')
ON CONFLICT (id) DO NOTHING;

-- 13. System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('MAX_UPLOAD_SIZE_MB', '25', 'Maximum allowed file size upload in Megabytes'),
('AI_AUTO_ASSIGN', 'false', 'Enable auto-assignment of complaints based on AI severity rating'),
('NOTIFICATION_SMS_ENABLED', 'false', 'Send SMS alert notifications to officers and citizens'),
('NOTIFICATION_EMAIL_ENABLED', 'true', 'Send email updates to stakeholders')
ON CONFLICT (setting_key) DO NOTHING;
