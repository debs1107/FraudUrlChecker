using Microsoft.EntityFrameworkCore;
using FraudDetectionAPI.Models;

namespace FraudDetectionAPI.Data
{
    public class FraudDbContext : DbContext
    {
        public FraudDbContext(DbContextOptions<FraudDbContext> options) : base(options) { }

        public DbSet<FraudUrl> FraudUrls { get; set; }
    }
}

