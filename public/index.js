document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore(); // 获取Firestore数据库的引用

    window.register = function() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const birthDate = document.getElementById('birth-date').value;
        const gender = document.getElementById('gender').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const jobRole = document.getElementById('job-role').value;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // 用户账户创建成功后，存储额外信息到Firestore数据库
                const uid = userCredential.user.uid;
                return db.collection('users').doc(uid).set({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    birthDate: birthDate,
                    gender: gender,
                    phoneNumber: phoneNumber,
                    jobRole: jobRole
                });
            })
            .then(() => {
                console.log("Additional user information saved successfully.");
                window.location.href = 'dashboard.html'; // 重定向到仪表板
            })
            .catch((error) => {
                console.error("Error during registration: ", error);
                alert("Registration failed: " + error.message);
            });
    };

    // 登录和密码重置功能保持不变
    window.login = function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Login successful, redirecting to dashboard...");
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                console.log("Login failed: ", error.message);
                const errorMessageDiv = document.getElementById('error-message');
                errorMessageDiv.textContent = "Invalid email or password. Please try again."; // 设置错误信息
                errorMessageDiv.style.display = 'block'; // 显示错误信息
            });
    };    

    window.resetPassword = function() {
        const email = document.getElementById('login-email').value;
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                alert("Password reset email sent. Please check your email.");
            })
            .catch((error) => {
                alert("Error resetting password: " + error.message);
            });
    };
});
