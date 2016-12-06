CREATE PROCEDURE sp_log_begin 
	@name		varchar(max),
	@parameters varchar(max)
AS
BEGIN
	declare @idlog int; execute @idlog = sp_keys_next 'log.idlog'
	insert into log(idlog, name, finicial)
		values(@idlog, substring(@name, 1, 128), GETUTCDATE())
	insert into plog
		select @idlog, col1, col2
		from fn_table(2,@parameters)
	select @idlog idlog
END
