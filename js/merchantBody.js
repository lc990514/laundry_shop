//平台显示内容
let height

//控制台
function getRecords() {
    postAndHeader("/records/getById", {id: app.id, token: app.token, identity: "merchant"},{id: app.id},function (data) {
        //debug_(data.data)
        if (data.code === 0){
            records = data.data;
            app.records = records;
            //debug_(records)
        }else {
            errorMessage(data);
        }
    },"记录加载中……")
}

//套餐管理
function getSetMealTable() {
    height = $("#home").height() * 0.94;
    layui.use('table', function () {
        let table = layui.table;
        let Stable = table.render({
            elem: '#SetMealTable'
            , id: 'SetMealTable'
            , height: height
            , url: HOST + '/setMeal/getAllBySId/'
            , cellMinWidth: 80
            , parseData: function (res) {
                if (res.code === 0) {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: res.data.count,
                        data: res.data.data
                    }
                } else {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: 0,
                        data: null
                    }
                }
            }
            , page: true //开启分页
            , loading: true
            , toolbar: 'default'
            , headers: {token: app.token, id: app.id, identity: "merchant"}
            , cols: [[
                {field: 'chk', title: '多选', type: 'checkbox', fixed: 'left'}
                , {field: 'id', title: 'ID', sort: true}
                , {field: 'sname', title: '套餐名'}
                , {field: 'price', title: '价格'}
                , {
                    field: 'type', title: '类型', sort: true, templet: function (d) {
                        let type = d.type.split(";");
                        let tmp = [];
                        for (let i = 0; i < type.length; i++) {
                            if (type[i] !== "") {
                                tmp.push(type[i])
                            }
                        }

                        function f(ty, elem) {
                            elem = elem % 5;
                            switch (elem) {
                                case 0:
                                    return "<button class='layui-btn layui-btn-xs layui-btn-radius'>" + ty + "</button>"
                                case 1:
                                    return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-normal'>" + ty + "</button>"
                                case 2:
                                    return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-warm'>" + ty + "</button>"
                                case 3:
                                    return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-danger'>" + ty + "</button>"
                                case 4:
                                    return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-primary'>" + ty + "</button>"
                            }
                        }

                        let str = "";
                        for (let i = 0; i < tmp.length; i++) {
                            str += f(tmp[i], i);
                        }
                        str = "<div class='layui-btn-container'>" + str + "</div>";
                        return str;
                    }
                }
                , {field: 'tests', title: '介绍'}
                , {fixed: 'right', title: '操作', toolbar: '#SetMealRightTool'}
            ]]
        });
        //监听工具事件
        table.on('tool(SetMealTable)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            let data = obj.data; //获得当前行数据
            let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            if (layEvent === 'edit') { //编辑
                //do something
                key = "rest";
                uploadSetMeal(key, data.id, function () {
                    Stable.reload("SetMealTable");
                });
            } else if (layEvent === 'del') { //删除
                layer.confirm("真的删除" + data.id + "么", function (index) {
                    postAndHeader("/setMeal/del", {
                        token: app.token,
                        id: app.id,
                        identity: "merchant"
                    }, {id: "" + data.id}, function (data) {
                        if (data.code === 0) {
                            //LMessageSuccess("共删除"+data.data+"行");
                            obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                        } else {
                            errorMessage(data);
                        }
                    })
                });
            }
        });
        //头部工具监听
        table.on('toolbar(SetMealTable)', function (obj) {
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch (obj.event) {
                case 'add':
                    //add1表示商户进行操作而不是管理员
                    let key = "add";
                    uploadSetMeal(key, 0, function () {
                        Stable.reload("SetMealTable");
                    });
                    break;
                case 'delete':
                    //判断是否没有选
                    if (data.length === 0) {
                        layer.msg("选中了" + data.length + "条");
                    } else {
                        let id = "";
                        for (let i = 0; i < data.length; i++) {
                            id += data[i].id + ";";
                        }
                        layer.confirm("真的要删除这" + data.length + "行吗", function (index) {
                            postAndHeader("/setMeal/del", {
                                token: app.token,
                                id: app.id,
                                identity: "merchant"
                            }, {id: "" + id}, function (data) {
                                if (data.code === 0) {
                                    LMessageSuccess("共删除" + data.data + "行");
                                    //更新表
                                    Stable.reload("SetMealTable");
                                    layer.close(index);
                                } else {
                                    errorMessage(data);
                                }
                            });
                        });
                    }
                    break;
                case 'update':
                    if (data.length === 1) {
                        let key = "rest";
                        uploadSetMeal(key, data.id, function () {
                            Stable.reload("SetMealTable");
                        });
                    } else {
                        layer.msg("选中了" + data.length + "条");
                    }
                    break;
            }
        });
    });
}

