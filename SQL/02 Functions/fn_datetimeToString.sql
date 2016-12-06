CREATE FUNCTION fn_datetimeToString
(
	@fecha datetime,
	@formato int
)
RETURNS varchar(max)
AS
BEGIN
	if @formato = 1 return CONVERT(varchar(max), @fecha,103)
	if @formato = 2 return CONVERT(varchar(max), @fecha,103) + ' ' + substring(CONVERT(varchar(max), @fecha,114),1,5)
	if @formato = 3 return CONVERT(varchar(max), @fecha,103) + ' ' + substring(CONVERT(varchar(max), @fecha,114),1,8)
	if @formato = 4 return CONVERT(varchar(max), @fecha,103) + ' ' + CONVERT(varchar(max), @fecha,114)
	if @formato = 5 return substring(CONVERT(varchar(max), @fecha,114),1,5)
	if @formato = 6 return substring(CONVERT(varchar(max), @fecha,114),1,8)
	return null
END