-- Revoke EXECUTE permissions on role check functions from authenticated users
-- These functions should only be used internally by RLS policies, not called directly from client

-- Revoke from authenticated role (regular logged-in users)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated;

-- Revoke from anon role (unauthenticated users)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;

-- The functions will still work for RLS policies because those run with postgres privileges