CREATE TABLE rolesServicios(
	idrol char(32) NOT NULL,
	servicio varchar(1256) NOT NULL
)
GO

ALTER TABLE rolesServicios ADD CONSTRAINT FK_rolesServicios_idrol FOREIGN KEY(idrol)
REFERENCES roles(idrol) ON DELETE CASCADE

CREATE INDEX IX_rolesServicios_01 on rolesServicios(idrol) include(servicio)
GO

