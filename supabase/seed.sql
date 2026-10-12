-- =============================================================================
-- QueUA seed data — service catalog (PRD §4) + sample counters (FR-4.1).
-- Idempotent: safe to re-run. Fees are transcribed exactly from App_PRD.md §4.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Category A — Paid Document Requests & Authentications (DOC-)
-- ---------------------------------------------------------------------------
insert into public.services
  (code, name, category, base_fee, requires_docstamp, docstamp_fee, is_per_page)
values
  ('DOC_CERT',      'Certifications (Enrollment, Grades, GWA, Graduation, Medium of Instruction, Transfer, Units Earned)', 'CREDENTIAL_DOCUMENT', 25.00, false, 0.00, false),
  ('DOC_AUTH_SET',  'Authentication (Set – OTR / Diploma)',                 'CREDENTIAL_DOCUMENT', 25.00, false, 0.00, false),
  ('DOC_AUTH_CERT', 'Authentication (Certifications, etc.)',                'CREDENTIAL_DOCUMENT', 25.00, false, 0.00, false),
  ('DOC_CAV_LOC',   'CAV (Local)',                                          'CREDENTIAL_DOCUMENT', 25.00, false, 0.00, false),
  ('DOC_CAV_APO',   'CAV (Apostille)',                                      'CREDENTIAL_DOCUMENT', 75.00, false, 0.00, false),
  ('DOC_DIP_DUP',   '2nd Copy of Diploma',                                  'CREDENTIAL_DOCUMENT', 50.00, true,  30.00, false),
  ('DOC_F137',      'Permanent Record (Form 137 / 137-A)',                  'CREDENTIAL_DOCUMENT', 50.00, false, 0.00, false),
  ('DOC_OTR',       'Official Transcript of Record (OTR)',                  'CREDENTIAL_DOCUMENT', 50.00, true,  30.00, true)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Category B — Paid Academic & Enrollment Adjustments (ENR-)
-- ---------------------------------------------------------------------------
insert into public.services
  (code, name, category, base_fee, requires_docstamp, docstamp_fee, is_per_page)
values
  ('ENR_CAD',     'Changing, Adding, Dropping Form', 'ENROLLMENT_CHANGE', 50.00, false, 0.00, false),
  ('ENR_COMP',    'Completion Form',                 'ENROLLMENT_CHANGE', 50.00, false, 0.00, false),
  ('ENR_SPEC_EX', 'Special Examination Permit',      'ENROLLMENT_CHANGE', 50.00, false, 0.00, false)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Category C — Non-Fee Academic Submissions & Evaluations (ADM-)
-- Codes are assigned here (PRD §4 lists names only). base_fee = 0.
-- ---------------------------------------------------------------------------
insert into public.services
  (code, name, category, base_fee, requires_docstamp, docstamp_fee, is_per_page)
values
  ('ADM_CORR',     'Application for Correction of Entries in School Records',                  'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_GRAD',     'Application for Graduation',                                               'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_LOA',      'Application for Leave of Absence (LOA)',                                   'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_OPEN',     'Application for Opening of Subjects',                                      'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_OVERLOAD', 'Application for Overloading of Units',                                     'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_SHIFT',    'Application for Shifting / Program Change',                                'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_SUBST',    'Application for Substitution of Subjects',                                 'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_SIMUL',    'Application for Taking Simultaneously Pre-requisite and Advance Subject',  'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_COMPLAINT','Complaints and Grievance Form',                                            'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_EQUIV',    'Equivalency Application Form',                                             'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_CLEAR',    'Final Clearance',                                                          'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_CROSS',    'Permit to Cross Enroll',                                                   'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false),
  ('ADM_WITHDRAW', 'Withdrawal of Registration Form',                                          'ADMINISTRATIVE_FORM', 0.00, false, 0.00, false)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Sample counters (FR-4.1 example windows).
-- ---------------------------------------------------------------------------
insert into public.counters (counter_number, label_name, status, allowed_categories)
values
  (1, 'Window 1: OTR & Diplomas',       'OPEN', '{CREDENTIAL_DOCUMENT}'),
  (2, 'Window 2: Enrollment Forms',     'OPEN', '{ENROLLMENT_CHANGE}'),
  (3, 'Window 3: Clearances & Records', 'OPEN', '{ADMINISTRATIVE_FORM}')
on conflict (counter_number) do nothing;

-- ---------------------------------------------------------------------------
-- Modules (default feature groupings). Admin can add/rename/reassign via UI.
-- ---------------------------------------------------------------------------
insert into public.modules (code, name, description)
values
  ('CREDENTIALS',  'Credentials',  'Transcripts, diplomas, certifications & authentications'),
  ('ENROLLMENT',   'Enrollment',   'Changing/adding/dropping, completion, special exam permits'),
  ('APPLICATIONS', 'Applications', 'Student application forms (graduation, shifting, LOA, etc.)'),
  ('CLEARANCES',   'Clearances',   'Final clearance and withdrawal of registration')
on conflict (code) do nothing;

-- Map services into modules.
-- CREDENTIALS = all CREDENTIAL_DOCUMENT services; ENROLLMENT = all ENROLLMENT_CHANGE.
insert into public.module_services (module_id, service_id)
select m.id, s.id
from public.modules m
join public.services s on s.category = 'CREDENTIAL_DOCUMENT'
where m.code = 'CREDENTIALS'
on conflict do nothing;

insert into public.module_services (module_id, service_id)
select m.id, s.id
from public.modules m
join public.services s on s.category = 'ENROLLMENT_CHANGE'
where m.code = 'ENROLLMENT'
on conflict do nothing;

-- APPLICATIONS = the "Application for ..." forms + equivalency/cross-enroll/complaints.
insert into public.module_services (module_id, service_id)
select m.id, s.id
from public.modules m
join public.services s on s.code in (
  'ADM_CORR','ADM_GRAD','ADM_LOA','ADM_OPEN','ADM_OVERLOAD','ADM_SHIFT',
  'ADM_SUBST','ADM_SIMUL','ADM_EQUIV','ADM_CROSS','ADM_COMPLAINT'
)
where m.code = 'APPLICATIONS'
on conflict do nothing;

-- CLEARANCES = final clearance + withdrawal.
insert into public.module_services (module_id, service_id)
select m.id, s.id
from public.modules m
join public.services s on s.code in ('ADM_CLEAR','ADM_WITHDRAW')
where m.code = 'CLEARANCES'
on conflict do nothing;

-- Assign modules to the sample counters (mirrors the original routing).
insert into public.counter_modules (counter_id, module_id, access_level)
select c.id, m.id, 'WRITE'::public.access_level
from public.counters c
join public.modules m on (
  (c.counter_number = 1 and m.code = 'CREDENTIALS') or
  (c.counter_number = 2 and m.code = 'ENROLLMENT') or
  (c.counter_number = 3 and m.code in ('APPLICATIONS','CLEARANCES'))
)
on conflict (counter_id, module_id) do nothing;
