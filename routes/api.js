var express = require('express');
var router = express.Router();

/* GET users listing. */
router.all('/ping', async (req, res, next)=>{
  req.clients.send("pong", "hello from server")
  res.json(req.clients.length)
});
router.post('/login', async (req, res, next)=> {
  return res.status(404).send("not found")
  delete req.session.user;
  var q=await req.knex
      .select("*")
      .from("t_users")
      .where({email:req.body.login, password:req.body.pass, isDeleted:false});
  if(q.length==0)
    {return res.status(404).send("not found")};
  var utp=await req.knex
      .select("*")
      .from("t_userToProg")
      .where({userId:q[0].id});
  if(utp.length==0)
  {return res.status(404).send("not found")};
  req.session.user=q[0];
  res.json({id:q[0].id, name:q[0].name, suName:q[0].suName});
});
router.get("/user", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});
   delete req.session.user.password;//="";
  return res.json(req.session.user);

});
router.get("/users", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  var users=await req.knex
      .select("*")
      .from("t_users")
      .where({isDeleted:false})
      .orderBy(["suName", "name"]);
  users.forEach(user=>{
    delete user.password;
    return user;
  })
  return res.json(users);

})
router.delete("/user", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  delete req.session.user;
  return res.json({status:1});

})
router.post("/user", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  var q=await req.knex
      .select("*")
      .from("t_users")
      .where({id:req.session.user.id});
  var usr=q[0];
  usr.name=req.body.name;
  usr.suName=req.body.suName;
  usr.email=req.body.email;
  usr.phone=req.body.phone;
  usr.readRate=req.body.readRate;
  usr.fb=req.body.fb;
  usr.password=req.body.password ||usr.password ;
var id=usr.id;
delete usr.id;
  try {
    q = await req.knex("t_users")
        .update(usr)
        .where({id: id});
    //delete usr.password;
    usr.id=id;
    return res.json(usr);
  }
  catch (e) {
    return res.json({e:e.message});
  }
})
router.get("/news/:progId", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  var q=await req.knex
      .select("*")
      .from("t_news")
      .where({progId:req.params.progId, isDeleted:false})
      .orderBy('date' , 'desc');

  return  res.json(q);
});
router.post("/news", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  var q=await req.knex("t_news")
      .insert(req.body, "*");

  req.clients.send("newsChange", q[0])
  return  res.json(q[0]);
});

module.exports = router;
