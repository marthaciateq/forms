CREATE PROCEDURE sp_log_ok 
	@idlog int
AS
BEGIN
	update log set ffinal = GETUTCDATE() where idlog = @idlog
END