function uploadSetMeal(key, id, end) {
    debug_("page/addSetMeal.html?uid=" + app.id + "&token=" + app.token + "&id=" + id + "&key=" + key)
    layer.open({
        type: 2,
        content: "page/addSetMeal.html?uid=" + app.id + "&token=" + app.token + "&id=" + id + "&key=" + key,
        area: ['40%', '80%'],
        title: "套餐信息",
        end: end
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
            , url: HOST + '/order/getAllBySId/'
            , cellMinWidth: 80
            , parseData: function (res) {
                if (res.code === 0) {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: res.data.count,
                        data: res.data.data
                    }
                } else {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: 0,
                        data: null
                    }
                }
            }
            , page: true //开启分页
            , loading: true
            , toolbar: 'default'
            , headers: {token: app.token, id: app.id, identity: "merchant"}
            , cols: [[
                {field: 'chk', title: '多选', type: 'checkbox', fixed: 'left'}
                , {field: 'id', title: 'ID', sort: true}
                , {field: 'userId', title: '用户ID'}
                , {field: 'suserId', title: '商户ID'}
                , {field: 'time', title: '创建时间'}
                , {field: 'setMeal', title: '套餐'}
                , {field: 'money', title: '付款金额'}
                , {field: 'address', title: '地址'}
                , {field: 'state', title: '订单状态', sort: true, templet: "#orderEnableSwitch"}
                , {field: 'states', title: '订单进度',sort: true,templet: function (d){
                    return '<select name="logins" class="sel_xlk" lay-filter="stateSelect" lay-verify="required" data-state="' + d.states + '" data-value="' + d.id + '" >' +
                        '         <option value="1">用户下单</option>' +
                        '         <option value="2">商家取件</option>' +
                        '         <option value="3">洗涤衣物</option>' +
                        '         <option value="4">商家送件</option>' +
                        '         <option value="5">订单完成</option>' +
                        '    </select>';
                    }}
                , {fixed: 'right', title: '操作', toolbar: '#OrderRightTool'}
            ]]
            , done: function (res, curr, count) {
                //设置下拉框样式在表格之上 不会遮挡下拉框
                $(".layui-table-body").css('overflow','visible');
                $(".layui-table-box").css('overflow','visible');
                $(".layui-table-view").css('overflow','visible');

                var tableElem = this.elem.next('.layui-table-view');
                count || tableElem.find('.layui-table-header').css('overflow', 'auto');
                layui.each(tableElem.find('select[name="logins"]'), function (index, item) {
                    var elem = $(item);
                    elem.val(elem.data('state')).parents('div.layui-table-cell').css('overflow', 'visible');
                });
                form.render();//刷新表单
            }
        });
        //监听工具事件
        table.on('tool(OrderTable)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            let data = obj.data; //获得当前行数据
            let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            if (layEvent === 'del') { //删除
                layer.confirm("真的删除" + data.id + "么", function (index) {
                    postAndHeader("/order/del", {
                        token: app.token,
                        id: app.id,
                        identity: "merchant"
                    }, {id: "" + data.id}, function (data) {
                        if (data.code === 0) {
                            //LMessageSuccess("共删除"+data.data+"行");
                            obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                        } else {
                            errorMessage(data);
                        }
                    })
                });
            }
        });
        //头部工具监听
        table.on('toolbar(OrderTable)', function (obj) {
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch (obj.event) {
                case 'delete':
                    if (data.length === 0) {
                        layer.msg("选中了" + data.length + "条");
                    } else {
                        let id = "";
                        for (let i = 0; i < data.length; i++) {
                            id += data[i].id + ";";
                        }
                        layer.confirm("真的要删除这" + data.length + "行吗", function (index) {
                            postAndHeader("/order/del", {
                                token: app.token,
                                id: app.id,
                                identity: "merchant"
                            }, {id: "" + id}, function (data) {
                                if (data.code === 0) {
                                    LMessageSuccess("共删除" + data.data + "行");
                                    //更新表
                                    Stable.reload("OrderTable");
                                    layer.close(index);
                                } else {
                                    errorMessage(data);
                                }
                            });
                        });
                    }
                    break;
            }
        });
        form.on('switch(orderEnableSwitch)', function (obj) {
            postAndHeader("/order/fast/enable", {token: app.token, id: app.id, identity: "merchant"}, {
                id: this.value,
                enable: obj.elem.checked
            }, function (data) {
                if (data.code === 0) {
                    if (obj.elem.checked) {
                        layer.tips("创建订单", obj.othis);
                    } else {
                        layer.tips("已退款", obj.othis);
                    }
                } else {
                    LMessageError(data.msg, data.code);
                    obj.elem.checked = !obj.elem.checked;
                }
            }, "更改中")
            return false;
        });
        form.on('select(stateSelect)', function (obj) {//修改类型
            let id = obj.elem.dataset.value; //当前数据的id
            let value = obj.elem.value; //当前字段变化的值  value值
            console.log(id)
            console.log(value)
            //修改状态
            //....这里省略一个ajax请求...
            // 传值：表单变化后的值传递到后台数据库进行实时修改，例如，根据id修改这条数据的状态。
            postAndHeader("/order/setStates",{token: app.token, id: app.id, identity: "merchant"},{
                id:id,
                states:value
            },function (data){
                if (data.code ===0){
                    layer.tips("状态更新",obj.othis);
                } else {
                    LMessageError(data.msg,data.code);
                    obj.elem.value = 0
                }
            })
        });
    });
}

