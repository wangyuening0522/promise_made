const PENDING = "pending";aaa
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
//myPromise函数时Promsiede构造函数
//全程修改State和Result
function myPromise(executor) {
  //初始状态pending，初始值null
  this.PromiseState = PENDING;
  this.PromiseResult = null;
  //回调函数队列
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];
  //暂存this，因为resolve是由全局调用的，在resolve里面需要用暂存的this来指向实例对象
  const _this = this;
  //1.更改状态，通过简单的赋值操作
  //2.promsie只能更改一次，所以在更改状态以前（resolve和reject中）要判断状态是否是pending
  //3.这里的_this是上一步暂存的真正实例对象this，而不是这个函数的this
  //众所周知，函数中的this意味着函数的this，构造函数的this是实例对象的this
  function resolve(value) {
    if (_this.PromiseState === PENDING) {
      _this.PromiseState = FULFILLED;
      _this.PromiseResult === value;
      //遍历执行队列里的回调函数
      _this.onFulfilledCallbacks.forEach(function (callback) {
        callback(value);
      });
    }
  }
  function reject(value) {
    if ((_this.PromiseState = PENDING)) {
      _this.PromiseState = REJECTED;
      _this.PromiseResult = value;
      //遍历执行队列中的回调函数
      _this.onRejectedCallbacks.forEach(function (callback) {
        callback(value);
      });
    }
  }
  //try catch包裹，当发生错误时走reject并且传入err
  try {
    //执行器函数传入两个函数
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
  //返回值时this，也就是当前的实例对象，这是因为在Promise的使用时，我们通常会链式调用then
  //或catch方法，而这些方法的返回值也是实例对象。因此为了链式调用，我们需要在构造函数中返回实例对象
  //方便在Promise对象状态改变前添加回调函数
  return this;
}
//在构造函数的原型中加入.then方法
//.then的功能是：当Promise实例的状态改变时，执行传入的两个函数中对应的一个。
myPromise.prototype.then = function (onFulfilled, onRejected) {
  //暂存this
  const _this = this;
  if (_this.PromiseState === FULFILLED) {
    //原版：
    //执行第一个参数函数
    //状态时fulfilled，执行onfulfilled,传入参数
    //onFulfilled(_this.PromiseResult);
    //修改后：
    const nextPromise = new myPromise((resolve, reject) => {
      //.then返回一个promise
      //在.then外包裹一个setTimeout，模拟微任务的效果
      setTimeout(function () {
        try {
          const returnValue = onFulfilled(_this.PromiseResult);
          //接受到onfulfilled函数返回值，再次使用resolve
          resolve(returnValue);
        } catch (err) {
          reject(err);
        }
      }, 0);
    });
    return nextPromise;
  }
  if (_this.PromiseState === REJECTED) {
    //原版：
    //状态是rejected，执行onRejected，传入参数
    //onRejected(_this.PromiseResult);
    //进阶版：
    const nextPromise = new myPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          onRejected(_this.PromiseResult);
          reject();
        } catch (err) {
          reject(err);
        }
      }, 0);
    });
    return nextPromise;
  }
  //将暂时无法执行的函数推入对应的队列
  if (_this.PromiseState === PENDING) {
    const nextPromise = new myPromise((resolve, reject) => {
      //这里要用function包裹onFulfilled和onRejected原因是
      //如果直接向上面onFulfilled()意味着直接执行，而我只是想把无法执行的函数推入对应的队列(这里用数组代替)
      _this.onFulfilledStatebacks.push(function () {
        //原版：onFulfilled(_this.PromiseResult);
        setTimeout(function () {
          try {
            onFulfilled(_this.PromiseResult);
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
      _this.onRejectedCallbacks.push(function () {
        //原版：onRejected(_this.PromiseResult);
        setTimeout(function () {
          try {
            onRejected(_this.PromiseResult);
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
    });
    return nextPromise;
  }
};
new myPromise((resolve, reject) => {
  console.log("我立即执行");
  setTimeout(() => {
    resolve(100);
    console.log(PromiseResult);
  }, 1000);
});
// .then((val)=>{
//     console.log('成功的值是：'+val);

// })
