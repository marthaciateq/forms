CREATE FUNCTION fn_stringToDate
(
	@fecha varchar(max)
)
RETURNS date
AS
BEGIN
	return convert(date,@fecha,103)
END