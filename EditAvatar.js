

(function (callback) {
    if (typeof window.define === "function" && window.define.amd) {
        window.define("EditAvatar", ["jquery"], callback);
    } else {
        callback(window.jQuery);
    }
})(function ($) {


    var EditAvatar = function (editArea) {
        this.editArea = editArea;//编辑区域
        this.editCanvas;//编辑canvas
        this.editCanvas2;//编辑canvas
        this.editImg;//正在编辑的图片
        this.eImg;//原图
        this.cursor;
        this._draw = {};
        this.cxt;
        this.views = [];
    }

    window.EditAvatar = EditAvatar;

    EditAvatar.prototype.create = function () {
        this.createEditArea();
        this.getPic();

    }

    EditAvatar.prototype.createEditArea = function () {
        //canvas
        this.editCanvas = document.createElement("canvas");
        this.editCanvas.width = $(this.editArea).width();
        this.editCanvas.height = $(this.editArea).height();
        $(this.editCanvas).css({ "position": "absolute" });
        $(this.editArea).append(this.editCanvas);
        this.cxt = this.editCanvas.getContext("2d");

        this.editCanvas2 = document.createElement("canvas");
        this.editCanvas2.width = $(this.editArea).width();
        this.editCanvas2.height = $(this.editArea).height();
        $(this.editCanvas2).css({ "position": "absolute"});
        $(this.editArea).append(this.editCanvas2);
        this.cxt2 = this.editCanvas2.getContext("2d");


        //cursor
        this.cursor = document.createElement("div");
        $(this.cursor).css({ "position": "absolute", "cursor": "all-scroll", "border-radius": "50%", "width": "0px", "height": "0px", "z-index": "9999" });
        $(this.editArea).append(this.cursor);
        this.initCursor();
        var thi = this;
        $(this.cursor).hover(function () {
            thi._draw.cursor_h = true;
            thi.draw();
        }, function () {
            thi._draw.cursor_h = false;
            thi.draw();
        });
    }

    EditAvatar.prototype.cursorResize = function (re) {
        if (typeof re === "boolean") {
            if (re) {
                this._draw.cursor_length = this._draw.cursor_length / 100 * 105;
                if (this._draw.cursor_length > this._draw.cursor_maxlength) {
                    this._draw.cursor_length = this._draw.cursor_maxlength;
                }
            } else {
                this._draw.cursor_length = this._draw.cursor_length / 100 * 95;
                if (this._draw.cursor_length < this._draw.cursor_minlength) {
                    this._draw.cursor_length = this._draw.cursor_minlength;
                }
            }
        } else if (typeof re === "number") {
            this._draw.cursor_length = re;
        }
        this.draw();
    }

    EditAvatar.prototype.initCursor = function () {
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
                    win._draw.cursor_left = x + yX;
                }
            } else {
                if (x + yX > 0) {
                    win._draw.cursor_left = x + yX;
                } else {
                    win._draw.cursor_left = 0;
                }
            }
            if (yY > 0) {
                if (y + yY > win._draw.cursor_maxtop - win._draw.cursor_length) {
                    win._draw.cursor_top = win._draw.cursor_maxtop - win._draw.cursor_length;
                } else {
                    win._draw.cursor_top = y + yY;
                }
            } else {
                if (y + yY > 0) {
                    win._draw.cursor_top = y + yY;
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

    EditAvatar.prototype.getFile = function (input) {
        var ee = this;
        $(input).get(0).addEventListener("change", function () {
            var file = this.files;
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
                ee.eImg = img;
                ee.init();
            }
        });
    }

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
                ee.eImg = img;
                ee.init();
            }
        });
    }

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
        this._draw.cursor_minlength = 30;
        this._draw.cursor_maxleft = sWidth;
        this._draw.cursor_maxtop = sHeight;
        this._draw.cursor_mleft = cxtX;
        this._draw.cursor_mtop = cxtY;
        this._draw.cursor_left = 0;
        this._draw.cursor_top = 0;
        this._draw.cursor_h = false;
        this.draw();
    }

    EditAvatar.prototype.addView = function (viewElem) {
        var canvas = document.createElement("canvas");
        canvas.width = $(viewElem).width();
        canvas.height = $(viewElem).width();
        $(viewElem).append(canvas);
        this.views.push({ canvas: canvas, cxt: canvas.getContext("2d") });

    }

    EditAvatar.prototype.draw = function () {
        //底部
        this.cxt.fillStyle = "black";
        this.cxt.fillRect(0, 0, this.editCanvas.width, this.editCanvas.height);
        this.cxt.drawImage(this.editImg, this._draw.img_cxtX, this._draw.img_cxtY, this._draw.img_sWidth, this._draw.img_sHeight);

        //cursor
        $(this.cursor).css({ "height": this._draw.cursor_length + "px", "width": this._draw.cursor_length + "px", "margin-left": this._draw.cursor_mleft + "px", "margin-top": this._draw.cursor_mtop + "px", "left": this._draw.cursor_left + "px", "top": this._draw.cursor_top + "px" });
        //if (this._draw.cursor_h) {
        //    $(this.cursor).css("border-radius", "0");
        //    $(this.cursor).css("border", "1px solid black");
        //} else {
        //    $(this.cursor).css("border-radius", "50%");
        //    $(this.cursor).css("border", "none");
        //}

        //cursor canvas
        this.cxt2.globalCompositeOperation = "copy";
        this.cxt2.clearRect(this._draw.img_cxtX, this._draw.img_cxtY, this._draw.img_sWidth, this._draw.img_sHeight);
        this.cxt2.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.cxt2.fillRect(this._draw.img_cxtX, this._draw.img_cxtY, this._draw.img_sWidth, this._draw.img_sHeight);
        this.cxt2.globalCompositeOperation = "destination-out";
        this.cxt2.beginPath();
        this.cxt2.arc(this._draw.cursor_mleft + this._draw.cursor_left + this._draw.cursor_length / 2, this._draw.cursor_mtop + this._draw.cursor_top + this._draw.cursor_length / 2, this._draw.cursor_length / 2, 0, Math.PI * 2, true);
        this.cxt2.closePath();
        this.cxt2.fill();

        //view
        for (var i = 0; i < this.views.length; i++) {
            this.views[i].cxt.clearRect(0, 0, this.views[i].canvas.width, this.views[i].canvas.height);
            var proportion = this.views[i].canvas.width / this._draw.cursor_length;
            this.views[i].cxt.drawImage(this.editImg, -this._draw.cursor_left * proportion, -this._draw.cursor_top * proportion, this._draw.img_sWidth * proportion, this._draw.img_sHeight * proportion);
        }
    }

    EditAvatar.prototype.getBase64 = function (type, length) {
        type = type ? "image/png" : "image/jpeg";
        length = length ? length : 100;

        var canvas = document.createElement("canvas");
        canvas.width = length;
        canvas.height = length;
        document.body.appendChild(canvas);
        cxt = canvas.getContext("2d");

        var proportion = length / this._draw.cursor_length;
        cxt.drawImage(this.editImg, -this._draw.cursor_left * proportion, -this._draw.cursor_top * proportion, this._draw.img_sWidth * proportion, this._draw.img_sHeight * proportion);
        var ret = canvas.toDataURL(type);
        document.body.removeChild(canvas);
        return ret;
    }


    return window.EditAvatar;



    function clone(myObj) {
        if (typeof (myObj) != 'object') return myObj;
        if (myObj == null) return myObj;

        var myNewObj = new Object();

        for (var i in myObj)
            myNewObj[i] = clone(myObj[i]);

        return myNewObj;
    }
});
