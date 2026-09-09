-- 00011_normalizar_autoridades.sql
-- Normaliza nombre_completo y cargo a Título español
-- (respeta partículas en minúscula: de, del, la, el, los, las, y, e, en, a, al;
-- conserva abreviaturas como Mvz. o Dra.).
-- Aplicar en SQL Editor de Supabase (no se ejecuta localmente).

CREATE OR REPLACE FUNCTION public.titulo_es(texto text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  palabras text[];
  sale text[] := '{}';
  i int;
  p text;
  minusculas text[] := ARRAY['de','del','la','el','los','las','y','e','en','a','al','o','u'];
BEGIN
  IF texto IS NULL OR trim(texto) = '' THEN
    RETURN texto;
  END IF;
  palabras := regexp_split_to_array(trim(texto), '\s+');
  FOR i IN 1..array_length(palabras, 1) LOOP
    p := palabras[i];
    IF i > 1 AND lower(p) = ANY(minusculas) THEN
      sale := sale || lower(p);
    ELSE
      -- paréntesis obligatorios: sin ellos, || encadena dos appends
      -- (primera letra y resto como elementos separados) y corrompe el texto
      sale := sale || (upper(substring(p, 1, 1)) || lower(substring(p, 2)));
    END IF;
  END LOOP;
  RETURN array_to_string(sale, ' ');
END;
$$;

UPDATE public.autoridades
SET nombre_completo = public.titulo_es(nombre_completo),
    cargo = public.titulo_es(cargo);
