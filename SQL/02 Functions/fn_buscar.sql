CREATE FUNCTION fn_buscar 
(
	@filter varchar(max),
	@field1 varchar(max),
	@field2 varchar(max),
	@field3 varchar(max),
	@field4 varchar(max),
	@field5 varchar(max)
)
RETURNS char(1)
AS
BEGIN
	declare @words table(word varchar(max))
	declare @w varchar(max); set @w='';
	declare @i int; set @i=1
	declare @c char(1)
	
	
	while @i < = len(@filter)
	begin
		set @c=substring(@filter,@i,1);
		if @c=' '
		begin
			if len(@w)>0 insert @words values(@w);
			set @w='';
		end else set @w=@w+@c;
		set @i=@i+1
	end
	if len(@w)>0 insert @words values(@w);
	
	declare @n int;select @n=count(*) from @words where @field1 like '%'+word+'%' or @field2 like '%'+word+'%' or @field3 like '%'+word+'%' or @field4 like '%'+word+'%' or @field5 like '%'+word+'%'
	if @n=(select count(*) from @words) return 'S'
	return 'N'
END
