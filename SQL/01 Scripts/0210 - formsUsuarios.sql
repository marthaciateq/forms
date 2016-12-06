CREATE TABLE formsUsuarios(
	idform char(32) NOT NULL,
	idusuario char(32) NOT NULL
)
GO

ALTER TABLE formsUsuarios ADD CONSTRAINT FK_formsUsuarios_idform FOREIGN KEY(idform)
REFERENCES forms(idform)
ALTER TABLE formsUsuarios ADD CONSTRAINT FK_formsUsuarios_idusuario FOREIGN KEY(idusuario)
REFERENCES usuarios(idusuario) ON DELETE CASCADE

CREATE INDEX IX_formsUsuarios_01 on formsUsuarios(idusuario) include(idform)
GO

