using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class ExtendProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bullets",
                table: "Projects",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Kicker",
                table: "Projects",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Tech",
                table: "Projects",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Bullets", "Kicker", "Tech" },
                values: new object[] { "....", "Machine learning", "Python, Pandas" });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Bullets", "Kicker", "Tech" },
                values: new object[] { "Extracts supplier, number, amounts and VAT from an invoice. | Checks that the VAT and the total add up. | Writes the result to an Excel report with colours for OK and errors.", "AI project", "Claude API, Excel" });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Bullets", "Kicker", "Tech" },
                values: new object[] { "Event listing and sign-up for students.| A server in Node.js and Express with the data stored in MongoDB.", "2nd semester project", "Node.js, Express, MongoDB" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bullets",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Kicker",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Tech",
                table: "Projects");
        }
    }
}
