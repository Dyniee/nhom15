using ChatAppApi.Data;
using ChatAppApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatAppApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        // API 1: Gửi tin nhắn
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Content))
                return BadRequest("Nội dung tin nhắn không được để trống");

            // Kiểm tra người nhận có tồn tại không
            var receiverExists = await _context.UserAccounts
                .AnyAsync(u => u.Username == request.ReceiverUsername);

            if (!receiverExists)
                return NotFound("Người nhận không tồn tại trong hệ thống");

            var newMessage = new Message
            {
                SenderUsername = request.SenderUsername,
                ReceiverUsername = request.ReceiverUsername,
                Content = request.Content,
                SentAt = DateTime.Now
            };

            _context.Messages.Add(newMessage);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi thành công", data = newMessage });
        }

        // API 2: Lấy lịch sử chat giữa 2 người
        [HttpGet("history")]
        public async Task<IActionResult> GetChatHistory(string user1, string user2)
        {
            var messages = await _context.Messages
                .Where(m => (m.SenderUsername == user1 && m.ReceiverUsername == user2) ||
                            (m.SenderUsername == user2 && m.ReceiverUsername == user1))
                .OrderBy(m => m.SentAt) 
                .ToListAsync();

            return Ok(messages);
        }

        // API 3: Lấy danh sách người dùng (ĐÃ SỬA: Không nhận tham số đầu vào để tránh lỗi 400)
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.UserAccounts
                .Select(u => new { u.Username }) 
                .ToListAsync();
            return Ok(users);
        }
    }
}