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
                "Estimates the probability that a League of Legends team wins a match. I built it to learn more about the logic behind AI, and to combine that with one of my interests.",
                "....",
                "Private project",
                "Python, Pandas",
                "Written in Python. | Pandas handles the match data the model learns from. | The model rates every team and predicts each match before it sees the result."
                ),
            new Project(
                2,
                "AI invoice reader",
                "Reads invoices and writes the result to an Excel file, where colours show which invoices are correct and which have errors. I built it to try automating a real process with AI and to learn more about it.",
                "....",
                "Private project",
                "Python, Claude API, Excel",
                "Written in Python. | The Claude API extracts supplier, invoice number, amounts and VAT from each invoice. | The code checks that VAT and total add up before it writes the Excel report."
                ),
            new Project(
                3,
                "Event platform, Aalborg University",
                "A platform where students can find and sign up for events at the university. We built it to make events easier to find, especially for new students, because we felt there was no good overview.",
                "...",
                "2nd semester project",
                "Node.js, Express, MongoDB",
                "A full-stack web application. | The server is written in Node.js and Express. | The data is stored in MongoDB."
            )
        );
    }
} 