-- ============================================================
-- Voyager Travel Manager — Development Seed
-- ============================================================
-- Inserts deterministic test data for local development.
-- Requires 001 + 002 migrations to have been applied.
--
-- Auth users MUST be created separately via Supabase CLI:
--   supabase auth user create --email admin@demo.com    --password demo1234
--   supabase auth user create --email gestor@demo.com   --password demo1234
--   supabase auth user create --email atendente@demo.com --password demo1234
--
-- Then update the UUIDs below to match those created above,
-- or run this seed after the auth rows exist in auth.users.
-- ============================================================

-- UUIDs used throughout this seed (deterministic)
do $$
declare
  v_agency_id  uuid := '00000000-0000-0000-0000-000000000001';
  v_admin_id   uuid := '00000000-0000-0000-0000-000000000010';
  v_gestor_id  uuid := '00000000-0000-0000-0000-000000000011';
  v_atend_id   uuid := '00000000-0000-0000-0000-000000000012';

  -- Clients
  v_cli1 uuid := '00000000-0000-0000-0001-000000000001';
  v_cli2 uuid := '00000000-0000-0000-0001-000000000002';
  v_cli3 uuid := '00000000-0000-0000-0001-000000000003';
  v_cli4 uuid := '00000000-0000-0000-0001-000000000004';

  -- Bookings
  v_bk1 uuid := '00000000-0000-0000-0002-000000000001';
  v_bk2 uuid := '00000000-0000-0000-0002-000000000002';
  v_bk3 uuid := '00000000-0000-0000-0002-000000000003';
  v_bk4 uuid := '00000000-0000-0000-0002-000000000004';
  v_bk5 uuid := '00000000-0000-0000-0002-000000000005';
begin

-- ============================================================
-- Agency
-- ============================================================
insert into agencies (id, name, slug, plan, phone, email, cnpj, website, timezone, currency)
values (
  v_agency_id,
  'Demo Viagens Ltda',
  'demo-viagens',
  'pro',
  '(11) 3000-0000',
  'contato@demoviagens.com.br',
  '12.345.678/0001-90',
  'https://demoviagens.com.br',
  'America/Sao_Paulo',
  'BRL'
)
on conflict (id) do nothing;

-- ============================================================
-- Users  (auth.users rows must already exist with these IDs)
-- ============================================================
insert into users (id, agency_id, full_name, role, phone, is_active)
values
  (v_admin_id,  v_agency_id, 'Ana Admin',    'admin',     '(11) 9 9900-0001', true),
  (v_gestor_id, v_agency_id, 'Bruno Gestor', 'gestor',    '(11) 9 9900-0002', true),
  (v_atend_id,  v_agency_id, 'Carlos Atend', 'atendente', '(11) 9 9900-0003', true)
on conflict (id) do nothing;

-- ============================================================
-- Clients
-- ============================================================
insert into clients
  (id, agency_id, full_name, email, phone, cpf, birth_date, nationality, notes, tags, created_by)
values
  (v_cli1, v_agency_id, 'Fernanda Lima',   'fernanda@email.com', '(11) 9 8888-0001',
   '000.111.222-33', '1985-04-12', 'Brasileira',
   'Cliente VIP — viaja ao menos 3x ao ano.', array['vip','frequente'], v_atend_id),

  (v_cli2, v_agency_id, 'Ricardo Sousa',  'ricardo@email.com',  '(21) 9 7777-0002',
   '111.222.333-44', '1978-11-30', 'Brasileira',
   null, array['corporativo'], v_atend_id),

  (v_cli3, v_agency_id, 'Juliana Cardoso','juliana@email.com',  '(31) 9 6666-0003',
   '222.333.444-55', '1992-07-22', 'Brasileira',
   'Prefere voos noturnos.', array[]::text[], v_gestor_id),

  (v_cli4, v_agency_id, 'Marcos Pires',   null,                 '(41) 9 5555-0004',
   '333.444.555-66', '1965-02-14', 'Brasileira',
   null, array['familia'], v_admin_id)
on conflict (id) do nothing;

-- ============================================================
-- Bookings
-- ============================================================
insert into bookings
  (id, agency_id, client_id, assigned_to, reference_code, status,
   destination, departure_date, return_date, pax_count,
   total_price, cost_price, notes, history)
