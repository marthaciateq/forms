CREATE PROCEDURE sp_sesiones_insertar 
	@idusuario varchar(max)
AS
BEGIN
	declare @fcreacionSESION datetime; set @fcreacionSESION = GETUTCDATE()
	declare @idusuarioSESION varchar(max);
	select
		@idusuarioSESION = idusuario
	from usuarios where idusuario = @idusuario
	if @idusuarioSESION is null execute sp_error 'U', 'El usuario no existe.'
	
	declare @idsesion varchar(max); execute sp_randomKey @idsesion output
	insert into sesiones values(@idsesion, @idusuarioSESION, @fcreacionSESION)

	execute spp_sesiones_datos @idsesion
END
