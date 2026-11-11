-- ==========================================
-- Vários barbeiros
-- ==========================================
-- barbeiro NULL = vale para a barbearia toda (ex.: horário bloqueado pelo dono)

ALTER TABLE agendamentos ADD COLUMN barbeiro TEXT;

DROP INDEX agendamentos_horario_unico;
CREATE UNIQUE INDEX agendamentos_horario_unico
  ON agendamentos (data, horario, coalesce(barbeiro, '')) WHERE status <> 'cancelado';

CREATE OR REPLACE VIEW horarios_ocupados AS
  SELECT data, horario, barbeiro FROM agendamentos WHERE status <> 'cancelado';

DROP FUNCTION criar_agendamento(TEXT, TEXT, TEXT, DATE, TEXT);
CREATE FUNCTION criar_agendamento(p_servico TEXT, p_nome TEXT, p_telefone TEXT, p_data DATE, p_horario TEXT, p_barbeiro TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE novo_id UUID;
BEGIN
  IF length(trim(coalesce(p_nome, ''))) < 2 OR length(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'DADOS_INVALIDOS' USING ERRCODE = '22023';
  END IF;
  IF p_data < (now() AT TIME ZONE 'America/Sao_Paulo')::date THEN
    RAISE EXCEPTION 'DATA_PASSADA' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM dias_bloqueados WHERE data = p_data) THEN
    RAISE EXCEPTION 'DIA_BLOQUEADO' USING ERRCODE = '22023';
  END IF;
  -- Ocupado se o mesmo barbeiro já tem horário, ou se o horário foi bloqueado para todos
  IF EXISTS (
    SELECT 1 FROM agendamentos a
    WHERE a.data = p_data AND a.horario = p_horario AND a.status <> 'cancelado'
      AND (a.barbeiro IS NULL OR p_barbeiro IS NULL OR a.barbeiro = p_barbeiro)
  ) THEN
    RAISE EXCEPTION 'HORARIO_OCUPADO' USING ERRCODE = '23505';
  END IF;
  INSERT INTO agendamentos (servico, nome, telefone, data, horario, barbeiro, status)
  VALUES (left(p_servico, 120), left(trim(p_nome), 120), left(p_telefone, 20), p_data, p_horario,
          left(nullif(trim(p_barbeiro), ''), 60), 'agendado')
  RETURNING id INTO novo_id;
  RETURN novo_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'HORARIO_OCUPADO' USING ERRCODE = '23505';
END;
$$;

DROP FUNCTION meus_agendamentos(TEXT);
CREATE FUNCTION meus_agendamentos(p_telefone TEXT)
RETURNS TABLE (id UUID, servico TEXT, nome TEXT, telefone TEXT, data DATE, horario TEXT, status TEXT, created_at TIMESTAMPTZ, barbeiro TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, a.servico, a.nome, a.telefone, a.data, a.horario, a.status, a.created_at, a.barbeiro
  FROM agendamentos a
  WHERE a.telefone = p_telefone AND a.status <> 'bloqueado'
  ORDER BY a.data DESC, a.horario DESC;
$$;

REVOKE EXECUTE ON FUNCTION criar_agendamento, meus_agendamentos FROM PUBLIC;
GRANT EXECUTE ON FUNCTION criar_agendamento, meus_agendamentos TO anonymous, authenticated;
