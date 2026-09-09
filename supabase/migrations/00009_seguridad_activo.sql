-- 00009_seguridad_activo.sql
-- current_user_role() retorna NULL cuando el usuario no existe o esta inactivo.
-- Aplicar en SQL Editor de Supabase (no se ejecuta localmente).

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER STABLE
AS $$
DECLARE
    v_rol text;
BEGIN
    SELECT rol INTO v_rol FROM public.usuarios WHERE id = auth.uid() AND activo = true;
    RETURN v_rol;
END;
$$;
