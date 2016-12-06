CREATE FUNCTION fn_deleted
(
	@deleted varchar(max)
)
RETURNS varchar(max)
AS
BEGIN
	if @deleted='N' return 'Activo'
	if @deleted='S' return 'Borrado'
	return null
END
