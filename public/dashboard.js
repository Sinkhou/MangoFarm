// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    window.signOut = function() {
      firebase.auth().signOut().then(() => {
        // Sign-out successful, redirect to login page
        window.location.href = 'index.html';
      }).catch((error) => {
        // An error happened during sign out
        console.error("Sign out error", error);
      });
    };      
  });
  