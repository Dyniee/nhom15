using ChatAppApi.Models; // <-- Phải có dòng này mới nhận diện được Message
using Microsoft.EntityFrameworkCore;

namespace ChatAppApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<UserAccount> UserAccounts { get; set; }
        public DbSet<Message> Messages { get; set; } // Nếu Message.cs sai namespace, dòng này sẽ lỗi đỏ
    }
}