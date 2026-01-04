/*
  LOGIC: Hiệu ứng con gấu + Gọi API Đăng nhập
*/

let emailInput = document.querySelector(".username"); 
let passwordInput = document.querySelector(".password");
let face = document.querySelector(".face");

// --- PHẦN 1: HIỆU ỨNG CON GẤU ---

// Khi bấm vào ô mật khẩu => Tay che mắt
if (passwordInput) {
    passwordInput.addEventListener("focus", () => {
        document.querySelectorAll(".hand").forEach(hand => hand.classList.add("hide"));
        document.querySelector(".tongue").classList.remove("breath");
    });

    // Khi bỏ chuột ra khỏi ô mật khẩu => Tay hạ xuống
    passwordInput.addEventListener("blur", () => {
        document.querySelectorAll(".hand").forEach(hand => {
            hand.classList.remove("hide");
            hand.classList.remove("peek");
        });
        document.querySelector(".tongue").classList.add("breath");
    });

    // Nhấn Enter để login
    passwordInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            login();
        }
    });
}

// Khi nhập Username => Đầu gấu xoay theo
if (emailInput) {
    emailInput.addEventListener("focus", () => {
        let length = Math.min(emailInput.value.length - 16, 19);
        document.querySelectorAll(".hand").forEach(hand => {
            hand.classList.remove("hide");
            hand.classList.remove("peek");
        });
        if (face) face.style.setProperty("--rotate-head", `${-length}deg`);
    });

    emailInput.addEventListener("blur", () => {
        if (face) face.style.setProperty("--rotate-head", "0deg");
    });

    emailInput.addEventListener("input", (event) => {
        let length = Math.min(event.target.value.length - 16, 19);
        if (face) face.style.setProperty("--rotate-head", `${-length}deg`);
    });
}

// --- PHẦN 2: GỌI API ĐĂNG NHẬP ---

async function login() {
    const username = emailInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    try {
        // Gửi yêu cầu lên Server
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Lưu thông tin người dùng
            localStorage.setItem("username", username);
            
            alert("Đăng nhập thành công!");
            
            // Chuyển hướng vào trang Chat
            window.location.href = "/html/chat.html"; 
        } 
        else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối tới Server.");
    }
}