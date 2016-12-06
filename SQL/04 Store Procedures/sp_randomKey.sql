CREATE PROCEDURE sp_randomKey 
	@key varchar(max) output
AS
BEGIN
	set @key = REPLACE(REPLACE(REPLACE(REPLACE(CONVERT(varchar(max),GETUTCDATE(),21),'-',''),' ',''),':',''),'.','')
	while len(@key)< 32
		set @key = @key + cast(cast(rand() * 10000000000000000 as bigint) as varchar(max))
	set @key = substring(@key, 1, 32)
END