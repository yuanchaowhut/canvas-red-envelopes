var canvasWidth = Math.min(1200, $(window).width() - 60);
var canvasHeight = 0.625 * canvasWidth; //与选取的图片有关,我这个图片是 1200x750的尺寸
//用600这个临界值粗略的区分下移动端或PC端
var RADIUS_INCREASE = window.innerWidth < 600 ? 50 : 100;
var RADIUS = window.innerWidth < 600 ? 50 : 100;
var clippingRegion = {x: canvasWidth / 2, y: canvasHeight / 2, r: RADIUS};
var isMouseDown = false;
var timer = null;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

var image = new Image();
image.src = "images/mm.jpeg";
image.onload = function () {
    $("#blur-div").css({width: canvasWidth, height: canvasHeight});
    $("#blur-image").css({width: canvasWidth, height: canvasHeight});

    initCanvas();
    initEvents();
};

function initCanvas() {
    draw(image, clippingRegion);
}


/**
 * 设置剪辑区域
 * @param clippingRegion
 */
function setClippingRegion(clippingRegion) {
    context.beginPath();
    context.arc(clippingRegion.x, clippingRegion.y, clippingRegion.r, 0, 2 * Math.PI);
    context.closePath();
    context.clip();
}

/**
 * 绘制图像
 * @param image
 * @param clippingRegion
 */
function draw(image, clippingRegion) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    setClippingRegion(clippingRegion);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.restore();
}

/**
 * 显示完整的清晰图片
 */
function show() {
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(function () {
        if (clippingRegion.r >= 1.5 * canvasWidth) {
            clearInterval(timer);
            timer = null;
            return;
        }
        clippingRegion.r += RADIUS_INCREASE;
        draw(image, clippingRegion);
    }, 100);
}


function reset() {
    if (timer) {
        clearInterval(timer);
    }
    clippingRegion = {x: canvasWidth / 2, y: canvasHeight / 2, r: RADIUS};
    initCanvas();
}

function initEvents() {
    $("#show-button").click(function () {
        show();
    });

    $("#reset-button").click(function () {
        reset();
    });

    //PC端事件
    canvas.onmousedown = function (e) {
        e.preventDefault();
        isMouseDown = true;
        var point = windowToCanvas(e.clientX, e.clientY);
        clippingRegion = Object.assign({}, clippingRegion, point);
        draw(image, clippingRegion);
    };

    canvas.onmouseup = function (e) {
        e.preventDefault();
        isMouseDown = false;
    };

    canvas.onmousemove = function (e) {
        e.preventDefault();
        if (isMouseDown) {
            var point = windowToCanvas(e.clientX, e.clientY);
            clippingRegion = Object.assign({}, clippingRegion, point);
            draw(image, clippingRegion);
        }
    };

    canvas.onmouseout = function (e) {
        e.preventDefault();
        isMouseDown = false;
    };

    //移动端事件
    canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();
        isMouseDown = true;
        var touch = e.touches[0];
        var point = windowToCanvas(touch.pageX, touch.pageY);
        clippingRegion = Object.assign({}, clippingRegion, point);
        draw(image, clippingRegion);
    });

    canvas.addEventListener("touchmove", function (e) {
        if (isMouseDown) {
            var touch = e.touches[0];
            var point = windowToCanvas(touch.pageX, touch.pageY);
            clippingRegion = Object.assign({}, clippingRegion, point);
            draw(image, clippingRegion);
        }
    });

    canvas.addEventListener("touchend", function (e) {
        e.preventDefault();
        isMouseDown = false;
    })
}

/**
 * 将屏幕坐标转换为canvas的坐标(屏幕坐标可以由event对象计算得到)
 * @param x
 * @param y
 */
function windowToCanvas(x, y) {
    var box = canvas.getBoundingClientRect();
    return {x: x - box.left, y: y - box.top}
}
