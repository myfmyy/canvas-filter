$(function () {
    //设为首页
    $(".win-homepage").click(function () {
        if (document.all) {//设置IE 
            document.body.style.behavior = 'url(#default#homepage)';
            document.body.setHomePage(document.URL);
        } else { alert("设置首页失败，请手动设置！"); }
    });
    //加入收藏
    $(".win-favorite").click(function () {
        var sURL = document.URL;
        var sTitle = document.title;
        try { window.external.addFavorite(sURL, sTitle); }
        catch (e) {
            try { window.sidebar.addPanel(sTitle, sURL, ""); }
            catch (e) { alert("加入收藏失败，请使用Ctrl+D进行添加"); }
        }
    });
    //前进
    $(".win-forward").click(function () {
        window.history.forward(1);
    });
    //后退
    $(".win-back").click(function () {
        window.history.back(-1);
    });
    //返回顶部
    $(".win-backtop").click(function () { $('body,html').animate({ scrollTop: 0 }, 1000); return false; });
    //刷新
    $(".win-refresh").click(function () {
        window.location.reload();
    });
    //打印
    $(".win-print").click(function () {
        window.print();
    });
    //关闭
    $(".win-close").click(function () {
        window.close();
    });
    //全选
    $('.checkall').click(function () {
        var e = $(this);
        var name = e.attr("name");
        var checkfor = e.attr("checkfor");
        var type;
        if (checkfor != '' && checkfor != null && checkfor != undefined) {
            type = e.closest('form').find("input[name='" + checkfor + "']");
        } else {
            type = e.closest('form').find("input[type='checkbox']");
        };
        if (name == "checkall") {
            $(type).each(function (index, element) {
                element.checked = true;
            });
            e.attr("name", "ok");
        } else {
            $(type).each(function (index, element) {
                element.checked = false;
            });
            e.attr("name", "checkall");
        }
    });
    //显示下拉菜单
    $('.dropdown-toggle').click(function () {
        $(this).closest('.button-group, .drop').addClass("open");
    });
    //关闭下拉菜单
    $(document).bind("click", function (e) {
        if ($(e.target).closest(".button-group.open, .drop.open").length == 0) {
            $(".button-group, .drop").removeClass("open");
        }
    });
    //显示placeholder
    //判断是否支持placeholder
    $checkplaceholder = function () {
        var input = document.createElement('input');
        return 'placeholder' in input;
    };
    //历遍所有输入框
    if (!$checkplaceholder()) {
        $("textarea[placeholder], input[placeholder]").each(function (index, element) {
            var content = false;
            if ($(this).val().length === 0 || $(this).val() == $(this).attr("placeholder")) { content = true };
            if (content) {
                //预先加载placeholder:等同于showplaceholder
                $(element).val($(element).attr("placeholder"));
                $(element).data("pintuerholder", $(element).css("color"));
                $(element).css("color", "rgb(169,169,169)");
                //事件
                $(element).focus(function () { $hideplaceholder($(this)); });
                $(element).blur(function () { $showplaceholder($(this)); });
            }
        })
    };
    //显示placeholder
    $showplaceholder = function (element) {
        //不为空及密码框
        if (($(element).val().length === 0 || $(element).val() == $(element).attr("placeholder")) && $(element).attr("type") != "password") {
            $(element).val($(element).attr("placeholder"));
            $(element).data("pintuerholder", $(element).css("color"));
            $(element).css("color", "rgb(169,169,169)");
        }
    };
    //隐藏placeholder
    var $hideplaceholder = function (element) {
        if ($(element).data("pintuerholder")) {
            $(element).val("");
            $(element).css("color", $(element).data("pintuerholder"));
            $(element).removeData("pintuerholder");
        }
    };
    //字符检测:文本框失去焦点后
    $('textarea, input, select').blur(function () {
        //当含表单验证时
        var e = $(this);
        if (e.attr("data-validate")) {
            e.closest('.field').find(".input-help").remove();//移除现有的提示
            var $checkdata = e.attr("data-validate").split(',');//检测规则
            var $checkvalue = e.val();//值
            var $checkstate = true;//认证状态
            var $checktext = "";//认证文本
            //当值等于placeholder时为空
            if (e.attr("placeholder") == $checkvalue) { $checkvalue = ""; }
            //必填或者不为空时的验证 (radio,checkbox为checkvalue!="")
            if ($checkvalue != "" || e.attr("data-validate").indexOf("required") >= 0) {
                //检验所有的类型是否正确
                for (var i = 0; i < $checkdata.length; i++) {
                    var $checktype = $checkdata[i].split(':');
                    if (!$pintuercheck(e, $checktype[0], $checkvalue)) {
                        $checkstate = false;
                        $checktext = $checktext + "<li>" + $checktype[1] + "</li>";
                    }
                }
                //for结束
            };
            //输出信息
            if ($checkstate) {
                e.closest('.form-group').removeClass("check-error");
                e.parent().find(".input-help").remove();
                e.closest('.form-group').addClass("check-success");
            } else {
                e.closest('.form-group').removeClass("check-success");
                e.closest('.form-group').addClass("check-error");
                e.closest('.field').append('<div class="input-help"><ul>' + $checktext + '</ul></div>');
            }//输出结束
        }
    });
    //输入值检测
    $pintuercheck = function (element, type, value) {
        $pintu = value.replace(/(^\s*)|(\s*$)/g, "");
        switch (type) {
            case "required": return /[^(^\s*)|(\s*$)]/.test($pintu); break; //必填
            case "chinese": return /^[\u0391-\uFFE5]+$/.test($pintu); break; //中文
            case "number": return /^\d+$/.test($pintu); break; //数字
            case "integer": return /^[-\+]?\d+$/.test($pintu); break; //正负整数
            case "plusinteger": return /^[+]?\d+$/.test($pintu); break; //正整数
            case "double": return /^[-\+]?\d+(\.\d+)?$/.test($pintu); break; //正负小数
            case "plusdouble": return /^[+]?\d+(\.\d+)?$/.test($pintu); break; //正小数
            case "english": return /^[A-Za-z]+$/.test($pintu); break;//英文
            case "username": return /^[a-z]\w{3,}$/i.test($pintu); break;//字母数字下划线
            case "mobile": return /^((\(\d{3}\))|(\d{3}\-))?13[0-9]\d{8}?$|15[89]\d{8}?$|170\d{8}?$|147\d{8}?$/.test($pintu); break;//手机
            case "phone": return /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/.test($pintu); break;//电话
            case "tel": return /^((\(\d{3}\))|(\d{3}\-))?13[0-9]\d{8}?$|15[89]\d{8}?$|170\d{8}?$|147\d{8}?$/.test($pintu) || /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/.test($pintu); break;//邮件
            case "email": return /^[^@]+@[^@]+\.[^@]+$/.test($pintu); break;//邮件
            case "url": return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/.test($pintu); break;//url
            case "ip": return /^[\d\.]{7,15}$/.test($pintu); break;//ip
            case "qq": return /^[1-9]\d{4,10}$/.test($pintu); break;//ip
            case "currency": return /^\d+(\.\d+)?$/.test($pintu); break;//货币
            case "zip": return /^[1-9]\d{5}$/.test($pintu); break;//邮编
            case "radio":
                var radio = element.closest('form').find('input[name="' + element.attr("name") + '"]:checked').length;
                return eval(radio == 1);
                break;
            default:
                //对有三个值的判断 : 对下拉组的验证还没实现
                var $test = type.split('#');
                if ($test.length > 1) {
                    switch ($test[0]) {
                        case "compare":	//数值对比
                            return eval(Number($pintu) + $test[1]);
                            break;
                        case "regexp":	//匹配
                            return new RegExp($test[1], "gi").test($pintu);
                            break;
                        case "length":	//字符长度
                            var $length;
                            if (element.attr("type") == "checkbox") {
                                $length = element.closest('form').find('input[name="' + element.attr("name") + '"]:checked').length;
                            } else {
                                $length = $pintu.replace(/[\u4e00-\u9fa5]/g, "***").length;
                            }
                            return eval($length + $test[1]);
                            break;
                        case "ajax":	//异步，如用户名验证
                            var $getdata;
                            var $url = $test[1] + $pintu;
                            $.ajaxSetup({ async: false }); //设置同步了才能读取赋值
                            $.getJSON($url, function (data) {
                                $getdata = data.getdata;
                            });
                            if ($getdata == "true") { return true; }
                            break;
                        case "repeat": //重复密码
                            return $pintu == jQuery('input[name="' + $test[1] + '"]').eq(0).val();
                            break;
                        default: return true; break;
                    }
                    break;
                } else {
                    return true;
                }
        }
    };
    //表单提交验证
    $('form').submit(function () {
        $(this).find('input[data-validate],textarea[data-validate],select[data-validate]').trigger("blur");
        $(this).find('input[placeholder],textarea[placeholder]').each(function () { $hideplaceholder($(this)); });
        var numError = $(this).find('.check-error').length;
        if (numError) {
            //获取第一个error的焦点
            $(this).find('.check-error').first().find('input[data-validate],textarea[data-validate],select[data-validate]').first().focus().select();
            return false;
        }
    });
    //重置 //要求：重置按钮需要加样式form-reset
    $('.form-reset').click(function () {
        $(this).closest('form').find(".input-help").remove();
        $(this).closest('form').find('.form-submit').removeAttr('disabled');
        $(this).closest('form').find('.form-group').removeClass("check-error");
        $(this).closest('form').find('.form-group').removeClass("check-success");
    });
    //选项标签
    $('.tab .tab-nav li').each(function () {
        var e = $(this);
        var trigger = e.closest('.tab').attr("data-toggle");
        if (trigger == "hover") {
            e.mouseover(function () {
                $showtabs(e);
            });
            e.click(function () {
                return false;
            });
        } else {
            e.click(function () {
                $showtabs(e);
                return false;
            });
        }
    });
    //显示选项标签
    $showtabs = function (e) {
        var detail = e.children("a").attr("href");
        e.closest('.tab .tab-nav').find("li").removeClass("active");
        e.closest('.tab').find(".tab-body .tab-panel").removeClass("active");
        e.addClass("active");
        $(detail).addClass("active");
    };
    //对话框
    $('.dialogs').each(function () {
        var e = $(this);
        var trigger = e.attr("data-toggle");
        if (trigger == "hover") {
            e.mouseover(function () {
                $showdialogs(e);
            });
        } else if (trigger == "click") {
            e.click(function () {
                $showdialogs(e);
            });
        }
    });
    //显示对话框
    $showdialogs = function (e) {
        var trigger = e.attr("data-toggle");
        var getid = e.attr("data-target");
        var data = e.attr("data-url");
        var mask = e.attr("data-mask");
        var width = e.attr("data-width");
        var detail = "";
        var masklayout = $('<div class="dialog-mask"></div>');
        if (width == null) { width = "80%"; }

        if (mask == "1") {
            $("body").append(masklayout);
        }
        detail = '<div class="dialog-win" style="position:fixed;width:' + width + ';z-index:11;">';
        if (getid != null) { detail = detail + $(getid).html(); }
        if (data != null) { detail = detail + $.ajax({ url: data, async: false }).responseText; }
        detail = detail + '</div>';

        var win = $(detail);
        win.find(".dialog").addClass("open");
        $("body").append(win);
        var x = parseInt($(window).width() - win.outerWidth()) / 2;
        var y = parseInt($(window).height() - win.outerHeight()) / 2;
        if (y <= 10) { y = "10" }
        win.css({ "left": x, "top": y });
        win.find(".dialog-close,.close").each(function () {
            $(this).click(function () {
                win.remove();
                $('.dialog-mask').remove();
            });
        });
        masklayout.click(function () {
            win.remove();
            $(this).remove();
        });
    };
    //提示信息
    $('.tips').each(function () {
        var e = $(this);
        var title = e.attr("title");
        var trigger = e.attr("data-toggle");
        e.attr("title", "");
        if (trigger == "" || trigger == null) { trigger = "hover"; }
        if (trigger == "hover") {
            e.mouseover(function () {
                $showtips(e, title);
            });
        } else if (trigger == "click") {
            e.click(function () {
                $showtips(e, title);
            });
        } else if (trigger == "show") {
            e.ready(function () {
                $showtips(e, title);
            });
        }
    });
    //显示tips
    $showtips = function (e, title) {
        var trigger = e.attr("data-toggle");
        var place = e.attr("data-place");
        var width = e.attr("data-width");
        var css = e.attr("data-style");
        var image = e.attr("data-image");
        var content = e.attr("content");
        var getid = e.attr("data-target");
        var data = e.attr("data-url");
        var x = 0;
        var y = 0;
        var html = "";
        var detail = "";

        if (image != null) { detail = detail + '<img class="image" src="' + image + '" />'; }
        if (content != null) { detail = detail + '<p class="tip-body">' + content + '</p>'; }
        if (getid != null) { detail = detail + $(getid).html(); }
        if (data != null) { detail = detail + $.ajax({ url: data, async: false }).responseText; }
        if (title != null && title != "") {
            if (detail != null && detail != "") { detail = '<p class="tip-title"><strong>' + title + '</strong></p>' + detail; } else { detail = '<p class="tip-line">' + title + '</p>'; }
        }
        detail = '<div class="tip">' + detail + '</div>';
        html = $(detail);

        $("body").append(html);
        if (width != null) {
            html.css("width", width);
        }
        if (place == "" || place == null) { place = "top"; }
        if (place == "left") {
            x = e.offset().left - html.outerWidth() - 5;
            y = e.offset().top - html.outerHeight() / 2 + e.outerHeight() / 2;
        } else if (place == "top") {
            x = e.offset().left - html.outerWidth() / 2 + e.outerWidth() / 2;
            y = e.offset().top - html.outerHeight() - 5;
        } else if (place == "right") {
            x = e.offset().left + e.outerWidth() + 5;
            y = e.offset().top - html.outerHeight() / 2 + e.outerHeight() / 2;
        } else if (place == "bottom") {
            x = e.offset().left - html.outerWidth() / 2 + e.outerWidth() / 2;
            y = e.offset().top + e.outerHeight() + 5;
        }
        if (css != "") { html.addClass(css); }
        html.css({ "left": x + "px", "top": y + "px", "position": "absolute" });
        if (trigger == "hover" || trigger == "click" || trigger == null) {
            e.mouseout(function () { html.remove(); e.attr("title", title) });
        }
    };
    //关闭警告框
    $('.alert .close').each(function () {
        $(this).click(function () {
            $(this).closest('.alert').remove();
        });
    });
    //单选
    $('.radio label').each(function () {
        var e = $(this);
        e.click(function () {
            e.closest('.radio').find("label").removeClass("active");
            e.addClass("active");
        });
    });
    //多选
    $('.checkbox label').each(function () {
        var e = $(this);
        e.click(function () {
            if (e.find('input').is(':checked')) {
                e.addClass("active");
            } else {
                e.removeClass("active");
            };
        });
    });
    //折叠
    $('.collapse .panel-head').each(function () {
        var e = $(this);
        e.click(function () {
            e.closest('.collapse').find(".panel").removeClass("active");
            e.closest('.panel').addClass("active");
        });
    });
    //导航
    $('.icon-navicon').each(function () {
        var e = $(this);
        var target = e.attr("data-target");
        e.click(function () {
            $(target).toggleClass("nav-navicon");
        });
    });
    //进度条
    $('.progress').each(function () {
        var e = $(this);
        var mini = e.attr("data-mini");
        var value = e.find('input').val();
        var maxi = e.attr("data-max");
        var style = e.attr("data-style");
        var show = e.attr("data-show");
        var title = e.attr("title");
        var progress = parseInt(value) * 100 / (parseInt(maxi) - parseInt(mini));
        var bar = $('<div class="progress-bar"></div>');

        if (maxi == null) {
            return false;
        }
        if (title == null) { title = ""; }
        if (show == null) { show = 0; }
        if (!isNaN(progress)) {
            bar.css("width", progress + "%");
            if (parseInt(show) == 1) { bar.html(title + parseInt(progress) + "%"); }
        }
        if (style != null) { bar.addClass(style); };
        e.append(bar);
    });
    //轮播
    $('.banner').each(function () {
        var e = $(this);
        var pointer = e.attr("data-pointer");
        var interval = e.attr("data-interval");
        var style = e.attr("data-style");
        var items = e.attr("data-item");
        var items_s = e.attr("data-small");
        var items_m = e.attr("data-middle");
        var items_b = e.attr("data-big");
        var num = e.find(".carousel .item").length;
        var win = $(window).width();
        var i = 1; //初始化为1，解决首次轮播时间的问题。

        if (interval == null) { interval = 5 };

        if (items == null || items < 1) { items = 1 };
        if (items_s != null && win > 760) { items = items_s };
        if (items_m != null && win > 1000) { items = items_m };
        if (items_b != null && win > 1200) { items = items_b };

        var itemWidth = Math.ceil(e.outerWidth() / items);
        var page = Math.ceil(num / items);
        e.find(".carousel .item").css("width", itemWidth + "px");
        e.find(".carousel").css("width", itemWidth * num + "px");

        var carousel = function () {
            i++;
            if (i > page) { i = 1; }
            $showbanner(e, i, items, num);
        };
        var play = setInterval(carousel, interval * 600);
        e.mouseover(function () { clearInterval(play); });
        e.mouseout(function () { play = setInterval(carousel, interval * 600); });

        if (pointer != 0 && page > 1) {
            var point = '<ul class="pointer"><li value="1" class="active"></li>';
            for (var j = 1; j < page; j++) {
                point = point + ' <li value="' + (j + 1) + '"></li>';
            };
            point = point + '</ul>';
            var pager = $(point);
            if (style != null) { pager.addClass(style); };
            e.append(pager);
            pager.css("left", e.outerWidth() * 0.5 - pager.outerWidth() * 0.5 + "px");
            pager.find("li").click(function () {
                $showbanner(e, $(this).val(), items, num);
            });
            //前后
            var lefter = $('<div class="pager-prev icon-angle-left"></div>');
            var righter = $('<div class="pager-next icon-angle-right"></div>');
            if (style != null) { lefter.addClass(style); righter.addClass(style); };
            e.append(lefter);
            e.append(righter);

            lefter.click(function () {
                i--;
                if (i < 1) { i = page; }
                $showbanner(e, i, items, num);
            });
            righter.click(function () {
                i++;
                if (i > page) { i = 1; }
                $showbanner(e, i, items, num);
            });
        };
    });
    $showbanner = function (e, i, items, num) {
        var after = 0, leftx = 0;
        leftx = -Math.ceil(e.outerWidth() / items) * (items) * (i - 1);
        //当个数不足时，用最后的数量
        if (i * items > num) { after = i * items - num; leftx = -Math.ceil(e.outerWidth() / items) * (num - items); };
        e.find(".carousel").stop(true, true).animate({ "left": leftx + "px" }, 800);
        e.find(".pointer li").removeClass("active");
        e.find(".pointer li").eq(i - 1).addClass("active");
    };
    //窗口改变时,需重写js
    /*
        $(window).resize(function(){
            //相应事件
        });
    */
    //区间:还有问题，无法拖动
    $('.range').each(function () {
        var e = $(this);
        var mini = e.attr("data-mini");
        var maxi = e.attr("data-max");
        var step = e.attr("data-step");
        var style = e.attr("data-style");
        var bg = e.attr("data-bg");
        var toggle = e.attr("data-toggle")
        var value = "";
        var start = "";
        var bar = "";
        var width = "";
        var dragging = false;
        var leftX, rightX;

        if (style == null) { style = "bg-main"; };

        var leftbar = $('<span class="range-scroll range-scroll-left ' + style + '"></span>');
        var rightbar = $('<span class="range-scroll range-scroll-right ' + style + '"></span>');

        if (e.find('input').length == 2) {
            start = e.find('input[data-value="mini"]').val();
            value = e.find('input[data-value="max"]').val();
            var left = parseInt(100 * start / (maxi - mini));
            width = parseInt(100 * (value - start) / (maxi - mini));
            bar = $('<div class="range-bar" style="left:' + left + '%;width:' + width + '%;"></div>');
            bar.append(leftbar);
            bar.append(rightbar);
        } else if (e.find('input').length == 1) {
            value = e.find('input').val();
            width = parseInt(100 * (value - mini) / (maxi - mini));
            bar = $('<div class="range-bar" style="width:' + width + '%;"></span></div>');
            bar.append(rightbar);
        } else if (e.find('select').length == 1) {
            mini = 1;
            maxi = $("select[name=" + e.find("select").attr("name") + "] option").size();
            step = parseInt(100 / maxi);
            value = 1;
            width = parseInt(100 * value / maxi);
            bar = $('<div class="range-bar" style="width:' + width + '%;"></div>');
            bar.append(rightbar);
        };
        if (bg != null) { bar.addClass(bg); };
        e.append(bar);

        rightbar.mousedown(function (e) {
            $(this).css("cursor", "move");
            var offset = $(this).offset();

            var x = e.clientX;
            //	alert(e.pageX +"|"+ offset.left);

            $(document).bind("mousemove", function (ev) {
                rightbar.stop();
                var _x = ev.pageX - x;
                //	alert(ev.pageX);
                rightbar.animate({ left: _x + "px" }, 10);
            });
        });
        $(document).mouseup(function () {
            rightbar.css("cursor", "default");
            $(this).unbind("mousemove");
        });

        /*
                rightbar.mousedown(function(e){
                    dragging=true;
                    var e=e || window.event;
                    rightX=e.clientX-this.offsetLeft;
                    this.setCapture;
                    return false;
                });
                $(document).mousemove(function(e){
                    if(dragging){
                        var e=e || window.event;
                        var oX=e.clientX - rightX;
                        rightbar.css({"left":oX + "px"});
                        return false;
                    };
                });
                $(document).mouseup(function(e){
                    dragging=false;
                    rightbar[0].releaseCapture();
                    e.cancelBubble = true;
                });
        */
    });
    //滚动监听
    $(".spy a").each(function () {
        var e = $(this);
        var t = e.closest(".spy");
        var target = t.attr("data-target");
        var top = t.attr("data-offset-spy");
        var thistarget = "";
        var thistop = "";
        if (top == null) { top = 0; };
        if (target == null) { thistarget = $(window); } else { thistarget = $(target); };

        thistarget.bind("scroll", function () {
            if (target == null) {
                thistop = $(e.attr("href")).offset().top - $(window).scrollTop() - parseInt(top);
            } else {
                thistop = $(e.attr("href")).offset().top - thistarget.offset().top - parseInt(top);
            };

            if (thistop < 0) {
                t.find('li').removeClass("active");
                e.parents('li').addClass("active");
            };

        });
    });

    //静止在顶部或尾部
    $(".fixed").each(function () {
        var e = $(this);
        var style = e.attr("data-style");
        var top = e.attr("data-offset-fixed");
        if (top == null) { top = e.offset().top; } else { top = e.offset().top - parseInt(top); };
        if (style == null) { style = "fixed-top"; };

        $(window).bind("scroll", function () {
            var thistop = top - $(window).scrollTop();
            if (style == "fixed-top" && thistop < 0) {
                e.addClass("fixed-top");
            } else {
                e.removeClass("fixed-top");
            };

            var thisbottom = top - $(window).scrollTop() - $(window).height();
            if (style == "fixed-bottom" && thisbottom > 0) {
                e.addClass("fixed-bottom");
            } else {
                e.removeClass("fixed-bottom");
            };
        });

    });

})