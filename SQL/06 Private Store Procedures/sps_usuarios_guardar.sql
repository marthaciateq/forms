CREATE PROCEDURE sps_usuarios_guardar 
	@idsesion varchar(max),
	@idusuario varchar(max),
	@nombre varchar(max),
	@apaterno varchar(max),	
	@amaterno varchar(max),	
	@correo varchar(max),
	@login varchar(max),
	@password varchar(max),	
	@roles varchar(max),
	@deleted varchar(max)
AS
BEGIN
	declare @error varchar(max)
	declare @idusuarioSESION varchar(max)

	begin try
		execute sp_servicios_validar @idsesion, @@PROCID, @idusuarioSESION output
		
		if @nombre is null execute sp_error 'U', 'Campo nombre(s) requerido.'
		if @apaterno is null execute sp_error 'U', 'Campo apellido paterno requerido.'
		if @amaterno is null execute sp_error 'U', 'Campo apellido materno requerido.'		
		if @correo is null execute sp_error 'U', 'Campo correo requerido.'				
		if @login is null execute sp_error 'U', 'Campo login requerido.'		
		if (@password is null and @idusuario is null) execute sp_error 'U', 'Campo contraseña requerido.'
		set @login = LTRIM(RTRIM(@login))
		set @password = LTRIM(RTRIM(@password))
		
		if (select COUNT(*) from usuarios where login = @login and (@idusuario is null or idusuario <> @idusuario)) > 0
				execute sp_error 'U', 'Ya existe un usuario con el mismo login.'
				
		begin try
			begin transaction
				if @idusuario is null
				begin
					execute sp_enc @password output
					execute sp_randomKey @idusuario output
					insert into usuarios values(@idusuario,@nombre,@apaterno,@amaterno,@correo,@login, @password, @deleted)
				end
				else
				begin 
					if @password is not null
					begin
						execute sp_enc @password output			
						update usuarios set password = @password,nombres=@nombre,apaterno=@apaterno,amaterno=@amaterno,
							correo=@correo
						 where idusuario = @idusuario
					end		
												
					update usuarios set login = @login, deleted = @deleted 
					where idusuario = @idusuario
					
					delete from rolesUsuarios where idusuario = @idusuario
				end					
				insert into rolesUsuarios
					select col1, @idusuario from fn_table(1, @roles)
			commit
		end try
		begin catch
			rollback
			set @error = error_message()
		execute sp_error 'S', @error
			end catch
	end try
	begin catch
		set @error = error_message()
		execute sp_error 'S', @error
	end catch
END