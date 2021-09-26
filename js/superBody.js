//平台显示内容
let height

//控制台
function getChart() {
    //用户数 商户数 套餐数/100 订单数/100 留言数/100
    let data1 = {
        users: "",
        merchants: "",
        setMeals: "",
        orders:"",
        comments: ""
    };
    post("/su/getData",null,function (res) {
        debug_(res.data)
        if (res.code === 0) {
            data1 = res.data;
            let data = [data1.users, data1.merchants, data1.setMeals, data1.orders,data1.comments];
            Chart1(data);
        } else {
            errorMessage(res);
        }
    })
}

function Chart1(data) {
    //debug_(data)
    let ctx = document.getElementById("chart");
    let myBarChart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
            labels: ["用户数", "商户数", "套餐数", "订单数","留言数"],
            datasets: [{
                label: '平台数据',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255,99,132,1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'rgba(255, 99, 132, 1)'
                    }
                }],
                yAxes: [{
                    ticks: {
                        fontColor: 'rgba(54, 162, 235, 1)'
                    }
                }]
            },
            legend: {
                labels: {
                    // 这个更具体的字体属性覆盖全局属性
                    fontColor: 'rgb(0,0,0)'
                }
            }
        }
    });
}

//管理商户
function getSUserTable() {
    height = $("#home").height() * 0.94;
    //debug_(height)
    layui.use('table', function () {
        let table = layui.table;
        let form = layui.form;
        let Stable = table.render({
            elem: '#SUserTable'
            , id: 'SUserTable'
            , height: height
            , url: HOST + '/me/all/'
            , cellMinWidth:80
            , parseData: function (res) {
                if (res.code===0) {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:res.data.count,
                        data:res.data.data
                    }
                }else {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:0,
                        data:null
                    }
                }
            }
            ,page: true //开启分页
            ,loading: true
            ,toolbar:'default'
            ,headers:{token:app.token,id:app.id}
            , cols: [[
                {field: 'chk',title: '多选',type:'checkbox',fixed: 'left'}
                ,{field: 'id', title: 'ID', sort: true}
                , {field: 'username', title: '用户名'}
                , {field: 'uname', title: '昵称'}
                , {field: 'grade', title: '等级'}
                , {field: 'experience', title: '经验'}
                , {field: 'address', title: '地址'}
                , {field: 'balance', title: '账户余额'}
                , {field: 'time', title: '上次登陆时间'}
                ,{fixed: 'right', title:'操作', toolbar: '#SUserRightTool'}
            ]]
        });
        //监听工具事件
        table.on('tool(SUserTable)', function(obj){ //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            let data = obj.data; //获得当前行数据
            let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            if(layEvent === 'edit'){ //编辑
                //do something
                key = "rest";
                uploadSUser(key,data.id,function () {
                    Stable.reload("SUserTable");
                });
            } else if(layEvent === 'del'){ //删除
                layer.confirm("真的删除"+data.id+"么", function(index){
                    post("/me/del",{id:""+data.id},function (data) {
                        if (data.code===0){
                            //LMessageSuccess("共删除"+data.data+"行");
                            obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                        }else {
                            errorMessage(data);
                        }
                    })
                });
            }
        });
        //头部工具监听
        table.on('toolbar(SUserTable)', function(obj){
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch(obj.event){
                case 'add':
                    let key = "add";
                    uploadSUser(key,0,function () {
                        Stable.reload("SUserTable");
                    });
                    break;
                case 'delete':
                    if (data.length === 0){
                        layer.msg("选中了"+data.length+"条");
                    }else {
                        let id = "";
                        for (let i = 0; i < data.length; i++) {
                            id += data[i].id+";";
                        }
                        layer.confirm("真的要删除这"+data.length+"行吗",function (index) {
                            post("/me/del",{id:""+id},function (data) {
                                if (data.code===0){
                                    LMessageSuccess("共删除"+data.data+"行");
                                    //更新表
                                    Stable.reload("SUserTable");
                                    layer.close(index);
                                }else {
                                    errorMessage(data);
                                }
                            });
                        });
                    }
                    break;
                case 'update':
                    if (data.length===1){
                        let key = "rest";
                        uploadSUser(key,data.id,function () {
                            Stable.reload("SUserTable");
                        });
                    }else {
                        layer.msg("选中了"+data.length+"条");
                    }
                    break;
            }
        });
    });
}
function uploadSUser(key,id,end) {
    debug_("page/addSUser.html?uid=" + app.id + "&token=" + app.token+"&id="+id+"&key="+key)
    layer.open({
        type: 2,
        content: "page/addSUser.html?uid=" + app.id + "&token=" + app.token+"&id="+id+"&key="+key,
        area: ['40%', '80%'],
        title: "用户信息",
        end:end
    });
}

