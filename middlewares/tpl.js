const nunjucks = require('nunjucks');

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