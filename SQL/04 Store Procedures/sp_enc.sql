CREATE PROCEDURE sp_enc
(
	@w varchar(max) output
)
AS
BEGIN
	declare @t1 table(d int, c char(1))
	declare @i int; set @i = convert(int,RAND()*10)
	declare @b int; set @b = convert(int,RAND()*10)
	declare @d int; set @d=0
	while @d < 10
	begin
		insert into @t1 values(@d, dbo.fn_62_10(@i,@b,@d))
		set @d = @d +1
	end

	declare @ew varchar(max); set @ew = ''
	declare @ascii varchar(max)
	declare @c char(1)
	declare @c2 char(1)
	declare @k int; set @k=1
	declare @k2 int;
	declare @l int; set @l=LEN(@w)
	declare @l2 int;
	while @k <= @l
	begin
		set @c = SUBSTRING(@w, @k, 1)
		if not ((ASCII(@c) >= 48 and ASCII(@c) <= 57) or (ASCII(@c) >= 65 and ASCII(@c) <= 90) or (ASCII(@c) >= 97 and ASCII(@c) <= 122)) execute sp_error 'U', 'Solo se aceptan caracteres alfanuméricos.'
		set @ascii = convert(varchar(max),ASCII(@c))
		set @k2=1
		set @l2=LEN(@ascii)
		while @k2 <= @l2
		begin
			select @c2 = c from @t1 where d = substring(@ascii, @k2, 1)
			set @ew = @ew + @c2
			set @k2 = @k2 + 1
		end
		set @c2 = null
		while @c2 is null
		begin
			set @c2 = dbo.fn_62(CONVERT(int,RAND()*62))
			if (select COUNT(*) from @t1 where ascii(c)=ascii(@c2))>0 set @c2 = null
		end
		set @ew = @ew + @c2
		set @k = @k +1
	end
	set @w = convert(varchar(max), @i) + @ew + convert(varchar(max), @b)
END

GO


