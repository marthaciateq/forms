CREATE PROCEDURE sp_dec
(
	@ew varchar(max) output
)
AS
BEGIN
	begin try
		declare @t1 table(d int, c char(1))
		declare @i int; set @i = convert(int, SUBSTRING(@ew, 1, 1))
		declare @b int; set @b = convert(int, SUBSTRING(@ew, LEN(@ew), 1))
		declare @d int; set @d=0
		while @d < 10
		begin
			insert into @t1 values(@d, dbo.fn_62_10(@i,@b,@d))
			set @d = @d +1
		end
		set @ew = SUBSTRING(@ew,2,len(@ew)-2)
		declare @ascii varchar(max); set @ascii = ''
		declare @w varchar(max); set @w = ''
		declare @k int; set @k = 1
		declare @l int; set @l = LEN(@ew)
		while @k < @l
		begin
			set @d = null
			select @d = d from @t1 where ascii(c) = ascii(SUBSTRING(@ew, @k, 1))
			if not @d is null set @ascii = @ascii + convert(varchar(max),@d)
			else 
			begin
				set @w = @w + CHAR(CONVERT(int,@ascii))
				set @ascii = ''
			end
			set @k = @k +1
		end
		set @w = @w + CHAR(CONVERT(int,@ascii))
		set @ascii = ''
		set @ew = @w
	end try
	begin catch
		execute sp_error 'U', 'Cadena corrupta.'
	end catch
END