//用户管理

function getYUserTable(){
    layui.use('table', function () {
        let table = layui.table;
        let form = layui.form;
        let Stable = table.render({
            elem: '#YUserTable'
            , id: 'YUserTable'
            , height: height
            , url: HOST + '/user/all/'
            , cellMinWidth:80
            , parseData: function (res) {
                if (res.code===0) {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:res.data.count,
                        data:res.data.data
                    }
                }else {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:0,
                        data:null
                    }
                }
            }
            ,page: true //开启分页
            ,loading: true
            ,toolbar:'default'
            ,headers:{token:app.token,id:app.id}
            , cols: [[
                {field: 'chk',title: '多选',type:'checkbox',fixed: 'left'}
                ,{field: 'id', title: 'ID', sort: true}
                , {field: 'username', title: '用户名'}
                , {field: 'uname', title: '昵称'}
                , {field: 'grade', title: '等级'}
                , {field: 'experience', title: '经验'}
                , {field: 'address', title: '地址'}
                , {field: 'time', title: '上次登陆时间'}
                ,{fixed: 'right', title:'操作', toolbar: '#SUserRightTool'}
            ]]
        });
        //监听工具事件
        table.on('tool(YUserTable)', function(obj){ //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            let data = obj.data; //获得当前行数据
            let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            if(layEvent === 'edit'){ //编辑
                //do something
                key = "rest";
                uploadYUser(key,data.id,function () {
                    Stable.reload("YUserTable");
                });
            } else if(layEvent === 'del'){ //删除
                layer.confirm("真的删除"+data.id+"么", function(index){
                    post("/user/del",{id:""+data.id},function (data) {
                        if (data.code===0){
                            //LMessageSuccess("共删除"+data.data+"行");
                            obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                        }else {
                            errorMessage(data);
                        }
                    })
                });
            }
        });
        //头部工具监听
        table.on('toolbar(YUserTable)', function(obj){
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch(obj.event){
                case 'add':
                    let key = "add";
                    uploadYUser(key,0,function () {
                        Stable.reload("YUserTable");
                    });
                    break;
                case 'delete':
                    if (data.length === 0){
                        layer.msg("选中了"+data.length+"条");
                    }else {
                        let id = "";
                        for (let i = 0; i < data.length; i++) {
                            id += data[i].id+";";
                        }
                        layer.confirm("真的要删除这"+data.length+"行吗",function (index) {
                            post("/user/del",{id:""+id},function (data) {
                                if (data.code===0){
                                    LMessageSuccess("共删除"+data.data+"行");
                                    //更新表
                                    Stable.reload("YUserTable");
                                    layer.close(index);
                                }else {
                                    errorMessage(data);
                                }
                            });
                        });
                    }
                    break;
                case 'update':
                    if (data.length===1){
                        let key = "rest";
                        uploadYUser(key,data.id,function () {
                            Stable.reload("YUserTable");
                        });
                    }else {
                        layer.msg("选中了"+data.length+"条");
                    }
                    break;
            }
        });
    });
}

function uploadYUser(key,id,end) {
    layer.open({
        type: 2,
        content: "page/addYUser.html?uid=" + app.id + "&token=" + app.token+"&id="+id+"&key="+key,
        area: ['40%', '80%'],
        title: "用户信息",
        end:end
    });
}

//套餐管理

