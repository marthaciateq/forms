USE [master]
GO

CREATE DATABASE FORMS ON PRIMARY ( 
	NAME = N'FORMS', 
	FILENAME = N'c:\data\FORMS.mdf' , 
	SIZE = 3072KB , 
	MAXSIZE = UNLIMITED, 
	FILEGROWTH = 1024KB 
)
LOG ON (
	NAME = N'FORMS_log', 
	FILENAME = N'c:\data\FORMS_log.ldf' , 
	SIZE = 1024KB , 
	MAXSIZE = 2048GB , 
	FILEGROWTH = 10%
)
GO

USE FORMS
GO

EXECUTE sp_changedbowner @loginame = N'formsAdmin', @map = false
GO

CREATE USER formsDefault FROM LOGIN formsDefault 
GO