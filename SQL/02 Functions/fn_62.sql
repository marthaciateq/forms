CREATE FUNCTION fn_62
(
	@n int
)
RETURNS char(1)
AS
BEGIN
	declare @i int; set @i = 48
	declare @j int; set @j = 0
	while @i<=122
	begin
		if (@i >= 48 and @i <= 57) or (@i >= 65 and @i <= 90) or (@i >= 97 and @i <= 122)
		begin
			if @n=@j return char(@i)
			set @j = @j + 1
		end
		set @i = @i + 1
	end
	return ''
END