function getSetMealTable(){
    layui.use('table', function () {
        let table = layui.table;
        let form = layui.form;
        let Stable = table.render({
            elem: '#SetMealTable'
            , id: 'SetMealTable'
            , height: height
            , url: HOST + '/setMeal/getAll/'
            , cellMinWidth:80
            , parseData: function (res) {
                if (res.code===0) {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:res.data.count,
                        data:res.data.data
                    }
                }else {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:0,
                        data:null
                    }
                }
            }
            ,page: true //开启分页
            ,loading: true
            ,toolbar:'default'
            ,headers:{token:app.token,id:app.id}
            , cols: [[
                {field: 'chk',title: '多选',type:'checkbox',fixed: 'left'}
                ,{field: 'id', title: 'ID', sort: true}
                , {field: 'sname', title: '套餐名'}
                , {field: 'price', title: '价格'}
                , {field: 'type', title: '类型',sort: true,templet:function (d) {
                        let type=d.type.split(";");
                        let tmp=[];
                        for (let i = 0; i < type.length; i++) {
                            if (type[i]!==""){tmp.push(type[i])}
                        }
                        function f(ty,elem) {
                            elem=elem%5;
                            switch (elem) {
                                case 0:return "<button class='layui-btn layui-btn-xs layui-btn-radius'>"+ty+"</button>"
                                case 1:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-normal'>"+ty+"</button>"
                                case 2:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-warm'>"+ty+"</button>"
                                case 3:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-danger'>"+ty+"</button>"
                                case 4:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-primary'>"+ty+"</button>"
                            }
                        }
                        let str="";
                        for (let i = 0; i < tmp.length; i++) {
                            str+=f(tmp[i],i);
                        }
                        str="<div class='layui-btn-container'>"+str+"</div>";
                        return str;

                    }}
                , {field: 'tests', title: '介绍'}
                , {field: 'userId', title: '商户id'}
                ,{fixed: 'right', title:'操作', toolbar: '#SetMealRightTool'}
            ]]
        });
        //监听工具事件
        table.on('tool(SetMealTable)', function(obj){ //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            let data = obj.data; //获得当前行数据
            let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            if(layEvent === 'edit'){ //编辑
                //do something
                key = "rest";
                uploadSetMeal(key,data.id,function () {
                    Stable.reload("SetMealTable");
                });
            } else if(layEvent === 'del'){ //删除
                layer.confirm("真的删除"+data.id+"么", function(index){
                    post("/setMeal/del",{id:""+data.id},function (data) {
                        if (data.code===0){
                            //LMessageSuccess("共删除"+data.data+"行");
                            obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                        }else {
                            errorMessage(data);
                        }
                    })
                });
            }
        });
        //头部工具监听
        table.on('toolbar(SetMealTable)', function(obj){
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch(obj.event){
                case 'add':
                    let key = "add";
                    uploadSetMeal(key,0,function () {
                        Stable.reload("SetMealTable");
                    });
                    break;
                case 'delete':
                    if (data.length === 0){
                        layer.msg("选中了"+data.length+"条");
                    }else {
                        let id = "";
                        for (let i = 0; i < data.length; i++) {
                            id += data[i].id+";";
                        }
                        layer.confirm("真的要删除这"+data.length+"行吗",function (index) {
                            post("/setMeal/del",{id:""+id},function (data) {
                                if (data.code===0){
                                    LMessageSuccess("共删除"+data.data+"行");
                                    //更新表
                                    Stable.reload("SetMealTable");
                                    layer.close(index);
                                }else {
                                    errorMessage(data);
                                }
                            });
                        });
                    }
                    break;
                case 'update':
                    if (data.length===1){
                        let key = "rest";
                        uploadSetMeal(key,data.id,function () {
                            Stable.reload("SetMealTable");
                        });
                    }else {
                        layer.msg("选中了"+data.length+"条");
                    }
                    break;
            }
        });
    });
}
function uploadSetMeal(key,id,end) {
    debug_("page/addSetMeal.html?uid=" + app.id + "&token=" + app.token+"&id="+id+"&key="+key)
    layer.open({
        type: 2,
        content: "page/addSetMeal.html?uid=" + app.id + "&token=" + app.token+"&id="+id+"&key="+key,
        area: ['40%', '80%'],
        title: "套餐信息",
        end:end
    });
}

