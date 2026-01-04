using ChatAppApi.Data; // Nhớ dùng đúng namespace của bạn (GmailAppApi hoặc ChatAppApi)
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Kết nối SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// --- CẤU HÌNH FILE TĨNH (Đã sửa lỗi 404 chat.js) ---

// 1. QUAN TRỌNG: Luôn cho phép truy cập file trong wwwroot (để load được js/chat.js)
app.UseStaticFiles(); 

// 2. Cấu hình để khi vào trang chủ (/) thì chạy Login-form
var loginPath = Path.Combine(builder.Environment.WebRootPath, "Login-form");
if (Directory.Exists(loginPath))
{
    // Thiết lập trang mặc định là index.html trong Login-form
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(loginPath),
        RequestPath = "",
        DefaultFileNames = new List<string> { "index.html" }
    });

    // Cho phép load các file css/js bên trong Login-form
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(loginPath),
        RequestPath = ""
    });
}
else
{
    app.UseDefaultFiles();
}

// 3. Cấu hình thư mục HTML (cho trang Chat)
var htmlPath = Path.Combine(builder.Environment.WebRootPath, "html");
if (Directory.Exists(htmlPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(htmlPath),
        RequestPath = "/html"
    });
}

app.Run();