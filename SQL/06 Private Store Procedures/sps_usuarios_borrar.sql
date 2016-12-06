CREATE PROCEDURE sps_usuarios_borrar 
	@idsesion varchar(max),
	@usuarios varchar(max)
AS
BEGIN
	declare @error varchar(max)
	declare @idusuarioSESION varchar(max)
	declare @idempresaSESION varchar(max)
	
	begin try
		execute sp_servicios_validar @idsesion, @@PROCID, @idusuarioSESION output
		declare @idusuario varchar(max)
		declare @idpersona varchar(max)
		declare @idempresa varchar(max)
		declare cursor1 cursor fast_forward for select col1 from fn_table(1,@usuarios)
		open cursor1
		fetch cursor1 into @idusuario
		while @@FETCH_STATUS=0
		begin
				begin try
					begin transaction
						delete from usuarios where idusuario = @idusuario
					commit
				end try
				begin catch
					rollback
					begin try
						begin transaction
							update usuarios set deleted = 'S' where idusuario = @idusuario
						commit
					end try
					begin catch
						rollback
					end catch
				end catch
			fetch cursor1 into @idusuario
		end
		close cursor1
		deallocate cursor1
	end try
	begin catch
		set @error = error_message()
		execute sp_error 'S', @error
	end catch
END