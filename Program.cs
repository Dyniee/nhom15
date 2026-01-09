using ChatAppApi.Data;
using ChatAppApi.Hubs; // <-- QUAN TRỌNG: Để dùng được ChatHub
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CẤU HÌNH DỊCH VỤ (SERVICES)
// ==========================================

builder.Services.AddControllers();

// A. Thêm dịch vụ SignalR (Quan trọng cho Real-time/Chịu tải cao)
builder.Services.AddSignalR(); 

// B. Kết nối SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// ==========================================
// 2. CẤU HÌNH PIPELINE (MIDDLEWARE)
// ==========================================

app.UseHttpsRedirection();
app.UseAuthorization();

// A. Định tuyến API và Hub
app.MapControllers();               // Dành cho API thường
app.MapHub<ChatHub>("/chatHub");    // Dành cho SignalR (Chat Real-time)

// ==========================================
// 3. CẤU HÌNH FILE TĨNH (STATIC FILES)
// ==========================================

// BƯỚC 1: Cho phép truy cập toàn bộ file trong thư mục wwwroot
// (Để load được js/chat.js, css/chat-style.css...)
app.UseStaticFiles();

// BƯỚC 2: Cấu hình Login-form làm TRANG CHỦ MẶC ĐỊNH
// (Khi vào localhost:5000 sẽ chạy Login-form/index.html ngay)
var loginPath = Path.Combine(builder.Environment.WebRootPath, "Login-form");
if (Directory.Exists(loginPath))
{
    // A. Thiết lập file mặc định là index.html (của Login-form)
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(loginPath),
        RequestPath = "", 
        DefaultFileNames = new List<string> { "index.html" }
    });

    // B. Cho phép load css/js bên trong thư mục Login-form
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(loginPath),
        RequestPath = "" 
    });
}

// BƯỚC 3: Cấu hình thư mục html (Chứa chat.html)
var htmlPath = Path.Combine(builder.Environment.WebRootPath, "html");
if (Directory.Exists(htmlPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(htmlPath),
        RequestPath = "/html"
    });
}

// ==========================================
// 4. CHẠY ỨNG DỤNG
// ==========================================
app.Run();