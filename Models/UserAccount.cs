using System.ComponentModel.DataAnnotations;

namespace ChatAppApi.Models // Đã sửa namespace
{
    public class UserAccount
    {
        [Key]
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime LoginDate { get; set; } = DateTime.Now;
    }
}