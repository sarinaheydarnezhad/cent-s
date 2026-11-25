using System.Text.Json;
using Cent.Module;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

// Explicit maintenance only; never called by web startup or a deployment hook.
var action = args.FirstOrDefault() ?? "script";
if (action is not ("script" or "inspect" or "import")) throw new ArgumentException("Use script, inspect or import.");
var connection = Environment.GetEnvironmentVariable("CENT_RELEASE_CONNECTION") ?? "Server=(localdb)\\ItatestPhase4;Database=Itatest_OfflineScript;Integrated Security=true;TrustServerCertificate=true";
var target = new SqlConnectionStringBuilder(connection);
var expected = Environment.GetEnvironmentVariable("CENT_RELEASE_DATABASE");
if (action != "script" && (string.IsNullOrWhiteSpace(expected) || target.InitialCatalog != expected ||
    new[] { "master", "model", "msdb", "tempdb" }.Contains(expected, StringComparer.OrdinalIgnoreCase) || expected.Contains("lerona", StringComparison.OrdinalIgnoreCase)))
    throw new InvalidOperationException("Set the exact dedicated Cent database in CENT_RELEASE_DATABASE and CENT_RELEASE_CONNECTION. System/Lerona databases are refused.");
await using var db = new CentDbContext(new DbContextOptionsBuilder<CentDbContext>()
    .UseSqlServer(connection, sql => sql.MigrationsHistoryTable("cent_migrations_history")).Options);
if (db.Database.HasPendingModelChanges()) throw new InvalidOperationException("Pending Cent model changes.");
if (action == "script") {
    var path = Path.GetFullPath(args.ElementAtOrDefault(1) ?? "cent-migrations.sql");
    await File.WriteAllTextAsync(path, db.GetService<IMigrator>().GenerateScript(options: MigrationsSqlGenerationOptions.Idempotent));
    Console.WriteLine("Generated Cent-only idempotent SQL: " + path); return;
}
await db.Database.OpenConnectionAsync();
await using (var command = db.Database.GetDbConnection().CreateCommand()) {
    command.CommandText = "SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped=0 AND name NOT LIKE 'cent[_]%'";
    if (Convert.ToInt32(await command.ExecuteScalarAsync()) != 0) throw new InvalidOperationException("Non-Cent tables found. Use a dedicated Cent-only database.");
}
var pending = (await db.Database.GetPendingMigrationsAsync()).ToArray();
if (action == "inspect") {
    Console.WriteLine(JsonSerializer.Serialize(new { database = target.InitialCatalog, pendingMigrations = pending, reviewedHash = CentReviewedContent.Hash })); return;
}
if (!args.Contains("--apply")) throw new InvalidOperationException("Import requires --apply and a verified-backup receipt path as the second argument.");
var receipt = JsonDocument.Parse(await File.ReadAllTextAsync(args.ElementAtOrDefault(1) ?? throw new ArgumentException("Missing backup receipt path."))).RootElement;
if (receipt.GetProperty("database").GetString() != expected || !receipt.GetProperty("centOnly").GetBoolean() ||
    !receipt.GetProperty("verifyOnlyPassed").GetBoolean() || !receipt.GetProperty("restoreRehearsalPassed").GetBoolean() ||
    receipt.GetProperty("sha256").GetString() is not { Length: 64 } ||
    receipt.GetProperty("completedUtc").GetDateTimeOffset() < DateTimeOffset.UtcNow.AddHours(-24) ||
    receipt.GetProperty("completedUtc").GetDateTimeOffset() > DateTimeOffset.UtcNow ||
    string.IsNullOrWhiteSpace(receipt.GetProperty("backupFile").GetString()))
    throw new InvalidOperationException("A current, verified, rehearsed Cent-only backup receipt is required.");
if (pending.Length != 0) throw new InvalidOperationException("Apply the reviewed Cent SQL migration script before importing.");
Console.WriteLine(JsonSerializer.Serialize(await new CentCurriculumImporter(db).Import()));
Console.WriteLine(JsonSerializer.Serialize(new { reviewedHash = CentReviewedContent.Hash,
    sources = await db.Sources.CountAsync(), sections = await db.SourceSections.CountAsync(), questions = await db.Questions.CountAsync() }));