//订单管理
function getOrderTable() {
    layui.use('table', function () {
        let table = layui.table;
        let form = layui.form;
        let Stable = table.render({
            elem: '#OrderTable'
            , id: 'OrderTable'
            , height: height
            , url: HOST + '/order/getAll/'
            , cellMinWidth:80
            , parseData: function (res) {
                if (res.code===0) {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:res.data.count,
                        data:res.data.data
                    }
                }else {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:0,
                        data:null
                    }
                }
            }
            ,page: true //开启分页
            ,loading: true
            ,toolbar:'default'
            ,headers:{token:app.token,id:app.id}
            , cols: [[
                {field: 'chk',title: '多选',type:'checkbox',fixed: 'left'}
                ,{field: 'id', title: 'ID', sort: true}
                , {field: 'userId', title: '用户ID'}
                , {field: 'suserId', title: '商户ID'}
                , {field: 'time', title: '创建时间'}
                , {field: 'setMeal', title: '套餐'}
                , {field: 'money', title: '付款金额'}
                , {field: 'address', title: '地址'}
                , {field: 'state', title: '订单状态',sort: true, templet:"#orderEnableSwitch"}
                , {field: 'states', title: '订单进度',sort: true}
                ,{fixed: 'right', title:'操作', toolbar: '#OrderRightTool'}
            ]]
        });
        //监听工具事件
        table.on('tool(OrderTable)', function(obj){ //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            let data = obj.data; //获得当前行数据
            let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            if(layEvent === 'del'){ //删除
                layer.confirm("真的删除"+data.id+"么", function(index){
                    post("/order/del",{id:""+data.id},function (data) {
                        if (data.code===0){
                            //LMessageSuccess("共删除"+data.data+"行");
                            obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                        }else {
                            errorMessage(data);
                        }
                    })
                });
            }
        });
        //头部工具监听
        table.on('toolbar(OrderTable)', function(obj){
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch(obj.event){
                case 'delete':
                    if (data.length === 0){
                        layer.msg("选中了"+data.length+"条");
                    }else {
                        let id = "";
                        for (let i = 0; i < data.length; i++) {
                            id += data[i].id+";";
                        }
                        layer.confirm("真的要删除这"+data.length+"行吗",function (index) {
                            post("/order/del",{id:""+id},function (data) {
                                if (data.code===0){
                                    LMessageSuccess("共删除"+data.data+"行");
                                    //更新表
                                    Stable.reload("OrderTable");
                                    layer.close(index);
                                }else {
                                    errorMessage(data);
                                }
                            });
                        });
                    }
                    break;
            }
        });
        form.on('switch(orderEnableSwitch)', function(obj){
            post("/order/fast/enable",{id:this.value,enable:obj.elem.checked},function (data) {
                if (data.code===0){
                    if (obj.elem.checked){
                        layer.tips("创建订单", obj.othis);
                    }else {
                        layer.tips("已退款", obj.othis);
                    }
                }else {
                    LMessageError(data.msg,data.code);
                    obj.elem.checked=!obj.elem.checked;
                }
            },"更改中")
            return false;
        });
    });
}

//评论管理
function getCommentsTable() {
    layui.use('table', function () {
        let table = layui.table;
        let form = layui.form;
        let Stable = table.render({
            elem: '#CommentsTable'
            , id: 'CommentsTable'
            , height: height
            , url: HOST + '/comments/getAll/'
            , cellMinWidth:80
            , parseData: function (res) {
                if (res.code===0) {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:res.data.count,
                        data:res.data.data
                    }
                }else {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:0,
                        data:null
                    }
                }
            }
            ,page: true //开启分页
            ,loading: true
            ,toolbar:'default'
            ,headers:{token:app.token,id:app.id}
            , cols: [[
                {field: 'chk',title: '多选',type:'checkbox',fixed: 'left'}
                ,{field: 'id', title: 'ID', sort: true}
                , {field: 'userId', title: '用户ID'}
                , {field: 'suserId', title: '商户ID'}
                , {field: 'messages', title: '评论信息'}
                , {field: 'grade', title: '评论星级'}
                ,{fixed: 'right', title:'操作', toolbar: '#CommentsRightTool'}
            ]]
        });
        //监听工具事件
        table.on('tool(CommentsTable)', function(obj){ //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            let data = obj.data; //获得当前行数据
            let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            if(layEvent === 'del'){ //删除
                layer.confirm("真的删除"+data.id+"么", function(index){
                    post("/comments/del",{id:""+data.id},function (data) {
                        if (data.code===0){
                            //LMessageSuccess("共删除"+data.data+"行");
                            obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                        }else {
                            errorMessage(data);
                        }
                    })
                });
            }
        });
        //头部工具监听
        table.on('toolbar(CommentsTable)', function(obj){
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch(obj.event){
                case 'delete':
                    if (data.length === 0){
                        layer.msg("选中了"+data.length+"条");
                    }else {
                        let id = "";
                        for (let i = 0; i < data.length; i++) {
                            id += data[i].id+";";
                        }
                        layer.confirm("真的要删除这"+data.length+"行吗",function (index) {
                            post("/comments/del",{id:""+id},function (data) {
                                if (data.code===0){
                                    LMessageSuccess("共删除"+data.data+"行");
                                    //更新表
                                    Stable.reload("CommentsTable");
                                    layer.close(index);
                                }else {
                                    errorMessage(data);
                                }
                            });
                        });
                    }
                    break;
            }
        });
    });
}