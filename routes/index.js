var express = require('express');
var router = express.Router();
const lang=require('../lang')

/* GET home page. */
router.get('/', login, function(req, res, next) {

  res.render('index', { title: '', lang:lang.en,  user:JSON.stringify(req.session.user) });
});
function login(req, res, next){

  if (!req.session|| !req.session.user)
    return res.redirect("/login")

  next();
}
router.all('/login', async (req, res, next)=>{
  //req.session.user=null;
  res.render('login', { title: '', lang:lang.en })
})

module.exports = router;
