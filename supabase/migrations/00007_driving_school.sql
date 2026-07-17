-- ============================================================
-- CoopERP: Migration 00007 — Driving School Multi-Branch System
-- Adds all driving school management tables with LTO compliance
-- ============================================================

-- ─── Driving Students ────────────────────────────────────────
create table if not exists driving_students (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  student_code text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  middle_name text,
  sex text not null check (sex in ('male','female','other')),
  date_of_birth date not null,
  birthplace text,
  nationality text not null default 'Filipino',
  civil_status text not null default 'single' check (civil_status in ('single','married','widowed','separated','divorced')),
  phone text not null,
  email text,
  address text not null,
  barangay text,
  city text not null,
  province text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relation text,
  -- LTO Compliance Fields
  lto_student_permit_number text,
  lto_student_permit_issue_date date,
  lto_student_permit_expiry_date date,
  lto_client_id text,
  -- Medical
  medical_certificate_date date,
  medical_certificate_expiry date,
  blood_type text not null default 'unknown' check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')),
  -- Education
  highest_education text not null default 'high_school' check (highest_education in ('elementary','high_school','college','vocational','post_grad')),
  -- Driving History
  has_prior_driving_experience boolean not null default false,
  prior_driving_years integer,
  has_existing_license boolean not null default false,
  existing_license_type text check (existing_license_type in ('student_permit','non_professional','professional')),
  existing_license_number text,
  -- Vision
  has_eyeglasses boolean not null default false,
  -- Status tracking
  status text not null default 'inquiry' check (status in ('inquiry','enrolled','active','completed','dropped','graduated')),
  registration_date date not null,
  expected_completion_date date,
  actual_completion_date date,
  -- Media
  photo_url text,
  signature_url text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_students_tenant on driving_students(tenant_id) where deleted_at is null;
create index if not exists idx_driving_students_branch on driving_students(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_students_status on driving_students(tenant_id, status) where deleted_at is null;
create unique index if not exists idx_driving_students_code on driving_students(tenant_id, student_code) where deleted_at is null;

alter table driving_students enable row level security;

-- ─── Driving Instructors ─────────────────────────────────────
create table if not exists driving_instructors (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  instructor_code text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  phone text not null,
  email text,
  address text,
  -- LTO Accreditation
  lto_accreditation_number text not null,
  lto_accreditation_issue_date date not null,
  lto_accreditation_expiry_date date not null,
  -- Specialization
  specializations jsonb not null default '[]',
  -- Experience
  years_of_experience integer not null default 0,
  -- License held
  license_type text not null check (license_type in ('student_permit','non_professional','professional')),
  license_number text not null,
  license_expiry_date date not null,
  -- Employment
  date_hired date not null,
  employment_type text not null default 'full_time' check (employment_type in ('full_time','part_time','contract')),
  max_students_per_day integer not null default 8,
  -- Rate
  rate_per_hour numeric(10,2) not null default 0,
  -- Schedule preferences (metadata-driven)
  schedule_preferences jsonb default '{}',
  status text not null default 'active' check (status in ('active','inactive','on_leave')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_instructors_tenant on driving_instructors(tenant_id) where deleted_at is null;
create index if not exists idx_driving_instructors_branch on driving_instructors(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_instructors_status on driving_instructors(tenant_id, status) where deleted_at is null;
create unique index if not exists idx_driving_instructors_code on driving_instructors(tenant_id, instructor_code) where deleted_at is null;

alter table driving_instructors enable row level security;

-- ─── Driving Courses ─────────────────────────────────────────
create table if not exists driving_courses (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,

  course_code text not null,
  name text not null,
  description text,
  category text not null check (category in (
    'tdc','pdc_motorcycle','pdc_car','pdc_truck',
    'refresher','defensive_driving','heavy_equipment','special_training'
  )),
  -- Duration
  total_hours numeric(5,1) not null,
  theory_hours numeric(5,1) not null default 0,
  practical_hours numeric(5,1) not null default 0,
  min_sessions_required integer not null,
  -- Pricing
  base_tuition_fee numeric(10,2) not null default 0,
  branch_fee_overrides jsonb default '{}',
  registration_fee numeric(10,2) not null default 0,
  assessment_fee numeric(10,2) not null default 0,
  certificate_fee numeric(10,2) not null default 0,
  -- LTO Compliance
  lto_course_code text,
  lto_accredited boolean not null default false,
  requires_student_permit boolean not null default true,
  requires_medical_certificate boolean not null default true,
  -- Prerequisites
  minimum_age integer not null default 17,
  prerequisite_course_id text references driving_courses(id),
  -- Capacity
  max_students_per_class integer not null default 15,
  -- Schedule defaults
  default_start_time text not null default '08:00',
  default_session_hours numeric(3,1) not null default 2,
  status text not null default 'active' check (status in ('active','inactive','coming_soon')),
  sort_order integer not null default 0,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_courses_tenant on driving_courses(tenant_id) where deleted_at is null;
create index if not exists idx_driving_courses_category on driving_courses(tenant_id, category) where deleted_at is null;
create unique index if not exists idx_driving_courses_code on driving_courses(tenant_id, course_code) where deleted_at is null;

alter table driving_courses enable row level security;

-- ─── Driving Enrollments ─────────────────────────────────────
create table if not exists driving_enrollments (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  enrollment_code text not null,
  student_id text not null references driving_students(id),
  student_name text not null,
  course_id text not null references driving_courses(id),
  course_name text not null,
  enrollment_date date not null,
  start_date date,
  expected_end_date date,
  actual_end_date date,
  -- Assigned instructor
  instructor_id text references driving_instructors(id),
  instructor_name text,
  -- Fee breakdown
  tuition_fee numeric(10,2) not null default 0,
  registration_fee numeric(10,2) not null default 0,
  assessment_fee numeric(10,2) not null default 0,
  certificate_fee numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total_fee numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  balance numeric(10,2) not null default 0,
  enrollment_type text not null default 'full' check (enrollment_type in ('full','installment')),
  -- Installment plan
  installment_plan jsonb,
  -- Progress tracking
  theory_hours_completed numeric(5,1) not null default 0,
  practical_hours_completed numeric(5,1) not null default 0,
  sessions_attended integer not null default 0,
  sessions_total integer not null default 0,
  -- Assessment
  theory_exam_score numeric(5,1),
  practical_exam_score numeric(5,1),
  overall_grade numeric(5,1),
  has_certificate_issued boolean not null default false,
  certificate_issue_date date,
  certificate_number text,
  -- LTO
  lto_submission_date date,
  lto_reference_number text,
  status text not null default 'pending' check (status in (
    'pending','confirmed','in_progress','completed','failed','cancelled','refunded'
  )),
  cancellation_reason text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_enrollments_tenant on driving_enrollments(tenant_id) where deleted_at is null;
create index if not exists idx_driving_enrollments_branch on driving_enrollments(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_enrollments_student on driving_enrollments(tenant_id, student_id) where deleted_at is null;
create index if not exists idx_driving_enrollments_status on driving_enrollments(tenant_id, status) where deleted_at is null;
create index if not exists idx_driving_enrollments_date on driving_enrollments(tenant_id, enrollment_date desc) where deleted_at is null;
create unique index if not exists idx_driving_enrollments_code on driving_enrollments(tenant_id, enrollment_code) where deleted_at is null;

alter table driving_enrollments enable row level security;

-- ─── Driving Schedules ───────────────────────────────────────
create table if not exists driving_schedules (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  schedule_code text not null,
  enrollment_id text not null references driving_enrollments(id),
  student_id text not null references driving_students(id),
  student_name text not null,
  instructor_id text not null references driving_instructors(id),
  instructor_name text not null,
  vehicle_id text references driving_vehicles(id),
  session_type text not null check (session_type in ('theory','practical','assessment','remedial')),
  session_date date not null,
  start_time text not null,
  end_time text not null,
  duration_hours numeric(3,1) not null,
  -- Topics
  topics_covered text,
  skills_practiced text,
  -- Assessment
  assessment_score numeric(5,1),
  assessment_notes text,
  -- Attendance
  student_attended boolean not null default false,
  instructor_confirmed boolean not null default false,
  attendance_confirmed_at timestamptz,
  -- Location
  is_onsite boolean not null default true,
  location text,
  -- Vehicle tracking
  odometer_start integer,
  odometer_end integer,
  fuel_used numeric(5,2),
  -- Reschedule
  original_schedule_id text references driving_schedules(id),
  reschedule_reason text,
  reschedule_count integer not null default 0,
  status text not null default 'scheduled' check (status in (
    'scheduled','in_progress','completed','cancelled','no_show','rescheduled'
  )),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_schedules_tenant on driving_schedules(tenant_id) where deleted_at is null;
create index if not exists idx_driving_schedules_enrollment on driving_schedules(tenant_id, enrollment_id) where deleted_at is null;
create index if not exists idx_driving_schedules_instructor on driving_schedules(tenant_id, instructor_id, session_date) where deleted_at is null;
create index if not exists idx_driving_schedules_date on driving_schedules(tenant_id, session_date) where deleted_at is null;
create unique index if not exists idx_driving_schedules_code on driving_schedules(tenant_id, schedule_code) where deleted_at is null;

alter table driving_schedules enable row level security;

-- ─── Driving Payments ────────────────────────────────────────
create table if not exists driving_payments (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  payment_code text not null,
  enrollment_id text not null references driving_enrollments(id),
  student_id text not null references driving_students(id),
  student_name text not null,
  payment_date date not null,
  payment_time text not null,
  amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cash','gcash','maya','bank_transfer','card','check')),
  reference_number text,
  payment_for text not null default 'tuition' check (payment_for in (
    'tuition','registration','assessment','certificate','installment','other'
  )),
  installment_number integer,
  official_receipt_number text,
  received_by text not null,
  is_refund boolean not null default false,
  refund_reason text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_payments_tenant on driving_payments(tenant_id) where deleted_at is null;
create index if not exists idx_driving_payments_enrollment on driving_payments(tenant_id, enrollment_id) where deleted_at is null;
create index if not exists idx_driving_payments_date on driving_payments(tenant_id, payment_date desc) where deleted_at is null;
create unique index if not exists idx_driving_payments_code on driving_payments(tenant_id, payment_code) where deleted_at is null;

alter table driving_payments enable row level security;

-- ─── Driving Vehicles (Training Fleet) ───────────────────────
create table if not exists driving_vehicles (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  vehicle_code text not null,
  plate_number text not null,
  make text not null,
  model text not null,
  year integer not null,
  type text not null check (type in ('sedan','hatchback','suv','pickup','van','truck','bus','motorcycle')),
  transmission text not null check (transmission in ('manual','automatic','semi_automatic')),
  fuel_type text not null check (fuel_type in ('gasoline','diesel','electric','hybrid')),
  color text,
  -- Registration
  lto_registration_number text not null,
  lto_registration_expiry date not null,
  insurance_provider text,
  insurance_policy_number text,
  insurance_expiry_date date,
  -- Training Equipment
  has_dual_control boolean not null default true,
  has_dash_cam boolean not null default false,
  has_student_signage boolean not null default true,
  -- Maintenance
  odometer_reading integer not null default 0,
  last_maintenance_date date,
  last_maintenance_odometer integer,
  next_maintenance_odometer integer,
  maintenance_notes text,
  -- Assignment
  assigned_branch_id text references branches(id),
  assigned_instructor_id text references driving_instructors(id),
  -- Status
  status text not null default 'active' check (status in ('active','maintenance','out_of_service','for_sale')),
  acquisition_date date,
  acquisition_cost numeric(12,2),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_vehicles_tenant on driving_vehicles(tenant_id) where deleted_at is null;
create index if not exists idx_driving_vehicles_branch on driving_vehicles(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_vehicles_status on driving_vehicles(tenant_id, status) where deleted_at is null;
create unique index if not exists idx_driving_vehicles_code on driving_vehicles(tenant_id, vehicle_code) where deleted_at is null;
create unique index if not exists idx_driving_vehicles_plate on driving_vehicles(tenant_id, plate_number) where deleted_at is null;

alter table driving_vehicles enable row level security;
