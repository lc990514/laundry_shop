// 此文档定义一些变量和封装函数
let HOST="http://localhost:8080/";
let DEBUG=true;
let useVue=true;
let publicHeader={token:"",id:"",Accept: "application/json; charset=utf-8"};




function debug_(value) {
    if (DEBUG){
        console.log(value);
    }
}

function post(API,DATA,SUCCESS,MESSAGE) {
    let layerIndex;
    $.ajax({
        type:'post',
        beforeSend:function (){
            //根据LOADING值确定是不是要启用加载动画
            if (typeof(MESSAGE) !== 'undefined'){
                layerIndex=layer.msg(MESSAGE, {
                    icon: 16
                    ,shade: 0.01
                    ,time:99999
                });
            }
        },
        headers:publicHeader,
        url:HOST+API,
        dataType:'json',
        data:DATA,
        success:SUCCESS,
        error:function (xhr,status,error) {
            errorLog("异步请求失败，以下为错误日志",[xhr,status,error],"POST")
        },
        complete:function () {
            layer.close(layerIndex);
        }
    })
}
function get(API,DATA,SUCCESS,MESSAGE) {
    let layerIndex;
    $.ajax({
        type:'get',
        beforeSend:function (){
            //根据LOADING值确定是不是要启用加载动画
            if (typeof(MESSAGE) !== 'undefined'){
                layerIndex=layer.msg(MESSAGE, {
                    icon: 16
                    ,shade: 0.01
                    ,time:99999
                });
            }
        },
        headers:publicHeader,
        url:HOST+API,
        dataType:'json',
        data:DATA,
        success:SUCCESS,
        error:function (xhr,status,error) {
            errorLog("异步请求失败，以下为错误日志",[xhr,status,error],"GET")
        },
        complete:function () {
            layer.close(layerIndex);
        }
    })
}
//封装ajax post方法
function postAndHeader(API,HEADER,DATA,SUCCESS,MESSAGE) {
    let layerIndex;
    if (HEADER===null){
        HEADER={Accept: "application/json; charset=utf-8"}
    }
    $.ajax({
        type:'post',
        beforeSend:function (){
            //根据LOADING值确定是不是要启用加载动画
            if (typeof(MESSAGE) !== 'undefined'){
                layerIndex=layer.msg(MESSAGE, {
                    icon: 16
                    ,shade: 0.01
                    ,time:99999
                });
            }
        },
        headers: {
            //加载header
            Accept: "application/json; charset=utf-8",
            token:HEADER.token,
            id:HEADER.id,
            identity:HEADER.identity
        },
        url:HOST+API,
        dataType:'json',
        data:DATA,
        success:SUCCESS,
        error:function (xhr,status,error) {
            errorLog("POST请求失败，以下为错误日志",[xhr,status,error],"POST")
        },
        complete:function () {
            layer.close(layerIndex);
        }
    })
}
//封装ajax get方法
function getAndHeader(API,HEADER,DATA,SUCCESS,MESSAGE) {
    let layerIndex;
    if (HEADER===null){
        HEADER={Accept: "application/json; charset=utf-8"}
    }
    $.ajax({
        type:'get',
        beforeSend:function (xhr){
            //加载header
            xhr.setRequestHeader(HEADER)
            //根据LOADING值确定是不是要启用加载动画
            if (typeof(MESSAGE) !== 'undefined'){
                layerIndex=layer.msg(MESSAGE, {
                    icon: 16
                    ,shade: 0.01
                    ,time:99999
                });
            }
        },
        url:HOST+API,
        dataType:'json',
        data:DATA,
        success:SUCCESS,
        error:function (xhr,status,error) {
            errorLog("GET请求失败，以下为错误日志",[xhr,status,error],"GET")
        },
        complete:function () {
            layer.close(layerIndex);
        }
    })
}
//错误日志
function errorLog(msg,err,type) {
    console.error(msg);
    for (let i = 0; i < err.length; i++) {
        console.error(err[i]);
    }
    console.error("错误日志输出结束");
    LMessageError("数据请求失败，控制台已打印错误日志{"+type+"}");
}
// 通用服务器错误信息处理器
function errorMessage(data) {
    LMessageError(data.message,data.code);
}

//封装layer经典弹窗
function LMessageSuccess(message) {
    //执行成功弹窗
    layer.msg(message, {icon: 1});
    debug_(message);
}
function LMessageError(message,code) {
    // 执行失败
    if (typeof (code) !== "undefined"){
        message+="-错误代码："+code;
    }
    layer.msg(message, {icon: 2});
    debug_(message);
}
function LMessageLoading(message,time) {
    //loading层，time默认2秒
    if (typeof (time) === "undefined"){
        time=2000;
    }
    debug_(message);
    layer.msg(message, {
        icon: 16
        ,shade: 0.01
        ,time:time
    });
}
