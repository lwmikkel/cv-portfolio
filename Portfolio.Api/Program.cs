var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapGet("/projects", () =>
{
    var projects = new []
    {
        new Project (
        
            "Machine learning project quote 2",
            "Estimates the probability for a League of legends team to win",
            "...."

        ),
        new Project(
            "Ai invoice reader",
            "Reads invoices, calculates tax and output them in excel file with color on which is wrong and right",
            "...." 
        ),
        new Project(
            "2. Semester project: Event platform Aalborg university ",
            "Platform for Aalborg university for events. Fullstack web application",
            "..."
        )

    };
    return projects;
});


app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

record Project(string Name, string Description, string Link);