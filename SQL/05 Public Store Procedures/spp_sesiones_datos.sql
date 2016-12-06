CREATE PROCEDURE spp_sesiones_datos 
	@idsesion varchar(max)
AS
BEGIN
	declare @error varchar(max)
	begin try
		declare @idusuarioSESION varchar(max)
		execute sp_sesiones_validar @idsesion, @idusuarioSESION output
	
		select
			@idsesion idsesion,
			login
		from v_usuarios
		where idusuario = @idusuarioSESION

		select distinct
			a.servicio
		from v_servicios a
			inner join rolesServicios b on a.servicio = b.servicio
			inner join rolesUsuarios c on b.idrol = c.idrol
		where c.idusuario = @idusuarioSESION
		
	end try
	begin catch
		set @error = error_message()
		execute sp_error 'S', @error
	end catch
END