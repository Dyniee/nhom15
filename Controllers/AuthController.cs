using ChatAppApi.Data;   // Đã sửa
using ChatAppApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatAppApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Kiểm tra dữ liệu gửi lên
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Vui lòng nhập đầy đủ Username và Password.");
            }

            try 
            {
                // 2. Tìm user trong Database
                var user = await _context.UserAccounts
                    .FirstOrDefaultAsync(u => u.Username == request.Username && u.Password == request.Password);

                if (user == null)
                {
                    return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu!" });
                }

                // 3. Trả về kết quả thành công
                return Ok(new { 
                    message = "Đăng nhập thành công", 
                    username = user.Username,
                    id = user.Id
                });
            }
            catch (Exception ex)
            {
                // 4. Bắt lỗi nếu Server bị sập (in lỗi ra để sửa)
                Console.WriteLine("LỖI LOGIN: " + ex.Message); // Xem dòng này ở màn hình đen
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }
    }
}