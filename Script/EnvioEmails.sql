CREATE TABLE TB_TIPO_EMAIL
(
	EM_ID_TIPO_EMAIL	INT,
	EM_NOME_TIPO_EMAIL  VARCHAR(100)
)

GO

CREATE TABLE TB_ENVIAR_EMAILS
(
	EM_ID				INT,
	ID_TIPO_EMAIL		INT,
	EM_FROM				VARCHAR(100),
	EM_FROM_NAME		VARCHAR(100),
	EM_TO				VARCHAR(100),
	EM_SUBJECT			VARCHAR(250),
	EM_TEXT				VARCHAR(MAX),
	EM_DATA_CADASTRO	DATETIME,
	EM_DATA_ENVIO		DATETIME,
	EM_ERRO				VARCHAR(MAX),
	EM_STATUS			INT -- 0 ENVIAR
)							-- 1 AGUARDANDO
							-- 2 ENVIADO
							-- 4 ERRO
GO

CREATE PROCEDURE [dbo].[Proc_FiltrarEmails]
	@quantidade INT
AS
BEGIN

	SELECT TOP (@quantidade)
			EM_ID			,
			ID_TIPO_EMAIL	,
			EM_FROM			,
			EM_FROM_NAME	,
			EM_TO			,
			EM_SUBJECT		,
			EM_TEXT			
	  INTO 	#TEMPORARIA	
	  FROM TB_ENVIAR_EMAILS
	 WHERE EM_STATUS = 0
  ORDER BY EM_DATA_CADASTRO ASC


	 UPDATE TB_ENVIAR_EMAILS
	    SET EM_STATUS	= 1 
	   FROM #TEMPORARIA
	  WHERE #TEMPORARIA.EM_ID = TB_ENVIAR_EMAILS.EM_ID

	  SELECT EM_ID			,
			 ID_TIPO_EMAIL	,
			 EM_FROM		,
			 EM_FROM_NAME	,
			 EM_TO			,
			 EM_SUBJECT		,
			 EM_TEXT			
	    FROM #TEMPORARIA

END

GO

ALTER PROCEDURE [dbo].[Proc_GravarEmails]
(
	@id_tipo_email 	INT,
	@em_from		VARCHAR(100),	
	@em_from_name	VARCHAR(100),	
	@em_to			VARCHAR(100),	
	@em_subject		VARCHAR(250),	
	@em_text		VARCHAR(MAX),
	@enviado		BIT,
	@erro			VARCHAR(MAX)
)
AS
BEGIN

	DECLARE @em_id INT

	SELECT @em_id = [dbo].[nfn__kernel_CriarIDsInteger](MAX(EM_ID))
	  FROM TB_ENVIAR_EMAILS 
	
	INSERT TB_ENVIAR_EMAILS
	(EM_ID,			
	 ID_TIPO_EMAIL,	
	 EM_FROM,			
	 EM_FROM_NAME,	
	 EM_TO,			
	 EM_SUBJECT,		
	 EM_TEXT,			
	 EM_DATA_CADASTRO,
	 EM_DATA_ENVIO,	
	 EM_ERRO,
	 EM_STATUS)
	 VALUES(
	 @em_id,
	 @id_tipo_email, 	
	 @em_from,		
	 @em_from_name,	
	 @em_to,			
	 @em_subject,		
	 @em_text,
	 GETDATE(),
	 CASE WHEN @enviado = 1 THEN GETDATE() ELSE NULL END,
	 CASE WHEN ISNULL(@erro,'') = '' THEN NULL ELSE @erro END,
	 0)

END

GO

CREATE PROCEDURE [dbo].[Proc_GravarEmailEnviado]
(
	@em_id INT,
	@erro  VARCHAR(MAX)
)
AS
BEGIN

	SET @erro = ISNULL(@erro,'')
	
	UPDATE TB_ENVIAR_EMAILS
	   SET EM_DATA_ENVIO	= CASE WHEN @erro = '' THEN GETDATE() ELSE NULL END,
		   EM_ERRO			= CASE WHEN @erro = '' THEN NULL ELSE @erro END,
		   EM_STATUS		= CASE WHEN @erro = '' THEN 2 ELSE NULL END
	 WHERE EM_ID	= @em_id

END



