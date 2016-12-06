CREATE PROCEDURE sps_usuarios_buscar 
	@idsesion varchar(max),
	@buscar varchar(max) = null
AS
BEGIN
	declare @error varchar(max)
	declare @idusuarioSESION varchar(max)
	declare @idempresaSESION varchar(max)
	
	begin try
		execute sp_servicios_validar @idsesion, @@PROCID, @idusuarioSESION output
		select
			a.*
		from v_usuarios a
		where (@buscar is null or dbo.fn_buscar(@buscar, a.login, a.correo, a.nombre,a .apaterno, a.amaterno) = 'S') 
		order by a.nombre
	end try
	begin catch
		set @error = error_message()
		execute sp_error 'S', @error
	end catch
END