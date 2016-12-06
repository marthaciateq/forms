CREATE PROCEDURE sp_log_exception 
	@idlog int,
	@exception varchar(max)
AS
BEGIN
	update log set ffinal = GETUTCDATE(), exception=@exception where idlog = @idlog
END