//评论管理
function getCommentsTable() {
    layui.use('table', function () {
        let table = layui.table;
        let Stable = table.render({
            elem: '#CommentsTable'
            , id: 'CommentsTable'
            , height: height
            , url: HOST + '/comments/getAllBySId/'
            , cellMinWidth: 80
            , parseData: function (res) {
                if (res.code === 0) {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: res.data.count,
                        data: res.data.data
                    }
                } else {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: 0,
                        data: null
                    }
                }
            }
            , page: true //开启分页
            , loading: true
            , toolbar: 'default'
            , headers: {token: app.token, id: app.id, identity: "merchant"}
            , cols: [[
                {field: 'chk', title: '多选', type: 'checkbox', fixed: 'left'}
                , {field: 'id', title: 'ID', sort: true}
                , {field: 'userId', title: '用户ID'}
                , {field: 'suserId', title: '商户ID'}
                , {field: 'messages', title: '评论信息'}
                , {field: 'grade', title: '评论星级'}
            ]]
        });
        //头部工具监听
        table.on('toolbar(CommentsTable)', function (obj) {
            let checkStatus = table.checkStatus(obj.config.id);
            //debug_(checkStatus)
            let data = checkStatus.data;
            //debug_(data)
            switch (obj.event) {
                case 'delete':
                    layer.msg("商家没有权限删除评论");
                    break;
            }
        });
    });
}

//业绩管理
function getChart() {
    let data1 = {
        money: "",
        orders: "",
        comments: "",
        setMeals: ""
    };
    postAndHeader("/me/getData", {token: app.token, id: app.id, identity: "merchant"}, {id: app.id}, function (res) {
        debug_(res.data)
        if (res.code === 0) {
            data1 = res.data;
            let data = [(data1.money / 100).toFixed(2), data1.orders, data1.comments, data1.setMeals];
            Chart1(data);
        } else {
            errorMessage(res);
        }
    });
}

function Chart1(data) {
    //debug_(data)
    let ctx = document.getElementById("chart");
    let myBarChart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
            labels: ["收入（单位：百元）", "订单量", "留言量", "套餐量"],
            datasets: [{
                label: '本店总业绩',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
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
                    fontColor: 'rgb(255,0,0)'
                }
            }
        }
    });
}
