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
                "...."

                ),
            new Project(
                2,
                "Ai invoice reader",
                "Reads invoices, calculates tax and output them in excel file with color on which is wrong and right",
                "...." 
                ),
            new Project(
                3,
                "2. Semester project: Event platform Aalborg university ",
                "Platform for Aalborg university for events. Fullstack web application",
                "..."
            )
        );
    }
} 