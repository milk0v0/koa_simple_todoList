const Koa = require('koa');
const KoaRouter = require('koa-router');
const KoaStaticCache = require('koa-static-cache');
const tpl = require('./middlewares/tpl');

// 在 Node 中使用 require 加载一个 json 文件数据的话，他会自动转为对象，使用 fs 加载则是字符串
const datas = require('./data/data.json');

const app = new Koa();
const router = new KoaRouter();

app.use(KoaStaticCache('./public', {
    dynamic: true
}));

// 注册一个基于 nunjucks 的模板引擎中间键 以达到 ctx.render(fileDir, datas) 渲染模板的目的
app.use(tpl('./views'));

// 首页重定向
router.get('/', ctx => {
    ctx.redirect('/1');
});

router.get('/:page(\\d+)', ctx => {
    const pages = Math.ceil(datas.length / 5);
    const { page } = ctx.params;
    const showDatas = datas.filter((item, index) => (index >= 5 * (page - 1) && index < page * 5));
    ctx.render('index.html', { datas: showDatas, pages, page })
});

// 详情页
// 首页，当一个 URL 上的可选动态数据多的时候，用动态路由比较麻烦，就像一个函数如果参数多了，用一个个参数比较麻烦，这个情况下用 options 对象传参更方便
router.get('/detail', ctx => {
    const data = datas.find(item => +ctx.query.id === item.id);
    ctx.render('detail.html', { data })
});

app.use(router.routes());

app.listen(8080);

// 1.30