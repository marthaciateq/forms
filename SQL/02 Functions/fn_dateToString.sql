CREATE FUNCTION fn_dateToString
(
	@fecha date
)
RETURNS varchar(max)
AS
BEGIN
	return convert(varchar(max),@fecha,103)
END