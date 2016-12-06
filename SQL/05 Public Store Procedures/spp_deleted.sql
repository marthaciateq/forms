CREATE PROCEDURE spp_deleted
AS
BEGIN
	declare @table table(deleted char(1), deletedS varchar(max))
	insert into @table values('N', dbo.fn_deleted('N'))
	insert into @table values('S', dbo.fn_deleted('S'))
	select * from @table
END