BEGIN TRANSACTION;
CREATE TABLE [cent_reader_budgets] (
    [Key] nvarchar(96) NOT NULL,
    [StateJson] nvarchar(max) NOT NULL,
    [UpdatedAt] datetimeoffset NOT NULL,
    CONSTRAINT [PK_cent_reader_budgets] PRIMARY KEY ([Key])
);

CREATE INDEX [IX_cent_reader_budgets_UpdatedAt] ON [cent_reader_budgets] ([UpdatedAt]);

INSERT INTO [cent_migrations_history] ([MigrationId], [ProductVersion])
VALUES (N'20261124174931_ReaderProtectionBudgets', N'10.0.11');

COMMIT;
GO

