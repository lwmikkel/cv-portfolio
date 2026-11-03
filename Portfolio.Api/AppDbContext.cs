using Microsoft.EntityFrameworkCore;

public class AppDbContext: DbContext
{
    public DbSet<Project> Projects {get; set;}

    public AppDbContext(DbContextOptions<AppDbContext> options): base(options){
        
    }
} 