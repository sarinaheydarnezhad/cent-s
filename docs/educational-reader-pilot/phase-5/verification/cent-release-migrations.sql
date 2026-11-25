IF OBJECT_ID(N'[cent_migrations_history]') IS NULL
BEGIN
    CREATE TABLE [cent_migrations_history] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK_cent_migrations_history] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_audit_events] (
        [Id] uniqueidentifier NOT NULL,
        [ActorId] uniqueidentifier NOT NULL,
        [Action] nvarchar(64) NOT NULL,
        [EntityId] uniqueidentifier NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_audit_events] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_questions] (
        [Id] uniqueidentifier NOT NULL,
        [Subject] nvarchar(24) NOT NULL,
        [Topic] nvarchar(120) NOT NULL,
        [Difficulty] nvarchar(16) NOT NULL,
        [Text] nvarchar(max) NOT NULL,
        [OptionsJson] nvarchar(max) NOT NULL,
        [CorrectAnswer] int NOT NULL,
        [Explanation] nvarchar(max) NOT NULL,
        [Kind] nvarchar(16) NOT NULL,
        [Active] bit NOT NULL,
        CONSTRAINT [PK_cent_questions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_trainings] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [IncludedInSubscription] bit NOT NULL,
        [Published] bit NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_trainings] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_users] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(120) NOT NULL,
        [Email] nvarchar(256) NOT NULL,
        [NormalizedEmail] nvarchar(256) NOT NULL,
        [PasswordHash] nvarchar(512) NOT NULL,
        [Role] nvarchar(16) NOT NULL,
        [PurchaseVersion] bigint NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_documents] (
        [Id] uniqueidentifier NOT NULL,
        [TrainingId] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [SortOrder] int NOT NULL,
        [PageCount] int NOT NULL,
        [Published] bit NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_documents] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_documents_cent_trainings_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [cent_trainings] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_products] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Kind] nvarchar(16) NOT NULL,
        [TrainingId] uniqueidentifier NULL,
        [PriceRial] bigint NOT NULL,
        [DurationDays] int NULL,
        [Active] bit NOT NULL,
        CONSTRAINT [PK_cent_products] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_cent_product_access] CHECK (([Kind] = 'TRAINING' AND [TrainingId] IS NOT NULL AND [DurationDays] IS NULL) OR ([Kind] = 'SUBSCRIPTION' AND [TrainingId] IS NULL AND [DurationDays] BETWEEN 1 AND 366)),
        CONSTRAINT [CK_cent_product_price] CHECK ([PriceRial] > 0),
        CONSTRAINT [FK_cent_products_cent_trainings_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [cent_trainings] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_attempts] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [RequestId] uniqueidentifier NOT NULL,
        [Kind] nvarchar(16) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [SubmittedAt] datetimeoffset NULL,
        [ResultJson] nvarchar(max) NULL,
        CONSTRAINT [PK_cent_attempts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_attempts_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_sessions] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [TokenHash] varchar(64) NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [RevokedAt] datetimeoffset NULL,
        CONSTRAINT [PK_cent_sessions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_sessions_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_document_pages] (
        [DocumentId] uniqueidentifier NOT NULL,
        [Number] int NOT NULL,
        [Image] varbinary(max) NOT NULL,
        [Width] int NOT NULL,
        [Height] int NOT NULL,
        CONSTRAINT [PK_cent_document_pages] PRIMARY KEY ([DocumentId], [Number]),
        CONSTRAINT [FK_cent_document_pages_cent_documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [cent_documents] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_document_sections] (
        [Id] uniqueidentifier NOT NULL,
        [DocumentId] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [StartPage] int NOT NULL,
        CONSTRAINT [PK_cent_document_sections] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_document_sections_cent_documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [cent_documents] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_notes] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [DocumentId] uniqueidentifier NOT NULL,
        [Page] int NOT NULL,
        [AnchorY] float NOT NULL,
        [Body] nvarchar(4000) NOT NULL,
        [Revision] bigint NOT NULL,
        [UpdatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_notes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_notes_cent_documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [cent_documents] ([Id]),
        CONSTRAINT [FK_cent_notes_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_study_progress] (
        [UserId] uniqueidentifier NOT NULL,
        [DocumentId] uniqueidentifier NOT NULL,
        [LastPage] int NOT NULL,
        [FurthestPage] int NOT NULL,
        [UpdatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_study_progress] PRIMARY KEY ([UserId], [DocumentId]),
        CONSTRAINT [FK_cent_study_progress_cent_documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [cent_documents] ([Id]),
        CONSTRAINT [FK_cent_study_progress_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_orders] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [RequestId] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Kind] nvarchar(16) NOT NULL,
        [TrainingId] uniqueidentifier NULL,
        [DurationDays] int NULL,
        [AmountRial] bigint NOT NULL,
        [Status] nvarchar(24) NOT NULL,
        [Provider] nvarchar(16) NOT NULL,
        [Authority] varchar(100) NULL,
        [Reference] varchar(100) NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [PaidAt] datetimeoffset NULL,
        CONSTRAINT [PK_cent_orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_orders_cent_products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [cent_products] ([Id]),
        CONSTRAINT [FK_cent_orders_cent_trainings_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [cent_trainings] ([Id]),
        CONSTRAINT [FK_cent_orders_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_ai_analyses] (
        [Id] uniqueidentifier NOT NULL,
        [AttemptId] uniqueidentifier NOT NULL,
        [Provider] nvarchar(24) NOT NULL,
        [PayloadJson] nvarchar(max) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_ai_analyses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_ai_analyses_cent_attempts_AttemptId] FOREIGN KEY ([AttemptId]) REFERENCES [cent_attempts] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_attempt_questions] (
        [AttemptId] uniqueidentifier NOT NULL,
        [Position] int NOT NULL,
        [QuestionId] uniqueidentifier NOT NULL,
        [SnapshotJson] nvarchar(max) NOT NULL,
        [Answer] int NULL,
        CONSTRAINT [PK_cent_attempt_questions] PRIMARY KEY ([AttemptId], [Position]),
        CONSTRAINT [FK_cent_attempt_questions_cent_attempts_AttemptId] FOREIGN KEY ([AttemptId]) REFERENCES [cent_attempts] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_entitlements] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [TrainingId] uniqueidentifier NULL,
        [Kind] nvarchar(16) NOT NULL,
        [StartsAt] datetimeoffset NOT NULL,
        [ExpiresAt] datetimeoffset NULL,
        [RevokedAt] datetimeoffset NULL,
        CONSTRAINT [PK_cent_entitlements] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_entitlements_cent_orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [cent_orders] ([Id]),
        CONSTRAINT [FK_cent_entitlements_cent_trainings_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [cent_trainings] ([Id]),
        CONSTRAINT [FK_cent_entitlements_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE TABLE [cent_payment_events] (
        [Id] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [Action] nvarchar(24) NOT NULL,
        [Code] int NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_payment_events] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_payment_events_cent_orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [cent_orders] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_ai_analyses_AttemptId] ON [cent_ai_analyses] ([AttemptId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_attempts_UserId_RequestId] ON [cent_attempts] ([UserId], [RequestId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_audit_events_CreatedAt] ON [cent_audit_events] ([CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_document_sections_DocumentId_StartPage] ON [cent_document_sections] ([DocumentId], [StartPage]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_documents_TrainingId_SortOrder] ON [cent_documents] ([TrainingId], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_entitlements_OrderId] ON [cent_entitlements] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_entitlements_TrainingId] ON [cent_entitlements] ([TrainingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_entitlements_UserId_Kind_TrainingId] ON [cent_entitlements] ([UserId], [Kind], [TrainingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_notes_DocumentId] ON [cent_notes] ([DocumentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_notes_UserId_DocumentId_Page] ON [cent_notes] ([UserId], [DocumentId], [Page]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_cent_orders_Authority] ON [cent_orders] ([Authority]) WHERE [Authority] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_orders_ProductId] ON [cent_orders] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_cent_orders_Provider_Reference] ON [cent_orders] ([Provider], [Reference]) WHERE [Reference] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_orders_TrainingId] ON [cent_orders] ([TrainingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_orders_UserId_RequestId] ON [cent_orders] ([UserId], [RequestId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_payment_events_OrderId_CreatedAt] ON [cent_payment_events] ([OrderId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_products_TrainingId] ON [cent_products] ([TrainingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_questions_Active_Kind] ON [cent_questions] ([Active], [Kind]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_sessions_TokenHash] ON [cent_sessions] ([TokenHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_sessions_UserId_ExpiresAt] ON [cent_sessions] ([UserId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE INDEX [IX_cent_study_progress_DocumentId] ON [cent_study_progress] ([DocumentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_users_NormalizedEmail] ON [cent_users] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107101801_InitialCent'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261107101801_InitialCent', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[cent_questions]') AND [c].[name] = N'Topic');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [cent_questions] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [cent_questions] ALTER COLUMN [Topic] nvarchar(500) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD [FigureSvg] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD [ImportKey] nvarchar(300) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD [Origin] nvarchar(32) NOT NULL DEFAULT N'manual';
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD [SourceExerciseId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD [SourceSectionId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD [TopicId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_documents] ADD [SourceId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_attempts] ADD [AssessmentMode] nvarchar(36) NOT NULL DEFAULT N'overview';
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_attempts] ADD [CourseCodesJson] nvarchar(max) NOT NULL DEFAULT N'[]';
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_attempts] ADD [DurationMinutes] int NOT NULL DEFAULT 60;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE TABLE [cent_courses] (
        [Code] nvarchar(24) NOT NULL,
        [Title] nvarchar(256) NOT NULL,
        [EnglishTitle] nvarchar(256) NOT NULL,
        [SortOrder] int NOT NULL,
        [TrainingId] uniqueidentifier NULL,
        [Active] bit NOT NULL,
        CONSTRAINT [PK_cent_courses] PRIMARY KEY ([Code]),
        CONSTRAINT [FK_cent_courses_cent_trainings_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [cent_trainings] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE TABLE [cent_curriculum_imports] (
        [PackageHash] varchar(64) NOT NULL,
        [ImportedAt] datetimeoffset NOT NULL,
        [SourceCount] int NOT NULL,
        [TopicCount] int NOT NULL,
        [QuestionCount] int NOT NULL,
        CONSTRAINT [PK_cent_curriculum_imports] PRIMARY KEY ([PackageHash])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE TABLE [cent_sources] (
        [Id] uniqueidentifier NOT NULL,
        [ImportKey] nvarchar(300) NOT NULL,
        [CourseCode] nvarchar(24) NOT NULL,
        [FileName] nvarchar(300) NOT NULL,
        [Title] nvarchar(500) NOT NULL,
        [OriginalTitle] nvarchar(500) NOT NULL,
        [Sha256] varchar(64) NOT NULL,
        [OriginalHtml] nvarchar(max) NOT NULL,
        [PlainText] nvarchar(max) NOT NULL,
        [ImportedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_sources] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_sources_cent_courses_CourseCode] FOREIGN KEY ([CourseCode]) REFERENCES [cent_courses] ([Code])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE TABLE [cent_chapters] (
        [Id] uniqueidentifier NOT NULL,
        [ImportKey] nvarchar(300) NOT NULL,
        [CourseCode] nvarchar(24) NOT NULL,
        [SourceId] uniqueidentifier NOT NULL,
        [Title] nvarchar(500) NOT NULL,
        [SortOrder] int NOT NULL,
        CONSTRAINT [PK_cent_chapters] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_chapters_cent_courses_CourseCode] FOREIGN KEY ([CourseCode]) REFERENCES [cent_courses] ([Code]),
        CONSTRAINT [FK_cent_chapters_cent_sources_SourceId] FOREIGN KEY ([SourceId]) REFERENCES [cent_sources] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE TABLE [cent_topics] (
        [Id] uniqueidentifier NOT NULL,
        [ImportKey] nvarchar(300) NOT NULL,
        [ChapterId] uniqueidentifier NOT NULL,
        [CourseCode] nvarchar(24) NOT NULL,
        [Title] nvarchar(500) NOT NULL,
        [EnglishTitle] nvarchar(256) NOT NULL,
        [SortOrder] int NOT NULL,
        [Foundation] bit NOT NULL,
        CONSTRAINT [PK_cent_topics] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_topics_cent_chapters_ChapterId] FOREIGN KEY ([ChapterId]) REFERENCES [cent_chapters] ([Id]),
        CONSTRAINT [FK_cent_topics_cent_courses_CourseCode] FOREIGN KEY ([CourseCode]) REFERENCES [cent_courses] ([Code])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE TABLE [cent_source_sections] (
        [Id] uniqueidentifier NOT NULL,
        [SourceId] uniqueidentifier NOT NULL,
        [TopicId] uniqueidentifier NULL,
        [ImportKey] nvarchar(300) NOT NULL,
        [Heading] nvarchar(500) NOT NULL,
        [SortOrder] int NOT NULL,
        [Text] nvarchar(max) NOT NULL,
        [Html] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_cent_source_sections] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_source_sections_cent_sources_SourceId] FOREIGN KEY ([SourceId]) REFERENCES [cent_sources] ([Id]),
        CONSTRAINT [FK_cent_source_sections_cent_topics_TopicId] FOREIGN KEY ([TopicId]) REFERENCES [cent_topics] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE TABLE [cent_source_exercises] (
        [Id] uniqueidentifier NOT NULL,
        [SourceSectionId] uniqueidentifier NOT NULL,
        [TopicId] uniqueidentifier NULL,
        [ImportKey] nvarchar(300) NOT NULL,
        [Text] nvarchar(max) NOT NULL,
        [OptionsJson] nvarchar(max) NOT NULL,
        [OriginalCorrectAnswer] int NULL,
        [Solution] nvarchar(max) NOT NULL,
        [Status] nvarchar(32) NOT NULL,
        [ReviewNote] nvarchar(4000) NULL,
        CONSTRAINT [PK_cent_source_exercises] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_source_exercises_cent_source_sections_SourceSectionId] FOREIGN KEY ([SourceSectionId]) REFERENCES [cent_source_sections] ([Id]),
        CONSTRAINT [FK_cent_source_exercises_cent_topics_TopicId] FOREIGN KEY ([TopicId]) REFERENCES [cent_topics] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_cent_questions_ImportKey] ON [cent_questions] ([ImportKey]) WHERE [ImportKey] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_questions_SourceExerciseId] ON [cent_questions] ([SourceExerciseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_questions_SourceSectionId] ON [cent_questions] ([SourceSectionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_questions_Subject_Active_TopicId] ON [cent_questions] ([Subject], [Active], [TopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_questions_TopicId] ON [cent_questions] ([TopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_documents_SourceId] ON [cent_documents] ([SourceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_chapters_CourseCode] ON [cent_chapters] ([CourseCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_chapters_ImportKey] ON [cent_chapters] ([ImportKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_chapters_SourceId] ON [cent_chapters] ([SourceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_courses_TrainingId] ON [cent_courses] ([TrainingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_source_exercises_ImportKey] ON [cent_source_exercises] ([ImportKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_source_exercises_SourceSectionId] ON [cent_source_exercises] ([SourceSectionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_source_exercises_TopicId] ON [cent_source_exercises] ([TopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_source_sections_ImportKey] ON [cent_source_sections] ([ImportKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_source_sections_SourceId_SortOrder] ON [cent_source_sections] ([SourceId], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_source_sections_TopicId] ON [cent_source_sections] ([TopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_sources_CourseCode] ON [cent_sources] ([CourseCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_sources_ImportKey] ON [cent_sources] ([ImportKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_topics_ChapterId] ON [cent_topics] ([ChapterId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE INDEX [IX_cent_topics_CourseCode_ChapterId_SortOrder] ON [cent_topics] ([CourseCode], [ChapterId], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_topics_ImportKey] ON [cent_topics] ([ImportKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_documents] ADD CONSTRAINT [FK_cent_documents_cent_sources_SourceId] FOREIGN KEY ([SourceId]) REFERENCES [cent_sources] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD CONSTRAINT [FK_cent_questions_cent_source_exercises_SourceExerciseId] FOREIGN KEY ([SourceExerciseId]) REFERENCES [cent_source_exercises] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD CONSTRAINT [FK_cent_questions_cent_source_sections_SourceSectionId] FOREIGN KEY ([SourceSectionId]) REFERENCES [cent_source_sections] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    ALTER TABLE [cent_questions] ADD CONSTRAINT [FK_cent_questions_cent_topics_TopicId] FOREIGN KEY ([TopicId]) REFERENCES [cent_topics] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261107130614_Curriculum'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261107130614_Curriculum', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261109184203_AddCentGoogleAuthentication'
)
BEGIN
    ALTER TABLE [cent_users] ADD [GoogleSubject] varchar(255) COLLATE Latin1_General_100_BIN2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261109184203_AddCentGoogleAuthentication'
)
BEGIN
    CREATE TABLE [cent_google_attempts] (
        [StateHash] varchar(64) NOT NULL,
        [VerifierHash] varchar(64) NOT NULL,
        [NonceHash] varchar(64) NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_google_attempts] PRIMARY KEY ([StateHash])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261109184203_AddCentGoogleAuthentication'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_cent_users_GoogleSubject] ON [cent_users] ([GoogleSubject]) WHERE [GoogleSubject] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261109184203_AddCentGoogleAuthentication'
)
BEGIN
    CREATE INDEX [IX_cent_google_attempts_ExpiresAt] ON [cent_google_attempts] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261109184203_AddCentGoogleAuthentication'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261109184203_AddCentGoogleAuthentication', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE TABLE [cent_syllabus_revisions] (
        [Id] nvarchar(100) NOT NULL,
        [SourceUrl] nvarchar(2000) NOT NULL,
        [RetrievedAt] datetimeoffset NOT NULL,
        [EvidenceJson] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_cent_syllabus_revisions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE TABLE [cent_exam_content_releases] (
        [Id] nvarchar(100) NOT NULL,
        [ExamVersionId] nvarchar(100) NOT NULL,
        [SyllabusRevisionId] nvarchar(100) NOT NULL,
        [ManifestJson] nvarchar(max) NOT NULL,
        [ReviewedAt] datetimeoffset NULL,
        [ReviewedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_cent_exam_content_releases] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_exam_content_releases_cent_syllabus_revisions_SyllabusRevisionId] FOREIGN KEY ([SyllabusRevisionId]) REFERENCES [cent_syllabus_revisions] ([Id]),
        CONSTRAINT [FK_cent_exam_content_releases_cent_users_ReviewedBy] FOREIGN KEY ([ReviewedBy]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE TABLE [cent_exam_versions] (
        [Id] nvarchar(100) NOT NULL,
        [ConfigurationRevision] nvarchar(100) NOT NULL,
        [DefinitionJson] nvarchar(max) NOT NULL,
        [Status] nvarchar(24) NOT NULL,
        [AvailableForNewStarts] bit NOT NULL,
        [SyllabusRevisionId] nvarchar(100) NULL,
        [ContentReleaseId] nvarchar(100) NULL,
        [Revision] int NOT NULL,
        CONSTRAINT [PK_cent_exam_versions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_exam_versions_cent_exam_content_releases_ContentReleaseId] FOREIGN KEY ([ContentReleaseId]) REFERENCES [cent_exam_content_releases] ([Id]),
        CONSTRAINT [FK_cent_exam_versions_cent_syllabus_revisions_SyllabusRevisionId] FOREIGN KEY ([SyllabusRevisionId]) REFERENCES [cent_syllabus_revisions] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE TABLE [cent_mock_attempts] (
        [AttemptId] uniqueidentifier NOT NULL,
        [ExamVersionId] nvarchar(100) NOT NULL,
        [ConfigurationRevision] nvarchar(100) NOT NULL,
        [RulesSnapshotJson] nvarchar(max) NOT NULL,
        [Status] nvarchar(24) NOT NULL,
        [Revision] int NOT NULL,
        [ActiveSectionId] uniqueidentifier NULL,
        [ActiveDeadline] datetimeoffset NULL,
        [EffectiveEndedAt] datetimeoffset NULL,
        [FinalizationReason] nvarchar(40) NULL,
        [ResultJson] nvarchar(max) NULL,
        CONSTRAINT [PK_cent_mock_attempts] PRIMARY KEY ([AttemptId]),
        CONSTRAINT [FK_cent_mock_attempts_cent_attempts_AttemptId] FOREIGN KEY ([AttemptId]) REFERENCES [cent_attempts] ([Id]),
        CONSTRAINT [FK_cent_mock_attempts_cent_exam_versions_ExamVersionId] FOREIGN KEY ([ExamVersionId]) REFERENCES [cent_exam_versions] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE TABLE [cent_attempt_sections] (
        [Id] uniqueidentifier NOT NULL,
        [AttemptId] uniqueidentifier NOT NULL,
        [SectionKey] nvarchar(24) NOT NULL,
        [SubjectId] nvarchar(24) NOT NULL,
        [Order] int NOT NULL,
        [QuestionCount] int NOT NULL,
        [DurationSeconds] int NOT NULL,
        [State] nvarchar(24) NOT NULL,
        [ActivatedAt] datetimeoffset NULL,
        [Deadline] datetimeoffset NULL,
        [ClosedAt] datetimeoffset NULL,
        [ProcessedAt] datetimeoffset NULL,
        CONSTRAINT [PK_cent_attempt_sections] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_cent_attempt_section_deadline] CHECK (([ActivatedAt] IS NULL AND [Deadline] IS NULL AND [State] = 'PENDING') OR ([ActivatedAt] IS NOT NULL AND [Deadline] IS NOT NULL)),
        CONSTRAINT [CK_cent_attempt_section_quota] CHECK ([QuestionCount] > 0 AND [DurationSeconds] > 0),
        CONSTRAINT [FK_cent_attempt_sections_cent_mock_attempts_AttemptId] FOREIGN KEY ([AttemptId]) REFERENCES [cent_mock_attempts] ([AttemptId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE TABLE [cent_exam_command_receipts] (
        [AttemptId] uniqueidentifier NOT NULL,
        [CommandId] uniqueidentifier NOT NULL,
        [PayloadHash] varchar(64) NOT NULL,
        [ReceiptJson] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_cent_exam_command_receipts] PRIMARY KEY ([AttemptId], [CommandId]),
        CONSTRAINT [FK_cent_exam_command_receipts_cent_mock_attempts_AttemptId] FOREIGN KEY ([AttemptId]) REFERENCES [cent_mock_attempts] ([AttemptId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AvailableForNewStarts', N'ConfigurationRevision', N'ContentReleaseId', N'DefinitionJson', N'Revision', N'Status', N'SyllabusRevisionId') AND [object_id] = OBJECT_ID(N'[cent_exam_versions]'))
        SET IDENTITY_INSERT [cent_exam_versions] ON;
    EXEC(N'INSERT INTO [cent_exam_versions] ([Id], [AvailableForNewStarts], [ConfigurationRevision], [ContentReleaseId], [DefinitionJson], [Revision], [Status], [SyllabusRevisionId])
    VALUES (N''cent-s-2025-2026-r1'', CAST(0 AS bit), N''blueprint-2025-2026-r1'', NULL, N''{"examVersionId":"cent-s-2025-2026-r1","label":"CEnT-S 2025\u20132026","configurationRevision":"blueprint-2025-2026-r1","cycleStartDate":"2025-11-01","cycleEndDateInclusive":"2026-10-31","sections":[{"sectionKey":"math","order":1,"subjectId":"math","questionCount":15,"durationSeconds":1800},{"sectionKey":"logic","order":2,"subjectId":"logic","questionCount":15,"durationSeconds":1800},{"sectionKey":"biology","order":3,"subjectId":"biology","questionCount":10,"durationSeconds":1200},{"sectionKey":"chemistry","order":4,"subjectId":"chemistry","questionCount":10,"durationSeconds":1200},{"sectionKey":"physics","order":5,"subjectId":"physics","questionCount":5,"durationSeconds":600}],"scoring":{"policyId":"raw-quarter-point-v1","correctQuarterPoints":4,"incorrectQuarterPoints":-1,"unansweredQuarterPoints":0},"syllabusRevisionId":null,"contentReleaseId":null,"timingPolicyId":"continuous-v1","submissionPolicyId":null,"totalQuestions":55,"totalDurationSeconds":6600}'', 1, N''PUBLISHED'', NULL),
    (N''cent-s-2026-2027-r1'', CAST(0 AS bit), N''blueprint-2026-2027-r1'', NULL, N''{"examVersionId":"cent-s-2026-2027-r1","label":"CEnT-S 2026\u20132027","configurationRevision":"blueprint-2026-2027-r1","cycleStartDate":"2026-11-01","cycleEndDateInclusive":"2027-10-31","sections":[{"sectionKey":"reading","order":1,"subjectId":"reading","questionCount":10,"durationSeconds":1800},{"sectionKey":"math","order":2,"subjectId":"math","questionCount":15,"durationSeconds":1800},{"sectionKey":"logic","order":3,"subjectId":"logic","questionCount":15,"durationSeconds":1800},{"sectionKey":"biology","order":4,"subjectId":"biology","questionCount":10,"durationSeconds":1200},{"sectionKey":"chemistry","order":5,"subjectId":"chemistry","questionCount":10,"durationSeconds":1200},{"sectionKey":"physics","order":6,"subjectId":"physics","questionCount":5,"durationSeconds":600}],"scoring":{"policyId":"raw-quarter-point-v1","correctQuarterPoints":4,"incorrectQuarterPoints":-1,"unansweredQuarterPoints":0},"syllabusRevisionId":null,"contentReleaseId":null,"timingPolicyId":"continuous-v1","submissionPolicyId":null,"totalQuestions":65,"totalDurationSeconds":8400}'', 1, N''PUBLISHED'', NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AvailableForNewStarts', N'ConfigurationRevision', N'ContentReleaseId', N'DefinitionJson', N'Revision', N'Status', N'SyllabusRevisionId') AND [object_id] = OBJECT_ID(N'[cent_exam_versions]'))
        SET IDENTITY_INSERT [cent_exam_versions] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_cent_attempt_sections_active] ON [cent_attempt_sections] ([AttemptId]) WHERE [State] = ''ACTIVE''');
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_attempt_sections_AttemptId_Order] ON [cent_attempt_sections] ([AttemptId], [Order]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_attempt_sections_AttemptId_SectionKey] ON [cent_attempt_sections] ([AttemptId], [SectionKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE INDEX [IX_cent_exam_content_releases_ReviewedBy] ON [cent_exam_content_releases] ([ReviewedBy]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE INDEX [IX_cent_exam_content_releases_SyllabusRevisionId] ON [cent_exam_content_releases] ([SyllabusRevisionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_exam_versions_ConfigurationRevision] ON [cent_exam_versions] ([ConfigurationRevision]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE INDEX [IX_cent_exam_versions_ContentReleaseId] ON [cent_exam_versions] ([ContentReleaseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE INDEX [IX_cent_exam_versions_SyllabusRevisionId] ON [cent_exam_versions] ([SyllabusRevisionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE INDEX [IX_cent_mock_attempts_ExamVersionId] ON [cent_mock_attempts] ([ExamVersionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    CREATE INDEX [IX_cent_mock_attempts_Status_ActiveDeadline] ON [cent_mock_attempts] ([Status], [ActiveDeadline]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261120134304_VersionedMockExams'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261120134304_VersionedMockExams', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122081723_VersionedCurriculum'
)
BEGIN
    CREATE TABLE [cent_curriculum_revisions] (
        [Id] nvarchar(100) NOT NULL,
        [SyllabusRevisionId] nvarchar(100) NOT NULL,
        [PackageHash] varchar(64) NOT NULL,
        [PayloadJson] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_cent_curriculum_revisions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_curriculum_revisions_cent_syllabus_revisions_SyllabusRevisionId] FOREIGN KEY ([SyllabusRevisionId]) REFERENCES [cent_syllabus_revisions] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122081723_VersionedCurriculum'
)
BEGIN
    CREATE TABLE [cent_practice_content] (
        [AttemptId] uniqueidentifier NOT NULL,
        [ReleaseId] nvarchar(100) NOT NULL,
        [PassagesJson] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_cent_practice_content] PRIMARY KEY ([AttemptId]),
        CONSTRAINT [FK_cent_practice_content_cent_attempts_AttemptId] FOREIGN KEY ([AttemptId]) REFERENCES [cent_attempts] ([Id]),
        CONSTRAINT [FK_cent_practice_content_cent_curriculum_revisions_ReleaseId] FOREIGN KEY ([ReleaseId]) REFERENCES [cent_curriculum_revisions] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122081723_VersionedCurriculum'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_curriculum_revisions_PackageHash] ON [cent_curriculum_revisions] ([PackageHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122081723_VersionedCurriculum'
)
BEGIN
    CREATE INDEX [IX_cent_curriculum_revisions_SyllabusRevisionId] ON [cent_curriculum_revisions] ([SyllabusRevisionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122081723_VersionedCurriculum'
)
BEGIN
    CREATE INDEX [IX_cent_practice_content_ReleaseId] ON [cent_practice_content] ([ReleaseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122081723_VersionedCurriculum'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261122081723_VersionedCurriculum', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    ALTER TABLE [cent_products] DROP CONSTRAINT [CK_cent_product_access];
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE TABLE [cent_recommended_bundles] (
        [Id] nvarchar(100) NOT NULL,
        [Title] nvarchar(256) NOT NULL,
        [SubjectsJson] nvarchar(max) NOT NULL,
        [Rationale] nvarchar(max) NOT NULL,
        [Evidence] nvarchar(max) NOT NULL,
        [Active] bit NOT NULL,
        CONSTRAINT [PK_cent_recommended_bundles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE TABLE [cent_subject_access] (
        [Id] uniqueidentifier NOT NULL,
        [EntitlementId] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [SubjectId] nvarchar(24) NOT NULL,
        [ContentReleaseId] nvarchar(100) NOT NULL,
        [StartsAt] datetimeoffset NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [RevokedAt] datetimeoffset NULL,
        CONSTRAINT [PK_cent_subject_access] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_cent_subject_term] CHECK ([ExpiresAt] > [StartsAt]),
        CONSTRAINT [FK_cent_subject_access_cent_courses_SubjectId] FOREIGN KEY ([SubjectId]) REFERENCES [cent_courses] ([Code]),
        CONSTRAINT [FK_cent_subject_access_cent_entitlements_EntitlementId] FOREIGN KEY ([EntitlementId]) REFERENCES [cent_entitlements] ([Id]),
        CONSTRAINT [FK_cent_subject_access_cent_orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [cent_orders] ([Id]),
        CONSTRAINT [FK_cent_subject_access_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE TABLE [cent_subject_offers] (
        [SubjectId] nvarchar(24) NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [ContentReleaseId] nvarchar(100) NOT NULL,
        [ReviewedBy] nvarchar(256) NULL,
        [ReviewedAt] datetimeoffset NULL,
        [Available] bit NOT NULL,
        CONSTRAINT [PK_cent_subject_offers] PRIMARY KEY ([SubjectId]),
        CONSTRAINT [FK_cent_subject_offers_cent_courses_SubjectId] FOREIGN KEY ([SubjectId]) REFERENCES [cent_courses] ([Code]),
        CONSTRAINT [FK_cent_subject_offers_cent_products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [cent_products] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE TABLE [cent_subject_order_lines] (
        [OrderId] uniqueidentifier NOT NULL,
        [SubjectId] nvarchar(24) NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [ContentReleaseId] nvarchar(100) NOT NULL,
        [ListRial] bigint NOT NULL,
        [DiscountRial] bigint NOT NULL,
        [PayableRial] bigint NOT NULL,
        CONSTRAINT [PK_cent_subject_order_lines] PRIMARY KEY ([OrderId], [SubjectId]),
        CONSTRAINT [CK_cent_subject_line_amount] CHECK ([ListRial] > 0 AND [DiscountRial] >= 0 AND [PayableRial] = [ListRial] - [DiscountRial] AND [PayableRial] > 0),
        CONSTRAINT [FK_cent_subject_order_lines_cent_orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [cent_orders] ([Id]),
        CONSTRAINT [FK_cent_subject_order_lines_cent_products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [cent_products] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE TABLE [cent_subject_quotes] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [PayloadJson] nvarchar(max) NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [OrderId] uniqueidentifier NULL,
        CONSTRAINT [PK_cent_subject_quotes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_cent_subject_quotes_cent_orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [cent_orders] ([Id]),
        CONSTRAINT [FK_cent_subject_quotes_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE TABLE [cent_subject_orders] (
        [OrderId] uniqueidentifier NOT NULL,
        [QuoteId] uniqueidentifier NOT NULL,
        [PayloadJson] nvarchar(max) NOT NULL,
        [InitiationState] nvarchar(24) NOT NULL,
        [DevelopmentOutcome] nvarchar(16) NULL,
        CONSTRAINT [PK_cent_subject_orders] PRIMARY KEY ([OrderId]),
        CONSTRAINT [FK_cent_subject_orders_cent_orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [cent_orders] ([Id]),
        CONSTRAINT [FK_cent_subject_orders_cent_subject_quotes_QuoteId] FOREIGN KEY ([QuoteId]) REFERENCES [cent_subject_quotes] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    EXEC(N'ALTER TABLE [cent_products] ADD CONSTRAINT [CK_cent_product_access] CHECK (([Kind] IN (''TRAINING'', ''SUBJECT'') AND [TrainingId] IS NOT NULL AND [DurationDays] IS NULL) OR ([Kind] = ''SUBSCRIPTION'' AND [TrainingId] IS NULL AND [DurationDays] BETWEEN 1 AND 366))');
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE INDEX [IX_cent_subject_access_EntitlementId] ON [cent_subject_access] ([EntitlementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_subject_access_OrderId_SubjectId] ON [cent_subject_access] ([OrderId], [SubjectId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE INDEX [IX_cent_subject_access_SubjectId] ON [cent_subject_access] ([SubjectId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE INDEX [IX_cent_subject_access_UserId_SubjectId_ExpiresAt] ON [cent_subject_access] ([UserId], [SubjectId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_subject_offers_ProductId] ON [cent_subject_offers] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE INDEX [IX_cent_subject_order_lines_ProductId] ON [cent_subject_order_lines] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_subject_orders_QuoteId] ON [cent_subject_orders] ([QuoteId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE INDEX [IX_cent_subject_quotes_OrderId] ON [cent_subject_quotes] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    CREATE INDEX [IX_cent_subject_quotes_UserId_ExpiresAt] ON [cent_subject_quotes] ([UserId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261122102343_SubjectCommerce'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261122102343_SubjectCommerce', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    ALTER TABLE [cent_google_attempts] ADD [LinkUserId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    CREATE TABLE [cent_mobile_identities] (
        [Phone] varchar(13) NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [VerifiedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_mobile_identities] PRIMARY KEY ([Phone]),
        CONSTRAINT [FK_cent_mobile_identities_cent_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [cent_users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    CREATE TABLE [cent_sms_budgets] (
        [Key] varchar(80) NOT NULL,
        [ResetAt] datetimeoffset NOT NULL,
        [NextAt] datetimeoffset NOT NULL,
        [Count] int NOT NULL,
        CONSTRAINT [PK_cent_sms_budgets] PRIMARY KEY ([Key])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    CREATE TABLE [cent_sms_challenges] (
        [IdHash] varchar(64) NOT NULL,
        [Phone] varchar(13) NOT NULL,
        [Verifier] varchar(64) NOT NULL,
        [LinkUserId] uniqueidentifier NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [ResendAt] datetimeoffset NOT NULL,
        [Attempts] int NOT NULL,
        [Delivered] bit NOT NULL,
        [Consumed] bit NOT NULL,
        CONSTRAINT [PK_cent_sms_challenges] PRIMARY KEY ([IdHash])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    CREATE UNIQUE INDEX [IX_cent_mobile_identities_UserId] ON [cent_mobile_identities] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    CREATE INDEX [IX_cent_sms_budgets_ResetAt] ON [cent_sms_budgets] ([ResetAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    CREATE INDEX [IX_cent_sms_challenges_ExpiresAt] ON [cent_sms_challenges] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    CREATE INDEX [IX_cent_sms_challenges_Phone] ON [cent_sms_challenges] ([Phone]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261123135254_AddCentSmsAuthentication'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261123135254_AddCentSmsAuthentication', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261124155704_ReaderPilotAnchors'
)
BEGIN
    ALTER TABLE [cent_notes] ADD [AnchorJson] nvarchar(2000) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261124155704_ReaderPilotAnchors'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261124155704_ReaderPilotAnchors', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261124174931_ReaderProtectionBudgets'
)
BEGIN
    CREATE TABLE [cent_reader_budgets] (
        [Key] nvarchar(96) NOT NULL,
        [StateJson] nvarchar(max) NOT NULL,
        [UpdatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_cent_reader_budgets] PRIMARY KEY ([Key])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261124174931_ReaderProtectionBudgets'
)
BEGIN
    CREATE INDEX [IX_cent_reader_budgets_UpdatedAt] ON [cent_reader_budgets] ([UpdatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [cent_migrations_history]
    WHERE [MigrationId] = N'20261124174931_ReaderProtectionBudgets'
)
BEGIN
    INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
    VALUES (N'20261124174931_ReaderProtectionBudgets', N'10.0.11');
END;

COMMIT;
GO

