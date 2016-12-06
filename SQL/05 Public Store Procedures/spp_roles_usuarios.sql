CREATE PROCEDURE spp_roles_usuarios
	@idusuario varchar(max)
AS
BEGIN
	select a.idrol, b.nombre
	from rolesUsuarios a inner join roles b on a.idrol = b.idrol
	where idusuario = @idusuario
END