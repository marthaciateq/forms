CREATE TABLE roles(
	idrol char(32) NOT NULL,
	nombre varchar(256) NOT NULL,
	deleted char(1) NOT NULL,
	CONSTRAINT PK_roles PRIMARY KEY (idrol),
	CONSTRAINT CK_roles_01 CHECK (deleted in ('S','N'))
)
GO

CREATE UNIQUE INDEX IX_roles_01 on roles(nombre)
GO

BEGIN
	insert into roles values('20160617194441460447011204513153','Administrador','N')
END
GO
