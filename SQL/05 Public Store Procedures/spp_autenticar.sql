CREATE PROCEDURE spp_autenticar 
	@login varchar(max),
	@password varchar(max)
AS
BEGIN
	declare @error varchar(max)
	begin try
		declare @idusuario varchar(max)
		declare @password2 varchar(max)
		declare @deleted char(1)
		select
			@idusuario = idusuario,
			@password2 = password,
			@deleted = deleted
		from usuarios
		where
			login collate Modern_Spanish_CS_AS = @login 
		if @idusuario is null execute sp_error 'U', 'Usuario no registrado.'
		execute sp_dec @password2 output
		if ISNULL(@password,'') <> ISNULL(@password2,'') collate Modern_Spanish_CS_AS
			execute sp_error 'U', 'Contraseña no coincide.'

		if @deleted='S' execute sp_error 'U', 'Su cuenta está dada de baja.'
		
		execute sp_sesiones_insertar @idusuario
		
	end try
	begin catch
		set @error = error_message()
		execute sp_error 'S', @error
	end catch
END