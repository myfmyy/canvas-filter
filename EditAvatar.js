(function (callback) {
    if (typeof window.define === "function" && window.define.amd) {
        window.define("EditAvatar", ["jquery"], callback);
    } else {
        callback(window.jQuery);
    }
})(function ($) {

    //构造函数
    var EditAvatar = function (editArea) {
        this.editArea = editArea;//编辑区域
        this.editCanvas;//编辑canvas
        this.editCanvas2;//编辑canvas
        this.editImg;//正在编辑的图片
        this.cursor;
        this._draw = {};
        this.cxt;
    }

    window.EditAvatar = EditAvatar;

    
    EditAvatar.prototype.create = function () {
        this.createEditArea();
        this.getPic();

    }

    //创建编辑区域
    EditAvatar.prototype.createEditArea = function () {
        //canvas
        this.editCanvas = document.createElement("canvas");
        this.editCanvas.width = $(this.editArea).width();
        this.editCanvas.height = $(this.editArea).height();
        $(this.editCanvas).css({ "position": "absolute", "pointer-events": "none" });
        $(this.editArea).append(this.editCanvas);
        this.cxt = this.editCanvas.getContext("2d");

        this.editCanvas2 = document.createElement("canvas");
        this.editCanvas2.width = $(this.editArea).width();
        this.editCanvas2.height = $(this.editArea).height();
        $(this.editCanvas2).css({ "position": "absolute", "pointer-events": "none" });
        $(this.editArea).append(this.editCanvas2);
        this.cxt2 = this.editCanvas2.getContext("2d");


        //cursor
        this.cursor = document.createElement("div");
        $(this.cursor).css({ "position": "absolute", "cursor": "all-scroll", "border-radius": "50%", "width": "0px", "height": "0px" });
        $(this.editArea).append(this.cursor);
        this.drag();

    }

    //拖拽
    EditAvatar.prototype.drag = function () {
        dom = $(this.cursor);
        var x;
        var y;
        var iX;
        var iY;
        var iDrag = false;
        var win = this;
        this.cursor.addEventListener("mousedown", function (e) {
            iDrag = true;
            iX = e.pageX - win.cursor.scrollLeft;
            iY = e.pageY - win.cursor.scrollTop;
            x = dom.position().left;
            y = dom.position().top;
            win.draw();
        });
        this.cursor.addEventListener("mousemove", function (e) {
            if (!iDrag) {
                return;
            }
            var yX = (e.pageX - win.cursor.clientLeft) - iX;
            var yY = (e.pageY - win.cursor.clientTop) - iY;
            if (yX > 0) {
                if (x + yX > win._draw.cursor_maxleft - win._draw.cursor_length) {
                    win._draw.cursor_left = win._draw.cursor_maxleft - win._draw.cursor_length;
                } else {
                    win._draw.cursor_left=x + yX;
                }
            } else {
                if (x + yX > 0) {
                    win._draw.cursor_left=x + yX;
                } else {
                    win._draw.cursor_left = 0;
                }
            }
            if (yY > 0) {
                if (y + yY > win._draw.cursor_maxtop - win._draw.cursor_length) {
                    win._draw.cursor_left=win.cursor_maxtop - win._draw.cursor_length ;
                } else {
                    win._draw.cursor_top= y + yY ;
                }
            } else {
                if (y + yY > 0) {
                    win._draw.cursor_top= y + yY;
                } else {
                    win._draw.cursor_top = 0;
                }
            }
            win.draw();
        });
        this.cursor.addEventListener("mouseup", function (e) {
            iDrag = false;
        });
        this.cursor.addEventListener("mouseout", function (e) {
            iDrag = false;
        });
    }

    //获取图片
    EditAvatar.prototype.getPic = function () {
        $(document).on({
            dragleave: function (e) {
                e.preventDefault();
            },
            drop: function (e) {
                e.preventDefault();
            },
            dragenter: function (e) {
                e.preventDefault();
            },
            dragover: function (e) {
                e.preventDefault();
            }
        });
        var ee = this;
        $(this.editArea).get(0).addEventListener("drop", function (e) {
            var file = e.dataTransfer.files;
            if (file.length < 1) {
                return;
            }
            file = file[0];
            if (file.type.indexOf("image") < 0) {
                return;
            }
            var img = document.createElement("img");
            img.src = window.URL.createObjectURL ? window.URL.createObjectURL(file) : window.webkitURL.createObjectURL(file);
            img.onload = function () {
                ee.editImg = img;
                ee.init();
            }

        });


    }

    //选择图片后初始化
    EditAvatar.prototype.init = function () {
        var iWidth = this.editImg.width;//图片原始宽度
        var iHeight = this.editImg.height;//高度
        var proportion = iWidth / iHeight;//比例
        var sWidth = 0;//图像最终宽度
        var sHeight = 0;//高度
        var cWidth = this.editCanvas.width;//画板宽
        var cHeight = this.editCanvas.height;//高

        var cxtX, cxtY;
        if (proportion >= 1) {//width>height
            sWidth = parseInt(cWidth);
            sHeight = parseInt(cWidth / proportion);
            cxtX = 0;
            cxtY = (cHeight - sHeight) / 2;
            this._draw.cursor_length = sHeight;
        } else {
            sWidth = parseInt(cHeight * proportion);
            sHeight = parseInt(cHeight);
            cxtX = (cWidth - sWidth) / 2;
            cxtY = 0;
            this._draw.cursor_length = sWidth;
        }

        this._draw.img_cxtX = cxtX;
        this._draw.img_cxtY = cxtY;
        this._draw.img_sWidth = sWidth;
        this._draw.img_sHeight = sHeight;

        this._draw.cursor_maxlength = this._draw.cursor_length;
        this._draw.cursor_maxleft = sWidth;
        this._draw.cursor_maxtop = sHeight;
        this._draw.cursor_mleft = cxtX;
        this._draw.cursor_mtop = cxtY;
        this._draw.cursor_left = 0;
        this._draw.cursor_top = 0;

        this.draw();
    }

    
    EditAvatar.prototype.draw = function () {
        this.cxt.fillStyle = "black";
        this.cxt.fillRect(0, 0, this.editCanvas.width, this.editCanvas.height);
        this.cxt.drawImage(this.editImg, this._draw.img_cxtX, this._draw.img_cxtY, this._draw.img_sWidth, this._draw.img_sHeight);
        $(this.cursor).css("height", this._draw.cursor_length + "px");
        $(this.cursor).css("width", this._draw.cursor_length + "px");
        $(this.cursor).css("margin-left", this._draw.cursor_mleft + "px");
        $(this.cursor).css("margin-top", this._draw.cursor_mtop + "px");
        $(this.cursor).css("left", this._draw.cursor_left + "px");
        $(this.cursor).css("top", this._draw.cursor_top + "px");
        
        this.cxt2.globalCompositeOperation = "copy";
        this.cxt2.clearRect(this._draw.img_cxtX, this._draw.img_cxtY, this._draw.img_sWidth, this._draw.img_sHeight);
        this.cxt2.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.cxt2.fillRect(this._draw.img_cxtX, this._draw.img_cxtY, this._draw.img_sWidth, this._draw.img_sHeight);
        this.cxt2.globalCompositeOperation = "destination-out";
        this.cxt2.beginPath();
        this.cxt2.arc(this._draw.cursor_mleft + this._draw.cursor_left + this._draw.cursor_length / 2, this._draw.cursor_mtop+this._draw.cursor_top + this._draw.cursor_length / 2, this._draw.cursor_length / 2, 0, Math.PI * 2, true);
        this.cxt2.closePath();
        this.cxt2.fill();


    }



    return window.EditAvatar;
});