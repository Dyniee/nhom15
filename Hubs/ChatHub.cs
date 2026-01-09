using Microsoft.AspNetCore.SignalR;
using ChatAppApi.Data;
using ChatAppApi.Models;
using System;
using System.Threading.Tasks;

namespace ChatAppApi.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        // Hàm này được Client (Javascript) gọi để gửi tin nhắn
        public async Task SendMessageRealTime(string user1, string user2, string message)
        {
            // 1. Lưu tin nhắn vào Database (để lưu lịch sử)
            var msg = new Message
            {
                SenderUsername = user1,
                ReceiverUsername = user2,
                Content = message,
                SentAt = DateTime.Now
            };

            _context.Messages.Add(msg);
            await _context.SaveChangesAsync();

            // 2. Bắn tin nhắn NGAY LẬP TỨC tới người nhận (Real-time)
            // Trong thực tế sẽ dùng Clients.User(userId), ở đây dùng Clients.All cho đơn giản
            await Clients.All.SendAsync("ReceiveMessage", user1, message, msg.SentAt);
        }
    }
}