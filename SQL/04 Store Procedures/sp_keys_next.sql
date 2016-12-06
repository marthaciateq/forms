CREATE PROCEDURE sp_keys_next 
	@name	varchar(max),
	@select char(1) = 'N'
AS
BEGIN
	declare @value int
	update keys
		set @value = value + 1,
		value = value + 1
	where name = @name
	if @select ='S' select @value value
	return @value
END
