# canvas-filter


![](https://raw.githubusercontent.com/myfmyy/EditAvatar/master/test/2.png)

![](https://raw.githubusercontent.com/myfmyy/EditAvatar/master/test/1.png)

```js
var eA = new EditAvatar(document.getElementById("test_a"));
eA.getFile(document.getElementById("getfile"));
eA.addView(document.getElementById("test_view_100"));
eA.addView(document.getElementById("test_view_50"));
eA.addView(document.getElementById("test_view_30"));
document.getElementById("get").addEventListener("click", function () {
    //获取图片
    console.log(eA.getBase64());
});

function bs(t) {
    if (t == "0") {
        //原图
        eA.editImg = eA.eImg;
    } else {
        //重绘
        var Img = new Image();//创建一个新的img，避免覆盖原图
        var AlloyImageObj = AlloyImage(eA.editImg);
        AlloyImageObj.ps(t).replace(Img);
        eA.editImg = Img;
    }
}
```

* demo  [idaylog.com/EditAvatar](https://www.idaylog.com/EditAvatar)