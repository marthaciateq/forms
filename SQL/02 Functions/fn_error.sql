CREATE FUNCTION fn_error
(
	@error varchar(max)
)
RETURNS varchar(max)
AS
BEGIN
	declare @i int = patindex ('EXCEPCION USUARIO:%',@error)
	if(@i>0) return substring(@error,19,1000)
	return null
END
