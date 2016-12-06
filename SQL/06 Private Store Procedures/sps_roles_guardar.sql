CREATE PROCEDURE sps_roles_guardar 
	@idsesion varchar(max),
	@idrol varchar(max),
	@nombre varchar(max),
	@deleted varchar(max),
	@servicios varchar(max)
AS
BEGIN
	declare @error varchar(max)
	declare @idusuarioSESION varchar(max)
	declare @idempresaSESION varchar(max)
	
	begin try
		execute sp_servicios_validar @idsesion, @@PROCID, @idusuarioSESION output, @idempresaSESION output
		if @nombre is null execute sp_error 'U', 'Campo "Nombre del rol" requerido.'
		if (select COUNT(*) from roles where nombre=@nombre and (@idrol is null or idrol<>@idrol))>0
			execute sp_error 'U', 'Campo "Nombre del rol" ya existe.'
		begin try
			begin transaction
				if @idrol is null
				begin
					execute sp_randomKey @idrol output
					insert into roles values(@idrol, @nombre, @deleted)
				end
				else
				begin
					update roles set nombre = @nombre, deleted = @deleted where idrol = @idrol
					delete from rolesServicios where idrol = @idrol
				end
				insert into rolesServicios
					select @idrol, col1 from fn_table(1,@servicios)
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