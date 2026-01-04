const API_URL = "/api/chat"; 
const myUsername = localStorage.getItem("username");
let currentReceiver = null;
let pollingInterval = null;

// 1. Kiểm tra đăng nhập
if (!myUsername) {
    window.location.href = "/Login-form/index.html";
} else {
    document.getElementById("currentUserDisplay").innerText = "Xin chào, " + myUsername;
    loadUserList();
}

function logout() {
    localStorage.removeItem("username");
    window.location.href = "/Login-form/index.html";
}

// 2. Tải danh sách User (Có thêm Avatar)
async function loadUserList() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();
        
        const listHtml = document.getElementById("userList");
        listHtml.innerHTML = "";

        if (users.length === 0) {
            listHtml.innerHTML = "<p class='text-center text-muted mt-3'>Chưa có ai online</p>";
        }

        users.forEach(u => {
            const name = u.username || u.Username; 

            if (name && name !== myUsername) {
                // Tạo chữ cái đầu để làm Avatar
                const firstLetter = name.charAt(0).toUpperCase();

                const div = document.createElement("div");
                div.className = "user-item";
                
                // HTML cho user item mới
                div.innerHTML = `
                    <div class="avatar">${firstLetter}</div>
                    <div class="user-info">
                        <b>${name}</b>
                        <span>Nhấn để chat</span>
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

// 3. Chọn người để chat
function selectUser(username, element, avatarLetter) {
    currentReceiver = username;
    
    // Cập nhật Header Chat
    document.getElementById("chatTitle").innerHTML = `<b>${username}</b><br><small style='font-size:11px; color:green'>● Đang hoạt động</small>`;
    
    // Hiển thị Avatar nhỏ trên header
    const headerAvatar = document.getElementById("currentReceiverAvatar");
    headerAvatar.style.display = "flex";
    headerAvatar.innerText = avatarLetter;

    // Active UI
    document.querySelectorAll(".user-item").forEach(el => el.classList.remove("active"));
    element.classList.add("active");

    // Mở khóa nhập liệu
    document.getElementById("msgInput").disabled = false;
    document.getElementById("btnSend").disabled = false;
    document.getElementById("msgInput").focus();

    loadMessages();
    
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(loadMessages, 2000);
}

// 4. Tải tin nhắn
async function loadMessages() {
    if (!currentReceiver) return;

    try {
        const res = await fetch(`${API_URL}/history?user1=${myUsername}&user2=${currentReceiver}`);
        const messages = await res.json();

        const box = document.getElementById("messagesBox");
        box.innerHTML = "";

        if(messages.length === 0) {
            box.innerHTML = "<div class='text-center text-muted mt-5'>Chưa có tin nhắn nào. Hãy nói 'Xin chào' 👋</div>";
            return;
        }

        messages.forEach(msg => {
            const isMe = msg.senderUsername === myUsername;
            const div = document.createElement("div");
            div.className = `message ${isMe ? "msg-sent" : "msg-received"}`;
            
            // Format thời gian
            const time = new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            div.innerHTML = `
                ${msg.content}
                <span class="msg-time">${time}</span>
            `;
            box.appendChild(div);
        });

        box.scrollTop = box.scrollHeight;

    } catch (err) {
        console.error(err);
    }
}

// 5. Gửi tin nhắn
async function sendMessage() {
    const input = document.getElementById("msgInput");
    const content = input.value.trim();

    if (!content || !currentReceiver) return;

    try {
        const res = await fetch(`${API_URL}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senderUsername: myUsername,
                receiverUsername: currentReceiver,
                content: content
            })
        });

        if (res.ok) {
            input.value = ""; 
            loadMessages();
        } 
    } catch (err) {
        console.error("Lỗi gửi tin:", err);
    }
}

document.getElementById("msgInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});