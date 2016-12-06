CREATE FUNCTION fn_validador
(
	@fecha datetime
)
RETURNS varchar(max)
AS
BEGIN
	return convert(varchar(max),@fecha,121)
END
