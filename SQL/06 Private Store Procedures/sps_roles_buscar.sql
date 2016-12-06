CREATE PROCEDURE sps_roles_buscar 
	@idsesion varchar(max),
	@buscar varchar(max)
AS
BEGIN
	declare @error varchar(max)
	declare @idusuarioSESION varchar(max)
	declare @idempresaSESION varchar(max)
	
	begin try
		execute sp_servicios_validar @idsesion, @@PROCID, @idusuarioSESION output, @idempresaSESION output
		select
			*
		from v_roles
		where 
			dbo.fn_buscar(@buscar, rol, null, null, null, null) = 'S'
		order by rol
	end try
	begin catch
		set @error = error_message()
		execute sp_error 'S', @error
	end catch
END