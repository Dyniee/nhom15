using System;
using System.ComponentModel.DataAnnotations;

namespace ChatAppApi.Models // <-- Quan trọng: Phải là ChatAppApi.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public string ReceiverUsername { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.Now;
    }

    public class SendMessageRequest
    {
        public string SenderUsername { get; set; } = string.Empty;
        public string ReceiverUsername { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}