# EditAvatar


![](https://raw.githubusercontent.com/myfmyy/EditAvatar/master/test/e.png)

![](https://raw.githubusercontent.com/myfmyy/EditAvatar/master/test/ee.png)

```js
//初始化
var editAvatar = new EditAvatar($("#test_edit"));
            
$("#zoomin").click(function () {
    //调整选择区域大小
    editAvatar.cursorResize(true);//放大
});
$("#zoomout").click(function () {
    editAvatar.cursorResize(false);//缩小
});
//添加view
editAvatar.addView($("#test_view_100"));
editAvatar.addView($("#test_view_50"));
editAvatar.addView($("#test_view_30"));
//添加input file
editAvatar.getFile($("#getfile"));
$("#get").click(function () {
    //获取图片
    console.log(editAvatar.getBase64());
});
//创建
editAvatar.create();
```

* demo  [idaylog.com/EditAvatar](https://www.idaylog.com/EditAvatar)