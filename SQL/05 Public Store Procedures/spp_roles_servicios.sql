CREATE PROCEDURE spp_roles_servicios 
	@idrol varchar(max)
AS
BEGIN
	select servicio from rolesServicios where idrol = @idrol
END