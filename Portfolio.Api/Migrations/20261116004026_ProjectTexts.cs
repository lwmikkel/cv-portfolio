using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class ProjectTexts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Bullets", "Description", "Kicker", "Link", "Name", "Tech" },
                values: new object[] { "Written in Python with Pandas and scikit-learn, using 2,079 professional matches from 2026. | Every team gets an Elo rating that is updated after each match. | A logistic regression turns the rating difference into a win probability. | Team strength predicted the winner in about 60% of the matches. The champions picked in the draft added almost nothing.", "Can you predict who wins a professional League of Legends match? I built this to learn more about the logic behind AI, and to combine that with one of my interests.", "Private project", "https://github.com/lwmikkel/cv-portfolio/tree/main/projects/league-draft-ml", "League of Legends win predictor", "Python, Pandas, scikit-learn" });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Bullets", "Description", "Kicker", "Link", "Name", "Tech" },
                values: new object[] { "Written in Python. The text is read from each PDF with pdfplumber. | The Claude API finds supplier, invoice number, date, subtotal, VAT and total. | The code checks that VAT is 25% of the subtotal and that the total adds up. | The Excel report marks each invoice green, red or yellow, and the files are sorted into folders for approved, errors and missing information.", "Reads PDF invoices, checks the numbers and collects everything in an Excel report. I built it to try automating a real process with AI and to learn more about it.", "Private project", "https://github.com/lwmikkel/cv-portfolio/tree/main/projects/invoice-reader", "AI invoice reader", "Python, Claude API, pdfplumber, Excel" });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Bullets", "Description", "Name", "Tech" },
                values: new object[] { "A full-stack web application with a Node.js and Express server and a MongoDB database. | Two roles: students find, save and sign up for events, and organizers create, edit and publish them. | Login with hashed passwords and JSON Web Tokens, and the routes are protected by role. | The front end is written in plain HTML, CSS and JavaScript.", "A platform where students can find and sign up for events at the university. We built it to make events easier to find, especially for new students, because we felt there was no good overview.", "Event platform, Aalborg University", "Node.js, Express, MongoDB, JWT" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Bullets", "Description", "Kicker", "Link", "Name", "Tech" },
                values: new object[] { "....", "Estimates the probability for a League of legends team to win", "Machine learning", "....", "Machine learning project quote 2", "Python, Pandas" });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Bullets", "Description", "Kicker", "Link", "Name", "Tech" },
                values: new object[] { "Extracts supplier, number, amounts and VAT from an invoice. | Checks that the VAT and the total add up. | Writes the result to an Excel report with colours for OK and errors.", "Reads invoices, calculates tax and output them in excel file with color on which is wrong and right", "AI project", "....", "Ai invoice reader", "Claude API, Excel" });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Bullets", "Description", "Name", "Tech" },
                values: new object[] { "Event listing and sign-up for students.| A server in Node.js and Express with the data stored in MongoDB.", "Platform for Aalborg university for events. Fullstack web application", "Event platform Aalborg university ", "Node.js, Express, MongoDB" });
        }
    }
}
