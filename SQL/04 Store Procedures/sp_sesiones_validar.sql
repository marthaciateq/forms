CREATE PROCEDURE sp_sesiones_validar 
	@idsesion varchar(max),
	@idusuarioSESION varchar(max) = null output
AS
BEGIN
	select
		@idusuarioSESION = idusuario
	from sesiones
	where idsesion = @idsesion
	if @idusuarioSESION is null
		execute sp_error 'U', 'Sesión inválida.'
END
