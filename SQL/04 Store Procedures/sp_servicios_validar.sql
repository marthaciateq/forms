CREATE PROCEDURE sp_servicios_validar 
	@idsesion varchar(max),
	@idservicio int,
	@idusuarioSESION varchar(max) = null output
AS
BEGIN
	declare @error varchar(max)

	execute sp_sesiones_validar @idsesion, @idusuarioSESION output


	if (
		select COUNT(*) 
		from v_servicios a 
			inner join rolesServicios b on a.servicio = b.servicio 
			inner join rolesUsuarios c on b.idrol = c.idrol 
			inner join sys.procedures d on a.servicio = d.name
		where c.idusuario=@idusuarioSESION and d.object_id = @idservicio
	) = 0 execute sp_error 'U', 'Usted no tiene permiso de realizar esta acción.'
END