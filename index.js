const Koa = require('koa');
const views = require('koa-views');
const router = require('./router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

app.use(bodyParser());

// Must be used before any router is used
app.use(views(`${__dirname}/views`, {
  // extension: 'ejs',
  map: {
    html: 'ejs',
  },
  options: {},
}));

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
