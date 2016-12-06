CREATE TABLE usuarios(
	idusuario char(32) NOT NULL,
	nombres varchar(256) NOT NULL,
	apaterno varchar(256) NOT NULL,
	amaterno varchar(256) NOT NULL,
	correo varchar(256) NOT NULL,
	login varchar(256) NOT NULL,
	password varchar(256) NOT NULL,
	deleted char(1) NOT NULL,
	CONSTRAINT PK_usuarios PRIMARY KEY (idusuario),
	CONSTRAINT CK_usuarios_01 CHECK (deleted in ('S','N'))
)
GO

CREATE UNIQUE INDEX IX_usuarios_01 on usuarios(login)
GO

BEGIN
	insert into usuarios values('20160617194441460203936886013010','Martha Ericka','Trejo','Herrera','marthae.trejo@gmail.com','mtrejo','0OstU0qU6t5','N')
	insert into usuarios values('20160617194441460997471614919941','Jose Angel','Hernández','Hernandez','jangel@ciateq.mx','jangel','5sMxyURyat5','N')
END

