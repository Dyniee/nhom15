-- 1. Tạo Database mới cho ứng dụng Chat
CREATE DATABASE ChatAppDB;
GO

USE ChatAppDB;
GO

-- 2. Tạo bảng Tài khoản (Dùng để đăng nhập)
CREATE TABLE UserAccounts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(255) NOT NULL UNIQUE, -- Thêm UNIQUE để tránh trùng tên
    Password NVARCHAR(255) NOT NULL,
    LoginDate DATETIME DEFAULT GETDATE()
);
GO

-- 3. Tạo bảng Tin nhắn (Lưu nội dung Chat)
CREATE TABLE Messages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SenderUsername NVARCHAR(255) NOT NULL,   -- Người gửi
    ReceiverUsername NVARCHAR(255) NOT NULL, -- Người nhận
    Content NVARCHAR(MAX) NOT NULL,          -- Nội dung tin nhắn
    SentAt DATETIME DEFAULT GETDATE()        -- Thời gian gửi
);
GO

-- 4. Thêm dữ liệu mẫu (Optional - để test)
INSERT INTO UserAccounts (Username, Password) VALUES ('admin', '123');
INSERT INTO UserAccounts (Username, Password) VALUES ('user1', '123');
INSERT INTO UserAccounts (Username, Password) VALUES ('user2', '123');
GO