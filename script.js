function endGroup() {
    window.location.href = "end.html";
  }
  
  function generateGroup() {
    const name = document.getElementById('groupName').value.trim();
    if (name === "") {
      alert("Please enter a group name.");
      return;
    }
  
    const code = name.toLowerCase().replace(/\s+/g, '-') + "-" + Math.floor(Math.random() * 10000);
    document.getElementById('groupCode').innerText = code;
    document.getElementById('codeBox').style.display = 'block';
  }
  

  document.addEventListener("contextmenu", (e) => {
  e.preventDefault(); // Yeh sabhi jagah right-click disable kar deta hai
});
