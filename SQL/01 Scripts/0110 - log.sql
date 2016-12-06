CREATE TABLE [log](
	idlog int NOT NULL,
	name varchar(128),
	finicial datetime,
	ffinal datetime,
	exception varchar(max),
	CONSTRAINT PK_log PRIMARY KEY (idlog)
)
GO

insert into keys values('log.idlog',0)
GO

CREATE INDEX IX_log_01 on [log](finicial, name)
GO

CREATE TABLE plog(
	idlog int NOT NULL,
	name varchar(128),
	value varchar(max)
)
GO

ALTER TABLE plog ADD CONSTRAINT FK_plog_01 FOREIGN KEY(idlog)
REFERENCES log(idlog)

CREATE INDEX IX_plog_01 on plog(idlog)
GO
