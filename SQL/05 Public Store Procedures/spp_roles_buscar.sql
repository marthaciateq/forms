CREATE PROCEDURE spp_roles_buscar 
	@buscar varchar(max) = null
AS
BEGIN
	select * 
	from v_roles 
	where (@buscar is null or dbo.fn_buscar(@buscar,rol,null,null,null,null) = 'S') 
		and deleted = 'N'
	order by rol
END
