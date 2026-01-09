// ================================================================
// CẤU HÌNH KẾT NỐI SERVER
// ================================================================
const API_URL = "/api/chat";
const myUsername = localStorage.getItem("username");
let currentReceiver = null;

// 1. Kiểm tra đăng nhập
if (!myUsername) {
    window.location.href = "/Login-form/index.html";
}

// 2. Thiết lập kết nối SignalR (Real-time)
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub") // Đảm bảo bạn đã tạo ChatHub.cs và cấu hình Program.cs
    .build();

// Bắt đầu kết nối
connection.start().then(() => {
    console.log("🟢 Đã kết nối SignalR thành công!");
    // Tải danh sách user ngay khi vào
    loadUserList();
}).catch(err => {
    console.error("🔴 Lỗi kết nối SignalR:", err);
    // Nếu lỗi SignalR (do chưa làm backend), vẫn tải user để dùng đỡ
    loadUserList();
});

// 3. Lắng nghe tin nhắn từ Server bắn về
connection.on("ReceiveMessage", (user, message, time) => {
    // Chỉ hiện tin nhắn nếu đang chat với người đó HOẶC chính mình gửi
    if ((user === myUsername && currentReceiver) || (user === currentReceiver)) {
        addMessageToUI(user, message, time);
    }
    // (Nâng cao: Có thể thêm code để hiện thông báo tin nhắn mới ở Sidebar tại đây)
});

// ================================================================
// CÁC HÀM XỬ LÝ GIAO DIỆN (LOGIC)
// ================================================================

function logout() {
    localStorage.removeItem("username");
    window.location.href = "/Login-form/index.html";
}

// 4. Tải danh sách User (Render giao diện mới có chấm xanh)
async function loadUserList() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();
        
        const listHtml = document.getElementById("userList");
        listHtml.innerHTML = "";

        if (users.length === 0) {
            listHtml.innerHTML = "<p style='text-align:center; color:#999; margin-top:20px'>Chưa có ai online</p>";
        }

        users.forEach(u => {
            const name = u.username || u.Username; 

            if (name && name !== myUsername) {
                const firstLetter = name.charAt(0).toUpperCase();

                const div = document.createElement("div");
                div.className = "user-item";
                
                // HTML khớp với CSS Messenger mới (có status-dot)
                div.innerHTML = `
                    <div class="avatar">
                        ${firstLetter}
                        <div class="status-dot"></div>
                    </div>
                    <div class="user-info">
                        <h6>${name}</h6>
                        <p>Nhấn để nhắn tin...</p>
                    </div>
                `;
                
                div.onclick = () => selectUser(name, div, firstLetter);
                listHtml.appendChild(div);
            }
        });
    } catch (err) {
        console.error("Lỗi tải user:", err);
    }
}

// 5. Chọn người để chat (Xử lý ẩn hiện Layout Messenger)
function selectUser(username, element, avatarLetter) {
    currentReceiver = username;
    
    // --- XỬ LÝ GIAO DIỆN ---
    // 1. Ẩn màn hình chờ (Logo), hiện khung chat
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("messagesBox").style.display = "flex";
    document.getElementById("chatHeader").style.visibility = "visible";

    // 2. Cập nhật thông tin trên Header
    document.getElementById("chatTitle").innerText = username;
    document.getElementById("headerAvatar").innerText = avatarLetter;
    
    // 3. Đổi màu active ở Sidebar
    document.querySelectorAll(".user-item").forEach(el => el.classList.remove("active"));
    element.classList.add("active");

    // 4. Mở khóa ô nhập liệu
    document.getElementById("msgInput").disabled = false;
    document.getElementById("btnSend").disabled = false;
    document.getElementById("msgInput").focus();

    // 5. Tải lại lịch sử tin nhắn cũ
    loadHistory();
}

// 6. Tải lịch sử tin nhắn (Từ API)
async function loadHistory() {
    if (!currentReceiver) return;

    try {
        // Gọi API lấy tin nhắn cũ
        const res = await fetch(`${API_URL}/history?user1=${myUsername}&user2=${currentReceiver}`);
        const messages = await res.json();

        const box = document.getElementById("messagesBox");
        box.innerHTML = ""; // Xóa tin cũ

        if(messages.length === 0) {
            box.innerHTML = "<div style='text-align:center; color:#ccc; margin-top:50px;'>Hãy gửi lời chào 👋</div>";
            return;
        }

        messages.forEach(msg => {
            addMessageToUI(msg.senderUsername, msg.content, msg.sentAt);
        });
        
        // Cuộn xuống dưới cùng
        box.scrollTop = box.scrollHeight;

    } catch (err) {
        console.error(err);
    }
}

// 7. Hàm vẽ tin nhắn lên màn hình (Dùng chung cho cả Lịch sử & Realtime)
function addMessageToUI(user, message, time) {
    const box = document.getElementById("messagesBox");
    
    // Nếu trong box có dòng "Hãy gửi lời chào", xóa nó đi
    if(box.innerHTML.includes("Hãy gửi lời chào")) box.innerHTML = "";

    const isMe = user === myUsername;
    const div = document.createElement("div");
    
    // Class CSS: msg-sent (xanh) hoặc msg-received (xám)
    div.className = `message ${isMe ? "msg-sent" : "msg-received"}`;
    
    const timeStr = new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    div.innerHTML = `
        ${message}
        <span class="msg-time">${timeStr}</span>
    `;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// 8. Gửi tin nhắn (Dùng SignalR)
async function sendMessage() {
    const input = document.getElementById("msgInput");
    const content = input.value.trim();

    if (!content || !currentReceiver) return;

    try {
        // Gửi qua SignalR Hub (Nhanh, Realtime)
        await connection.invoke("SendMessageRealTime", myUsername, currentReceiver, content);
        
        // Xóa ô nhập sau khi gửi
        input.value = ""; 
        input.focus();
    } catch (err) {
        console.error("Lỗi gửi tin:", err);
        alert("Không thể gửi tin. Kiểm tra lại kết nối Server!");
    }
}

// Bắt sự kiện nhấn Enter để gửi
document.getElementById("msgInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});