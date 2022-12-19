const token = localStorage.getItem("token");
const name = localStorage.getItem("name");
const userId = localStorage.getItem("userId");

const authAxios = axios.create({
  baseURL: "http://localhost:4000",
  headers: { Authorization: `Bearer ${token}` },
});

{
  //display-top
  document.getElementById("login-name").innerHTML = `${name}`;
  const currentGroup = document.getElementById("current-group-name");
  if (localStorage.getItem("groupName") != null) {
    currentGroup.innerHTML = `${localStorage.getItem("groupName")}`;
  } else {
    currentGroup.innerHTML = "Select a group";
  }

  function logout() {
    localStorage.clear();
    window.location.href = "./login.html";
  }
}

{
  //groups
  authAxios
    .get("/get-groups")
    .then((res) => {
      //getting groups
      const groupListDiv = document.getElementById("group-list");
      groupListDiv.innerHTML = "";
      res.data.groups.forEach((group) => {
        groupListDiv.innerHTML += `
            <li id="${group.id}" style="padding:5px 0;">
            <span>${group.name}</span>
            <button id="show-users">Show Users</button>
            <button id="change-group-btn" class="group-btn">Enter Chat</button>
            <button id="delete-group-btn" class="group-btn">Delete Group</button>
            </li>
            `;
      });
    })
    .catch((err) => console.log(err));

  function createGroup(event) {
    event.preventDefault();
    const name = document.getElementById("create-group-input").value;
    authAxios
      .post("/create-group", { name, isAdmin: true })
      .then((res) => {
        console.log(res.data);
        const groupId = res.data.group.id;
        // console.log(groupId)
        localStorage.setItem("groupId", groupId);
        window.location.reload();
      })
      .catch((err) => console.log(err));
  }

  document
    .getElementById("group-list-wrapper")
    .addEventListener("click", (e) => {      //for changing/deleting group

      if (e.target.id === "change-group-btn") {
        const gId= e.target.parentNode.id;
        const gName= e.target.parentNode.children[0].innerText;
        console.log(gId,gName)
        localStorage.setItem("groupId", gId);
        localStorage.setItem("groupName", gName);
        localStorage.setItem("localMsg", "[]");
        window.location.reload();
      }

      if (e.target.id === "delete-group-btn") {
        const gId= e.target.parentNode.id;
        console.log(gId)
        if (confirm("Are you sure?")) {
          authAxios
            .delete(`/delete-group/${gId}`)
            .then((res) => {
              console.log(res.data);
              localStorage.removeItem("groupId");
              alert(`Group with id-${gId} is deleted successfully`);
            })
            .catch((err) => {
              //console.log(err.response.data)
              alert(err.response.data.message)
            });
        }
      }

      if (e.target.id === "show-users") {
        const gId= e.target.parentNode.id;
        authAxios
          .get(`/get-users/?gId=${gId}`)
          .then((res) => {
            // console.log(res.data);
            document.getElementById("users-inside-group").innerHTML = "";
            res.data.userData.forEach((user) => {
              document.getElementById("users-inside-group").innerHTML += `
                        <li id="${user.groups[0].id}">
                            <span>${user.name}</span>
                            <span>${user.email}</span>
                            <span>${user.groups[0].userGroup.isAdmin}</span>
                            <button id="remove-user-btn" class="user-btn">Remove</button>
                            <button id="make-admin-btn">Make Admin</button>
                        </li> `;
            });
          })
          .catch((err) => console.log(err));
      }

      if (e.target.id === "remove-user-btn") {
        const obj = {
          email: e.target.parentNode.children[1].innerText,
          groupId: e.target.parentNode.id,
        };
        console.log(obj);
        if (confirm("Are you sure?")) {
          authAxios
            .post("/remove-user", obj)
            .then((res) => {
              console.log(res.data);
              alert(`user with ${obj.email} has been removed from the group`);
            })
            .catch((err) => {
              console.log(err.response);
              alert(`user with ${obj.email} not present in the group`);
            });
        }
      }

      if (e.target.id === "make-admin-btn") {
        const obj= {
            email: e.target.parentNode.children[1].innerText,
            groupId: e.target.parentNode.id
        }
        // console.log(obj)
        authAxios
          .post("/make-admin", obj)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => console.log(err));
      }
    });
}

