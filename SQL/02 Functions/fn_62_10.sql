CREATE FUNCTION fn_62_10
(
	@i int,
	@b int,
	@d int
)
RETURNS char(1)
AS
BEGIN
	 set @b = @b + 1
	 if @b > 6 set @b = @b - 6
	 declare @n int;
	 set @n = (@i * 6) + (@b * @d)
	 if @n >= 62 set @n = @n - 62
	 return dbo.fn_62(@n)
END

GO


