function startVue() {
    app = new Vue({
        el: "#BOX",
        data: {
            uname: "",
            token: "",
            id: "",
            username: "",
            portrait: ""
        },
        methods: {
            getImageUrl: function () {
                if (this.portrait === null || this.portrait === "null" || this.portrait === "") {
                    return "image/null.jpg";
                }
                return HOST + "/file/image/" + this.portrait;
            }
        }
    });
    start();
}

function start() {
    $(".home").slideUp(0);
    $(".home").eq(0).slideDown(0);
    $(".left-button").click(function () {
        $(".home").slideUp(0);
        let index = $(".left-button").index(this);
        $(".home").eq(index).slideDown(0);
    });
    token();
}

//用户基本信息
function message() {
    layer.open({
        type: 2,
        content: "page/userMsg.html?id=" + app.id + "&token=" + app.token,
        area: ['40%', '80%'],
        title: "用户信息",
        end: function (){
            app.uname = localStorage.getItem("uname");
        }

    })
}

//安全设置
function restPassword(){
    layer.prompt({
        formType: 1,
        value: "",
        title: '请输入密码',
        maxlength: 140,//可输入文本的最大长度，默认500
    }, function(value, index, elem){
        //alert(value); //得到value
        if (value===""||value===null){
            parent.LMessageSuccess("更改成功");
        }
        let da={
            password:value,
            id:app.id
        }
        postAndHeader("/su/restPassword",{token: app.token, id: app.id},da,function (data){
            if (data.code===0){
                LMessageSuccess("更改成功,2秒后自动退出");
                setTimeout(function () {
                    logout();
                },2000)
            }else {
                errorMessage(data);
            }
        })
        layer.close(index);

    });
}

//退出登录
function logout() {
    localStorage.removeItem("id")
    localStorage.removeItem("token")
    localStorage.removeItem("uname");
    localStorage.removeItem("username");
    localStorage.removeItem("portrait");
    location.href = "login.html"
}

//登录成功，调用方法
function loginOk() {
    getSUserTable();
    getYUserTable();
    getSetMealTable();
    getOrderTable();
    getCommentsTable();
    getChart();
}

//token验证
function token() {
    let id = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let uname = localStorage.getItem("uname");
    let username = localStorage.getItem("username");
    let portrait = localStorage.getItem("portrait");
    if (id === null || token === null || username === null || id === "" || token === "" || username === "" || id === "null" || token === "null" || username === "null") {
        logout();
    }
    if (uname === null || uname === "null") {
        uname = username;
    }

    postAndHeader("/su/token", {id: id, token: token}, null, function (data) {
        if (data.code === 0) {
            if (data.data > 60) {
                debug_("验证通过");
                app.uname = uname;
                app.id = id;
                app.token = token;
                publicHeader.id = id;
                publicHeader.token = token;

                app.username = username;
                app.portrait = portrait;
                loginOk();
                setTimeout(function () {
                    logout();
                }, data.data * 1000);
            } else {
                debug_("验证失效");
                logout();
            }
        } else {
            debug_("验证失效");
            logout();
        }
    })
}


