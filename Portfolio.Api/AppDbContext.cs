using Microsoft.EntityFrameworkCore;

public class AppDbContext: DbContext
{
    public DbSet<Project> Projects {get; set;}

    public AppDbContext(DbContextOptions<AppDbContext> options): base(options){
        
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>().HasData( 
            new Project (
                1,
                "League of Legends win predictor",
                "Can you predict who wins a professional League of Legends match? I built this to learn more about the logic behind AI, and to combine that with one of my interests.",
                "https://github.com/lwmikkel/cv-portfolio/tree/main/projects/league-draft-ml",
                "Private project",
                "Python, Pandas, scikit-learn",
                "Written in Python with Pandas and scikit-learn, using 2,079 professional matches from 2026. | Every team gets an Elo rating that is updated after each match. | A logistic regression turns the rating difference into a win probability. | Team strength predicted the winner in about 60% of the matches. The champions picked in the draft added almost nothing."
                ),
            new Project(
                2,
                "AI invoice reader",
                "Reads PDF invoices, checks the numbers and collects everything in an Excel report. I built it to try automating a real process with AI and to learn more about it.",
                "https://github.com/lwmikkel/cv-portfolio/tree/main/projects/invoice-reader",
                "Private project",
                "Python, Claude API, pdfplumber, Excel",
                "Written in Python. The text is read from each PDF with pdfplumber. | The Claude API finds supplier, invoice number, date, subtotal, VAT and total. | The code checks that VAT is 25% of the subtotal and that the total adds up. | The Excel report marks each invoice green, red or yellow, and the files are sorted into folders for approved, errors and missing information."
                ),
            new Project(
                3,
                "Event platform, Aalborg University",
                "A platform where students can find and sign up for events at the university. We built it to make events easier to find, especially for new students, because we felt there was no good overview.",
                "...",
                "2nd semester project",
                "Node.js, Express, MongoDB, JWT",
                "A full-stack web application with a Node.js and Express server and a MongoDB database. | Two roles: students find, save and sign up for events, and organizers create, edit and publish them. | Login with hashed passwords and JSON Web Tokens, and the routes are protected by role. | The front end is written in plain HTML, CSS and JavaScript."
            )
        );
    }
} 