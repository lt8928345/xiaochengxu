//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    w: app.w,
    h: 508,
    gamepanelShow:false,
    bgTop1:0,
    bgTop2:0,
    score:0,
    isBtn:false,
    isGameStart:false,
    isPlayerMoving:false,
    gamepanelShow:true,
    isOver:true
  },
  bgSpeed:46,
  bgHeight:736,
  bgDistance:0,
  bgloop:0,
  player:null,
  stage:null,
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onShow:function(options){
    this.reset()
  },
  onHide:function(options){
    this.stop()
  },

  //开始游戏
   startGame:function(event){
    this.setData({
       isOver:true,
       isGameStart:true,
        gamepanelShow:false
     });
    this.stage = wx.createCanvasContext('stage');
    //创建飞船
    this.player = new Ship(this.stage);
    this.run(this.stage);
  },
  //重置游戏
  reset:function(){
    gameMonitor.foodList=[]
    gameMonitor.timmer = null;
    gameMonitor.time = 0;
    this.bgloop=0;
    this.setData({
      score:0,
      gamepanelShow:true,
      isOver:true,
      isBtn:false
    });
  },
  //停止游戏
  stop:function(){
    setTimeout(function(){
        clearTimeout(gameMonitor.timmer)
    },0)
    this.setData({
      gamepanelShow:true,
      isOver:false
    })
  },
  //运行游戏
  run:function(ctx){
    var that=this
    that.setData({
      isBtn:true
    })
    that.rollBg()
     ctx.clearRect(0, 0, app.w, app.panelH);
    that.player.paint()
    that.eat(that.player,gameMonitor.foodList)
    that.createMoon(ctx)
    for (var i = gameMonitor.foodList.length - 1; i >= 0; i--) {
      var f = gameMonitor.foodList[i];
      if (f) {
        f.move(ctx);
      }
    }
    ctx.draw()
    
    gameMonitor.timmer= setTimeout(function(){
      that.run(ctx)
    },500)
  },
  //背景滚动
  rollBg:function(){
    var that=this
        if(that.bgDistance>=that.bgHeight){
          that.bgloop=0
        }
        that.bgloop++
        that.bgDistance=that.bgloop * that.bgSpeed;
        that.setData({
          bgTop1:that.bgDistance,
          bgTop2:that.bgDistance-that.bgHeight
        })
  },
  //产生月饼
  createMoon:function(){
    gameMonitor.time++
    if (gameMonitor.time>=60) {
      this.stop()
    }
    var genRate = 6; //产生月饼的频率
    var genNum=2;//产生月饼的次数

    for (var i = 0; i < genNum;i++){
    var random=Math.random()
    if (random * genRate > genRate - 2) {
    var left=Math.random()*(this.data.w-50)
    var type=Math.floor(left)%6
    switch(type){
        case 1: type=1;
        break;
        case 2: type = 2;
        break;
        case 3: type = 4;
        break;
        case 4: type = 5;
        break;
        default:type=0;
    }
    var index =gameMonitor.foodList.length
    var f = new Food(type, left, index)
    gameMonitor.foodList.push(f)
  }  
  }
  },
  //吃月饼
  eat:function(player,foodList){
    for (var i = foodList.length-1; i >=0; i--) {
      var f=foodList[i]
      if(f){
        var l1 = player.top + player.height / 2 - (f.top + f.height / 2);
        var l2 = player.left + player.width / 2 - (f.left + f.width / 2);
        var l3 = Math.sqrt(l1 * l1 + l2 * l2);
        if (l3 <= player.height / 2 + f.height / 2) {
          foodList[f.index]=null
          if (f.type==0) {
            this.stop()
          }else {
            this.setData({
              score:this.data.score+10*f.type
            })
          }
        }
      }
    }
  },
  
  //玉兔移动
  bindtouchstart: function (event){
    if(this.data.isGameStart){
      this.player.setPosition(event);
    }
    this.setData({
      isPlayerMoving:true
    })
  },
  bindtouchmove:function(event){
      if (this.data.isPlayerMoving) {
        var _playerObj=this.player.setPosition(event);
      }
      
  },
  bindtouchend:function(){
    this.setData({
      isPlayerMoving: false
    });
  }
  

})
var tarL, tarT;
function Ship(ctx){
  this.width = 80;
  this.height = 80;
  this.left = app.w/2-40;
  this.top = app.panelH-80;
  this.paint=function(){
     ctx.drawImage('../../static/img/player.png', this.left, this.top, this.width, this.height);
  }
  this.setPosition = function (event) {
    tarL = event.changedTouches[0].x;
    tarT = event.changedTouches[0].y;
    this.left = tarL - this.width / 2 ;
    this.top = tarT - this.height / 2;
    if (this.left < 0) {
      this.left = 0;
    }
    if (this.left > app.w - this.width) {
      this.left = app.w - this.width;
    }
    if (this.top < 0) {
      this.top = 0;
    }
    if (this.top > app.panelH - this.height) {
      this.top = app.panelH - this.height;
    }
    this.paint();
  }
}
var gameMonitor={
  timmer:null,
  foodList:[],
  time:0
}
function Food(type,left,index){
  this.speedUpTime = 300;
  this.index = index;
  this.type = type;
  this.width = 50;
  this.height = 50;
  this.left = left;
  this.top = -50;
  this.speed = 10 * Math.pow(1.2, Math.floor(gameMonitor.time / this.speedUpTime));
  this.loop = 0;

  var p;
  switch(type){
    case 1: p ='../../static/img/food1.png';
    break;
    case 2: p ='../../static/img/food2.png';
    break;
    case 4: p = '../../static/img/food4.png';
    break;
    case 5: p = '../../static/img/food5.png';
    break;
    default: p = '../../static/img/food0.png';
  }
  this.pic = p;
}
Food.prototype.paint=function (ctx){
  ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Food.prototype.move = function (ctx) {
  this.top += ++this.loop * this.speed;
    this.paint(ctx);
}