values
  -- 1: Confirmada — Europa
  (v_bk1, v_agency_id, v_cli1, v_atend_id, 'VOY-2025-0001', 'confirmed',
   'Paris + Roma (Europa)', '2025-07-10', '2025-07-24', 2,
   15900.00, 10200.00,
   'Pacote lua-de-mel. Hotel 5 estrelas.',
   '[{"from_status":"draft","to_status":"pending_payment","changed_by":"00000000-0000-0000-0000-000000000012","changed_at":"2025-03-01T10:00:00Z","note":"Solicitado pelo cliente"},{"from_status":"pending_payment","to_status":"confirmed","changed_by":"00000000-0000-0000-0000-000000000011","changed_at":"2025-03-05T14:30:00Z","note":"Pagamento confirmado"}]'::jsonb),

  -- 2: Pendente pagamento — Nordeste
  (v_bk2, v_agency_id, v_cli2, v_gestor_id, 'VOY-2025-0002', 'pending_payment',
   'Natal + Fortaleza (Nordeste)', '2025-08-15', '2025-08-22', 4,
   8400.00, 5600.00,
   'Família com 2 crianças.',
   '[{"from_status":"draft","to_status":"pending_payment","changed_by":"00000000-0000-0000-0000-000000000011","changed_at":"2025-03-10T09:00:00Z","note":null}]'::jsonb),

  -- 3: Concluída — Buenos Aires
  (v_bk3, v_agency_id, v_cli3, v_atend_id, 'VOY-2025-0003', 'completed',
   'Buenos Aires (Argentina)', '2025-01-05', '2025-01-12', 1,
   4200.00, 2900.00,
   null,
   '[{"from_status":"draft","to_status":"confirmed","changed_by":"00000000-0000-0000-0000-000000000012","changed_at":"2024-11-20T08:00:00Z","note":"Pago à vista"},{"from_status":"confirmed","to_status":"completed","changed_by":"00000000-0000-0000-0000-000000000010","changed_at":"2025-01-13T10:00:00Z","note":"Viagem realizada"}]'::jsonb),

  -- 4: Rascunho — Japão
  (v_bk4, v_agency_id, v_cli1, v_gestor_id, 'VOY-2025-0004', 'draft',
   'Tóquio + Kyoto (Japão)', '2025-10-01', '2025-10-14', 2,
   22000.00, 16000.00,
   'Aguardando definição de datas.',
   '[]'::jsonb),

  -- 5: Cancelada
  (v_bk5, v_agency_id, v_cli4, v_atend_id, 'VOY-2025-0005', 'cancelled',
   'Cancún (México)', '2025-05-20', '2025-05-27', 3,
   10500.00, 7000.00,
   null,
   '[{"from_status":"confirmed","to_status":"cancelled","changed_by":"00000000-0000-0000-0000-000000000010","changed_at":"2025-04-01T16:00:00Z","note":"Cliente solicitou cancelamento por motivo pessoal"}]'::jsonb)
on conflict (id) do nothing;

-- ============================================================
-- Transactions
-- ============================================================
insert into transactions
  (agency_id, booking_id, type, status, amount, description, category,
   due_date, paid_at, payment_method, created_by)
values
  -- Reserva 1: entrada + saldo
  (v_agency_id, v_bk1, 'income', 'paid',    7950.00, 'Entrada 50% — Lua-de-mel Europa', 'passagens',
   '2025-03-05', '2025-03-05 14:30:00+00', 'pix',         v_atend_id),
  (v_agency_id, v_bk1, 'income', 'pending', 7950.00, 'Saldo 50% — Lua-de-mel Europa',   'passagens',
   '2025-06-10', null,                      null,          v_atend_id),
  (v_agency_id, v_bk1, 'expense','paid',    10200.00,'Custo fornecedor — operadora',    'fornecedor',
   '2025-04-01', '2025-04-01 09:00:00+00', 'transferencia', v_gestor_id),

  -- Reserva 2: parcela única pendente
  (v_agency_id, v_bk2, 'income', 'pending', 8400.00, 'Pacote Nordeste — saldo total',   'pacotes',
   '2025-07-01', null, null, v_gestor_id),

  -- Reserva 3: pago (concluída)
  (v_agency_id, v_bk3, 'income', 'paid',    4200.00, 'Buenos Aires — pagamento único',  'passagens',
   '2024-11-25', '2024-11-25 11:00:00+00', 'cartao', v_atend_id),
  (v_agency_id, v_bk3, 'expense','paid',    2900.00, 'Custo operadora Buenos Aires',    'fornecedor',
   '2024-12-01', '2024-12-01 09:00:00+00', 'pix',    v_gestor_id),

  -- Sem reserva: despesa operacional
  (v_agency_id, null, 'expense','paid',     350.00,  'Assinatura sistema CRM',          'operacional',
   '2025-03-01', '2025-03-01 08:00:00+00', 'boleto', v_admin_id),
  (v_agency_id, null, 'expense','pending',  1200.00, 'Aluguel escritório — abril',      'operacional',
   '2025-04-05', null, null, v_admin_id),

  -- Reserva 5 (cancelada): reembolso
  (v_agency_id, v_bk5, 'refund','paid',    10500.00, 'Reembolso Cancún — cancelamento', 'estorno',
   '2025-04-10', '2025-04-10 15:00:00+00', 'pix',   v_admin_id);


-- ============================================================
-- Tasks
-- ============================================================
insert into tasks
  (agency_id, booking_id, assigned_to, title, description, priority, status, due_date)
values
  -- Reserva 1
  (v_agency_id, v_bk1, v_atend_id, 'Confirmar passagens aéreas',
   'Emitir bilhetes na Amadeus após confirmação do pagamento.',
   'high', 'todo', '2025-03-20'),
  (v_agency_id, v_bk1, v_atend_id, 'Enviar vouchers ao cliente',
   'Hotel, seguro e translados em PDF.',
   'medium', 'in_progress', '2025-06-20'),

  -- Reserva 2
  (v_agency_id, v_bk2, v_gestor_id, 'Aguardar comprovante de pagamento',
   null, 'high', 'todo', '2025-07-05'),
  (v_agency_id, v_bk2, v_atend_id, 'Reservar transfer aeroporto–hotel',
   null, 'low', 'todo', '2025-08-01'),

  -- Reserva 4 (rascunho Japão)
  (v_agency_id, v_bk4, v_gestor_id, 'Cotar voos Tokyo — data flexível',
   'Cliente prefere outubro. Verificar disponibilidade semana 1 e 2.',
   'medium', 'todo', '2025-05-15'),

  -- Sem reserva — tarefa administrativa
  (v_agency_id, null, v_admin_id, 'Renovar contrato operadora XYZ',
   'Vigência termina em 30/06. Negociar desconto acima de 20 reservas/mês.',
   'high', 'todo', '2025-04-15');

end $$;
