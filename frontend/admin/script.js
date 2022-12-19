function signup(e) {
    e.preventDefault();
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const obj = {
        
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value
    };
    axios.post('http://localhost:4000/admin/signup', obj)
        .then((response) => {
            console.log(response.data);
            if (response.status === 201) {
                alert('Successfully signed up');
                window.location.href='../login.html'
            }
            
        }).catch(error => {
            console.log(error);
            if (error.response.status === 403) {
                alert('email already exits');
            }
        });
}

function login(e) {
    e.preventDefault();
    console.log("enter");
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const obj = {
        email: email.value,
        password: password.value
    };
    axios.post('http://localhost:4000/admin/login', obj)
        .then(response => {
            console.log(response.data);
            if (response.status === 200) {
                localStorage.setItem('token',response.data.token);
                localStorage.setItem('name',response.data.name);
                localStorage.setItem('userId',response.data.userId);
                localStorage.setItem('localMsg', '[]');
                window.location.href='./chat.html'
            } 
        }).catch(error => {
            console.log(error);
            if (error.response.status === 401) {
                alert('password do not match, login again');
                console.log('inside 401')
            }
            else if (error.response.status === 404) {
                alert('user does not exit. Please signup');
                console.log('inside 404')
            }
        })
}