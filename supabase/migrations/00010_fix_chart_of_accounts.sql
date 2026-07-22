-- Fix: partial unique index can't be used with ON CONFLICT.
-- Drop the partial index and create a full unique constraint.
-- Then seed the chart of accounts.

begin;

-- 1. Drop the partial unique index (if it exists)
drop index if exists idx_coa_code;

-- 2. Create a full unique constraint for ON CONFLICT support
-- First ensure no duplicate (tenant_id, code) rows exist
delete from chart_of_accounts a
using chart_of_accounts b
where a.id > b.id
  and a.tenant_id = b.tenant_id
  and a.code = b.code;

alter table chart_of_accounts
  add constraint uq_coa_tenant_code unique (tenant_id, code);

-- 3. Seed standard Philippine cooperative chart of accounts
insert into chart_of_accounts (tenant_id, code, name, account_type, normal_balance, sort_order) values
('default','1000','Cash on Hand','asset','debit',1),
('default','1010','Cash in Bank','asset','debit',2),
('default','1100','Loans Receivable - Current','asset','debit',3),
('default','1110','Loans Receivable - Past Due','asset','debit',4),
('default','1120','Allowance for Probable Losses','asset','credit',5),
('default','1200','Furniture and Equipment','asset','debit',6),
('default','1210','Accumulated Depreciation','asset','credit',7),
('default','2000','Share Capital','equity','credit',10),
('default','2010','Statutory Reserve Fund','equity','credit',11),
('default','2020','Education & Training Fund','equity','credit',12),
('default','2030','Community Development Fund','equity','credit',13),
('default','2040','Optional Fund','equity','credit',14),
('default','3000','Savings Deposits','liability','credit',20),
('default','3010','Time Deposits','liability','credit',21),
('default','3100','Accounts Payable','liability','credit',22),
('default','4000','Interest Income - Loans','revenue','credit',30),
('default','4010','Service Fees','revenue','credit',31),
('default','4020','Membership Fees','revenue','credit',32),
('default','5000','Salaries and Wages','expense','debit',40),
('default','5010','Office Supplies','expense','debit',41),
('default','5020','Utilities','expense','debit',42),
('default','5030','Transportation','expense','debit',43),
('default','5040','Provision for Probable Losses','expense','debit',44)
on conflict (tenant_id, code) do nothing;

commit;
