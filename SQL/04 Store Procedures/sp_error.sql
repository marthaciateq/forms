CREATE PROCEDURE sp_error 
	@tipo		char(1),				--	Tipo de excepción (U) usuario, (S) sistema.
	@mensaje	varchar(max)			--	Mensaje de la excepción.
AS
BEGIN
	if patindex ('EXCEPCION USUARIO:%',@mensaje) > 0 or patindex ('EXCEPCION SISTEMA:%', @mensaje) > 0
	begin
		raiserror (@mensaje, 15, 100)
		return
	end
	if @tipo = 'U' set @mensaje = 'EXCEPCION USUARIO:' + isnull(@mensaje,'')
	else set @mensaje = 'EXCEPCION SISTEMA:' + isnull(@mensaje,'')
	raiserror (@mensaje, 15, 100)
END
