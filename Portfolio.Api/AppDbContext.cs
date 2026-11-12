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
                "Machine learning project quote 2",
                "Estimates the probability for a League of legends team to win",
                "....",
                "Machine learning",
                "Python, Pandas",
                "...."
                

                ),
            new Project(
                2,
                "Ai invoice reader",
                "Reads invoices, calculates tax and output them in excel file with color on which is wrong and right",
                "....",
                "AI project",
                "Claude API, Excel",
                "Extracts supplier, number, amounts and VAT from an invoice. | Checks that the VAT and the total add up. | Writes the result to an Excel report with colours for OK and errors."
    
                ),
            new Project(
                3,
                "Event platform Aalborg university ",
                "Platform for Aalborg university for events. Fullstack web application",
                "...",
                "2nd semester project",
                "Node.js, Express, MongoDB",
                "Event listing and sign-up for students.| A server in Node.js and Express with the data stored in MongoDB."
            )
        );
    }
} 