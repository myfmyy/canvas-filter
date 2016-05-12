(function (e) {
    if (typeof window.define === "function" && window.define.amd) {
        window.define("EditAvatar", [""], e);
    } else {
        e();
    }
})(function () {

    var EditAvatar = function (ele) {
        this.editArea = ele;//编辑区域
        this.imgCanvas;//图片画板
        this.filterCanvas;//滤镜画板
        this.eImg;//原图（用于还原）
        this.editImg,//编辑的图片
        this.iCtx;//imgCanvas 环境
        this.cCtx;//filterCanvas 环境
        this.views = [];//视图列表
        this.args = {//一些参数
            xy: [-1, -1],//鼠标在canvas上的坐标
            refresh: null,//刷新
            _img: {
                iWidth: null,//图片最终绘制宽
                iHeight: null,//图片最终绘制高
                ctxX: null,//图片绘制的X轴  用于居中
                ctxY: null,//Y轴
            },
            _filter: {
                length: null,//滤镜边长
                maxlength: null,//滤镜最大长度
                minlength: 30,//最小长度30
                left: null,//初始偏移
                top: null,//初始偏移
                X: null,//X坐标
                Y: null,//Y坐标
                drop: false,//拖拽状态
                hover: false,//悬浮状态
            }
        }

        create.apply(this);
        vm.apply(this);
        drop.apply(this);
    }

    EditAvatar.prototype = {
        //添加视图
        addView: function (viewElem) {
            var canvas = document.createElement("canvas");
            canvas.width = viewElem.offsetWidth;
            canvas.height = viewElem.offsetHeight;
            viewElem.appendChild(canvas);
            this.views.push({ canvas: canvas, cxt: canvas.getContext("2d") });
        },
        //上传图片
        getFile: function (input) {
            var _this = this;
            input.addEventListener("change", function () {
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
                    _this.eImg = img;
                }
            });
        },
        //获取base64
        getBase64: function (type, length) {
            type = type ? "image/png" : "image/jpeg";
            length = length ? length : 100;

            var canvas = document.createElement("canvas");
            canvas.width = length;
            canvas.height = length;
            document.body.appendChild(canvas);
            cxt = canvas.getContext("2d");

            var proportion = length / this.args._filter.length;
            cxt.drawImage(this.editImg, -this.args._filter.X * proportion, -this.args._filter.Y * proportion, this.args._img.iWidth * proportion, this.args._img.iHeight * proportion);
            var ret = canvas.toDataURL(type);
            document.body.removeChild(canvas);
            return ret;
        }
    }

    function create() {
        this.imgCanvas = document.createElement("canvas");
        this.imgCanvas.width = this.editArea.offsetWidth;
        this.imgCanvas.height = this.editArea.offsetHeight;
        this.editArea.appendChild(this.imgCanvas);
        this.imgCanvas.className = "imgCanvas";
        this.iCtx = this.imgCanvas.getContext("2d");

        this.filterCanvas = document.createElement("canvas");
        this.filterCanvas.width = this.editArea.offsetWidth;
        this.filterCanvas.height = this.editArea.offsetHeight;
        this.editArea.appendChild(this.filterCanvas);
        this.filterCanvas.className = "filterCanvas";
        this.cCtx = this.filterCanvas.getContext("2d");

        var _this = this;
        //添加滚轮事件，放大缩小滤镜
        var eventType = document.mozHidden == null ? "mousewheel" : "DOMMouseScroll";
        this.filterCanvas.addEventListener(eventType, function (e) {
            if (_this.args._filter.hover) {
                e.preventDefault();
                var i = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
                console.log(i);
                if (i > 0) {
                    _this.args._filter.length = _this.args._filter.length / 100 * 105;
                    _this.args._filter.length = _this.args._filter.length > _this.args._filter.maxlength ? _this.args._filter.maxlength : _this.args._filter.length;
                } else {
                    _this.args._filter.length = _this.args._filter.length / 100 * 95;
                    _this.args._filter.length = _this.args._filter.length < _this.args._filter.minlength ? _this.args._filter.minlength : _this.args._filter.length;
                }
                _this.args.refresh = 1;
            }
        }, false);

        //监听画板内移动鼠标
        var mX, mY = -1;//按下时鼠标xy
        var fX, fY = -1;//按下时滤镜xy
        this.filterCanvas.onmousedown = function (e) {
            if (_this.args._filter.hover) {
                _this.args._filter.drop = true;
                mX = e.layerX;
                mY = e.layerY;
                fX = _this.args._filter.X;
                fY = _this.args._filter.Y;
            }
        }
        this.filterCanvas.onmouseup = function () {
            _this.args._filter.drop ? _this.args._filter.drop = false : 1;
        }

        this.filterCanvas.onmousemove = function (e) {
            _this.args.xy[0] = e.layerX;
            _this.args.xy[1] = e.layerY;

            //拖拽状态
            if (_this.args._filter.drop) {
                _this.args._filter.X = e.layerX - mX + fX;
                _this.args._filter.Y = e.layerY - mY + fY;

                //限制
                _this.args._filter.X < 0 ? _this.args._filter.X = 0 : 1;
                _this.args._filter.Y < 0 ? _this.args._filter.Y = 0 : 1;

                _this.args._filter.X > _this.args._img.iWidth - _this.args._filter.length ? _this.args._filter.X = _this.args._img.iWidth - _this.args._filter.length : 1;
                _this.args._filter.Y > _this.args._img.iHeight - _this.args._filter.length ? _this.args._filter.Y = _this.args._img.iHeight - _this.args._filter.length : 1;


            }
            _this.args.refresh = 1;
        }
    }

    //拖拽上传
    function drop() {
        //阻止浏览器默认获取文件事件，防止打开文件
        document.body.addEventListener("dragleave", function (e) {
            e.preventDefault();
        })
        document.body.addEventListener("drop", function (e) {
            e.preventDefault();
        })
        document.body.addEventListener("dragenter", function (e) {
            e.preventDefault();
        })
        document.body.addEventListener("dragover", function (e) {
            e.preventDefault();
        })

        var _this = this;
        this.editArea.addEventListener("drop", function (e) {
            var file = e.dataTransfer.files;//获取文件列表
            if (file.length < 1) {//检查是否有文件
                return;
            }
            file = file[0];//只需要编辑一个图片，只去第一个
            if (file.type.indexOf("image") < 0) {//判断文件类型
                return;
            }
            //创建img来加载图片
            var img = document.createElement("img");
            img.src = window.URL.createObjectURL ? window.URL.createObjectURL(file) : window.webkitURL.createObjectURL(file);//获取file的临时url
            img.onload = function () {
                _this.eImg = img;
            }
        })
    }

    function vm() {//监听数据更新，进行相应绘制
        var _this = this;
        //原图
        Object.defineProperty(_this, "eImg", {
            set: function (newVal) {
                _this._eImg = newVal;
                cInit.apply(_this);//初始化
                _this.editImg = newVal;//同时更新
                draw_filter.apply(_this);
            }, get: function () {
                return _this._eImg;
            }
        });
        //更新编辑图片
        Object.defineProperty(_this, "editImg", {
            set: function (newVal) {
                _this._editImg = newVal;
                //编辑图片更新，需要重新绘制底部canvas，和小视图
                draw_bg.apply(_this);
                draw_view.apply(_this);
            }, get: function () {
                return _this._editImg;
            }
        })
        //更新滤镜和view
        Object.defineProperty(_this.args, "refresh", {
            set: function (newVal) {
                draw_filter.apply(_this);
                draw_view.apply(_this);
            }
        })
        //滤镜hover监听
        Object.defineProperty(_this.args._filter, "hover", {
            set: function (newVal) {
                if (newVal != _this.args._filter._hover) {
                    if (newVal) {
                        _this.filterCanvas.className = "filterCanvas filterCanvas_h";
                    } else {
                        _this.filterCanvas.className = "filterCanvas";
                    }
                }
                _this.args._filter._hover = newVal;
            }, get: function () {
                return _this.args._filter._hover;
            }
        })
    }

    //图片改变后初始化一些参数
    function cInit() {
        var proportion = this.eImg.width / this.eImg.height;//宽高比例
        if (proportion >= 1) {// width>height
            this.args._img.iWidth = this.imgCanvas.width;
            this.args._img.iHeight = parseInt(this.imgCanvas.width / proportion);
            this.args._img.ctxX = 0;
            this.args._img.ctxY = (this.imgCanvas.height - this.args._img.iHeight) / 2;
        } else {
            this.args._img.iWidth = parseInt(this.imgCanvas.height * proportion);
            this.args._img.iHeight = this.imgCanvas.height;
            this.args._img.ctxX = (this.imgCanvas.width - this.args._img.iWidth) / 2;
            this.args._img.ctxY = 0;
        }

        this.args._filter.length = this.args._img.iWidth > this.args._img.iHeight ? this.args._img.iHeight : this.args._img.iWidth;
        this.args._filter.maxlength = this.args._filter.length;
        this.args._filter.left = this.args._img.ctxX;
        this.args._filter.top = this.args._img.ctxY;
        this.args._filter.X = 0;
        this.args._filter.Y = 0;
        this.args._filter.drop = false;
    }

    //绘制背景图片
    function draw_bg() {
        this.iCtx.fillStyle = "black";
        this.iCtx.fillRect(0, 0, this.imgCanvas.width, this.imgCanvas.height);
        this.iCtx.drawImage(this.editImg, this.args._img.ctxX, this.args._img.ctxY, this.args._img.iWidth, this.args._img.iHeight);
    }

    //绘制滤镜
    function draw_filter() {
        this.cCtx.globalCompositeOperation = "copy";
        this.cCtx.clearRect(this.args._img.ctxX, this.args._img.ctxY, this.args._img.iWidth, this.args._img.iHeight);
        this.cCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
        this.cCtx.fillRect(this.args._img.ctxX, this.args._img.ctxY, this.args._img.iWidth, this.args._img.iHeight);
        this.cCtx.globalCompositeOperation = "destination-out";
        this.cCtx.beginPath();
        this.cCtx.arc(this.args._filter.left + this.args._filter.X + this.args._filter.length / 2, this.args._filter.top + this.args._filter.Y + this.args._filter.length / 2, this.args._filter.length / 2, 0, Math.PI * 2, true);
        this.cCtx.closePath();
        this.cCtx.fill();
        if (this.cCtx.isPointInPath(this.args.xy[0], this.args.xy[1])) {
            this.args._filter.hover = true;
        } else {
            this.args._filter.hover = false;
        }

    }

    //绘制小视图
    function draw_view() {
        for (var i = 0; i < this.views.length; i++) {
            this.views[i].cxt.clearRect(0, 0, this.views[i].canvas.width, this.views[i].canvas.height);
            var proportion = this.views[i].canvas.width / this.args._filter.length;//计算小视图比例
            this.views[i].cxt.drawImage(this.editImg, -this.args._filter.X * proportion, -this.args._filter.Y * proportion, this.args._img.iWidth * proportion, this.args._img.iHeight * proportion);
        }
    }

    window.EditAvatar = EditAvatar;
    return EditAvatar;
});