{
  //users
  authAxios
    .get("/get-users")
    .then((res) => {
      // getting users
      // console.log(res.data);
      const userListDiv = document.getElementById("user-list");
      userListDiv.innerHTML = "";
      res.data.user.forEach((user) => {
        userListDiv.innerHTML += `
            <li id='user-${user.id}' class="user-list-inside" style="padding:5px 0;" user-list-li>
            <span>${user.name}</span>
            <span>${user.email}</span>
            <label for="accept">Admin</label>
            <input type="checkbox" id="accept">
            <button id="add-user-btn" class="user-btn">Add</button>
            </li> `;
      });
    })
    .catch((err) => console.log(err.response));

  document.getElementById("user-list").addEventListener("click", (e) => {
    //for adding/removing users
    const email = e.target.parentNode.children[1].innerText;
    // console.log(email)
    const isAdmin = e.target.parentNode.children[3].checked;
    // console.log(isAdmin)

    if (localStorage.getItem("groupId") == null) {
      return alert("Please select a group first");
    }
    const obj = {
      email: email,
      groupId: localStorage.getItem("groupId"),
      isAdmin: isAdmin,
    };
    // console.log(obj);
    if (e.target.id === "add-user-btn") {
      authAxios
        .post("/add-user", obj)
        .then((res) => {
          console.log(res.data);
          alert(`user with ${email} added to the group`);
        })
        .catch((err) => {
          console.log(err.response.data);
          alert(`user with ${email} is already a member`);
        });
    }
  });

  /* For searching in user list*/
  document.querySelector("[data-search]").addEventListener("input", (e) => {
    //search bar
    const value = e.target.value.toLowerCase();
    const userList = document.getElementById("user-list");
    const li = userList.getElementsByTagName("li");
    // console.log(li);
    // console.log(Array.from(li));
    Array.from(li).forEach((user) => {
      const email = user.children[0].textContent;
      const name = user.children[1].textContent;
      if (
        (email.toLowerCase().indexOf(value) ||
          email.toLowerCase().indexOf(value)) !== -1
      ) {
        user.style.display = "block";
      } else {
        user.style.display = "none";
      }
    });
  });
}

{
  //chats
  let localMsg = JSON.parse(localStorage.getItem("localMsg"));
  let lastId;
  if (localMsg == null) {
    lastId = 0;
  }
  if (localMsg.length > 0) {
    lastId = localMsg[localMsg.length - 1].id;
  }
  const groupId = localStorage.getItem("groupId");

  if (localStorage.getItem("groupId") != null) {
     //setInterval(() => {
    authAxios
      .get(`/get-chats?id=${lastId}&gId=${groupId}`)
      .then((response) => {
        // console.log('>>>backend<<<', response.data.chat);
        // console.log('>>>local<<<', localMsg);
        //localstorage
        let retrivedMsg = localMsg.concat(response.data.chat);
        //deleting old messages from local storage
        if (retrivedMsg.length > 100) {
          for (let i = 0; i < retrivedMsg.length - 100; i++)
            retrivedMsg.shift();
        }
        localStorage.setItem("localMsg", JSON.stringify(retrivedMsg));

        const div = document.getElementById("group-chat-receive-box");
        div.innerHTML = "";
        retrivedMsg.forEach((chat) => {
          div.innerHTML += `<div id="${chat.id}>"><span style="color:green;"><b>${chat.name}:</b></span><span>${chat.message}</span></div>`;
        });
      })
      .catch((err) => console.log(err.response));
   //  }, 1000)
  }

  function sendGroupMsg(event) {
    event.preventDefault();

    if (localStorage.getItem("groupId") == null) {
      alert("Select a group first");
      document.getElementById("group-chat-input").value = "";
    } else {
      const input = document.getElementById("group-chat-input").value;
      const obj = {
        message: input,
        name: name,
        groupId: localStorage.getItem("groupId"),
      };
      console.log(obj);
      authAxios
        .post("/post-chat", obj)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
      document.getElementById("group-chat-input").value = "";
      document.getElementById("group-chat-receive-box").innerHTML += `
                <div><span style="color:green;"><b>${name}:</b></span><span>${input}</span></div>`;
    }
  }
}

function sendFile(event) {
  event.preventDefault();
  const fileInput = document.getElementById("file-upload");
  const formData = new FormData();
  // console.log(fileInput.files);
  formData.append("image", fileInput.files[0]);
  // console.log(formData)

  authAxios
    .post("/upload", formData)
    .then((res) => {
      console.log(res);
      if (res.status === 200) {
        let a = document.createElement("a");
        a.href = res.data.fileURL;
        a.download = "file";
        a.click();
      }
    })
    .catch((err) => {
      console.log(err.response);
    });
}
