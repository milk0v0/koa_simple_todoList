## 前言

+ 很多的练手、复习都是从一个简单的 todoList 开始的
+ 这个 todoList 我使用了 node 作为后端，koa 框架，有首页和详情页，不过数据不多，内容也么得，不过无所谓~
+ 代码和资源在我的 github：[milk0v0](https://github.com/milk0v0)，大家有兴趣可以先看效果再看看我的思路，也欢迎关注嗷~



## 入口

+ https://github.com/milk0v0/koa_simple_todoList

```shell
node app.js
```



## 使用技术栈

> 1. koa
> 2. koa-router
> 3. koa-static-cache
> 4. nunjucks



## 思路

> 1. 我选择使用模板引擎 `nunjucks` 方便页面输出内容
> 2. 用 `koa` 框架使得我们的 node 写的更加轻松
> 3. 因为我有静态资源（图片）需要输出，那写判断也太麻烦，使用了 `koa-static-cache`
> 4. 最重点的则是路由，我们使用路由进行导航（实际操作则是根据 URL 输出不同的内容），那么路由导航就十分的重要，我选择使用 `koa-router` 



## 静态资源映射

+ 先使用 `koa-static-cache` 映射静态资源
+ ps：静态资源作为我们最初的判断，`koa-static-cache` 需要放在所有中间键的上面

```javascript
app.use(KoaStaticCache('./public', {
    dynamic: true
}));
```



## 模板引擎中间键

+ 我们引用 `nunjucks` 要先引用模板 => 写入数据 => 再通过 ctx.body 输出，可如果我们的模板相对较多的时候，写这么多个重复的代码肯定是不舒服的
+ 我们写的这个中间键目的就是为了我们可以通过 ctx.render(fileName, datas) 去把模板输出出来
+ 不要想的这么复杂，实际上就是写一个函数，使得 ctx.render 变为一个方法，然后通过 `use` 注册，告诉 `koa`
+ 在这个基础上，我还想完整封装，把一开始寻找模板的 dir 也传进去，通过 `use` 方法注册的时候告诉他
+ 最终我们就可以在用 `nunjucks` 输出 html 模板时，只通过 `ctx.render` 就可以了

```javascript
module.exports = (dir, options) => {
    const tpl = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(dir, options)
    );

    return (ctx, next) => {
        ctx.render = (fileName, datas) => {
            let content = tpl.render(fileName, datas);
            ctx.body = content;
        }
        next();
    }
}

app.use(KoaStaticCache('./public', {
    dynamic: true
}));
```



## 路由

+ 路由很重要，整个 todoList 最重要的是路由部分，把路由处理好了，那么这个 todoList 也快弄好了
+ 我们页面有两个部分，一个是首页，一个是详情页
+ 那么我的路由设计也分为了 `/`（首页） 和 `/detail`（详情页）两个，但是首页的内容，需要分页，详情页也会有不同的内容，怎么办呢
+ 我使用了动态路由，首页我采用的是 `params`，详情页我使用的是 `query`



### 首页

+ 在路由上我们可以通过 `:params` 使用动态路由，这样在 `:` 后面的内容会被判定为不确定的，`URL` 的表现形式是 `/params`，例如：`http://127.0.0.1:8080/params`，`params` 的内容会通过 `URL` 传到后端
+ 括号内的参数是正则判断，我这里判断数字才进入路由，那么我们首页的分页页数就会通过 `/1` 、`/2` 这种形式表示

```javascript
router.get('/:page(\\d+)', ctx => { });
```

+ 这个时候出现了一个问题，`/1` 是第一页，`/2` 是第二页，但刚进页面的时候我们首页就是 `http://127.0.0.1:8080/1` ，用户习惯上不会去写 `/1` 进入首页/页面（当然真正项目也没道理是内容分页作为首页），这样也很丑，那咋办
+ 把 `/` 和 `/1` 映射出来的东西都一样怎么样？这样也行，但我们也可以换一种思路，把 `/` 变成 `/1` 不就好了？
+ 这里我是用了重定向

```javascript
router.get('/', ctx => {
    ctx.redirect('/1');
});
```

+ 这个时候，我们的首页路由就设计好啦~
+ 因为数据是一个数组对象，我想要 5 个内容作为一页，那么我们只要小手一挥，判断一下路由参数 `params` ，筛选一下，再填入模板内~就好啦

```javascript
const pages = Math.ceil(datas.length / 5);
const { page } = ctx.params;
const showDatas = datas.filter((item, index) => (index >= 5 * (page - 1) && index < page * 5));
ctx.render('index.html', { datas: showDatas, pages, page })
```



### 详情页

+ 详情页本来没什么好说的，其实跟首页一样，通过动态路由参数判断数据数组，把内容输出就可以了，不过为啥我要用 `query` 传参呢？
+ ~~因为我喜欢~~，~~为了练手鸭~~，我们来说说 `query` 传参吧
+ 像函数一样，传参，就算我们不需要前面的参数，他还是得占位的，`params` 也一样，如果我们动态路由组的较长的时候，例如 `/user/page/content` 这个时候，也是需要占位的
+ 而 `query` 则不同，他像函数传入一个对象一样，想传啥就传啥，不需要占位，表现形式为：`?id=`
+ 那么详情页，我们也是小手一挥~ 搞定

```javascript
router.get('/detail', ctx => {
    const data = datas.find(item => +ctx.query.id === item.id);
    ctx.render('detail.html', { data })
});
```



## 模板

+ 最后再说说模板，点不多，也就是官网那些，cv就彳亍
+ 循环数字我们需要用到 `range` 函数
+ `a` 标签的跳转，分页上我们只要根据我们现在的 page，数据数组的长度，小小判断一下就好~
+ 详情页，因为我的判断是通过 id，所以我们的请求也是通过 `/detail?id=` 处理就可以了

```html
<a href="/detail?id={{data.id}}"></a> <!-- 详情页 -->

<!-- 分页 -->
<div class="pagination">
    {% if page > 1 %}
        <a href="{{+page-1}}" class="prev">⌜</a>
    {% endif %}
    {% for i in range(1, pages+1) %}
        {% if i == page %}
            <a class="current">{{i}}</a>
        {% else %}
            <a href="/{{i}}">{{i}}</a>
        {% endif %}
    {% endfor %}
    {% if page < pages %}
        <a href="{{+page+1}}" class="next">⌝</a>
    {% endif %}
</div>
```



欢迎大家在评论互相讨论嗷~
