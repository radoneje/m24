
var mainHeadApp = new Vue({
    el: '#main-page',
    data: {
        user:{},
        users:[],
        userMenu:false,
        panels:{rundown:true, dashboard:false},
        tabs:{archive:false,video:false,messager:false,rss:false},
        tabIsOpen:false,
        programs:[{id:1,title:'Новости 24', selected:true}],
        news:{},
        currNews:{},
    },
    methods: {
        exitClick:async function () {
            await axios.delete("/rest/api/v1/user")
            document.location.href="/login";
        },
        userClick:async function () {
            this.userMenu=true;
        },
        closeSettings:async function () {
            this.userMenu=false;
        },
        userChange:async function () {
            var r=await axios.post("/rest/api/v1/user", this.user);
           // this.user=r.data;
        },
        changePanels: async function(ctrl){
            Object.keys(this.panels).map(k=>{
                this.panels[k]=ctrl==k;
            });

        },
        changeTabs: async function(ctrl){
            var _this=this;
            Object.keys(this.tabs).map(k=>{
                if(ctrl!=k)
                    this.tabs[k]=false;
                else
                    this.tabs[k]=!this.tabs[k];
            });
            _this.tabIsOpen=false;
            Object.keys(_this.tabs).forEach(k=>{
                _this.tabIsOpen=_this.tabIsOpen||_this.tabs[k];
            });
        },
       reloadNews:async function(){
           var _this=this;
            var r=await axios.get("/rest/api/v1/news/"+  _this.programs.filter(p=>p.selected)[0].id);
            this.news=r.data;
       },
        newsAdd:async  function(){
            var _this=this;
            var r=await axios.post("/rest/api/v1/news/",{progId:  _this.programs.filter(p=>p.selected)[0].id})
            _this.currNews=r.data;
           // console.log(r.data);
        },
        newsClick:async function(newsItem){

            this.news.forEach(n=>{
                if(n.id!=newsItem.id)
                    n.active=false;
                else {
                    n.active = true;
                    this.currNews=n;
                }
                return n;
            });
        }

    },
    computed:{
      //  fullName:this.user.name +' ' + this.user.suName

    },
    watch:{
    },
    mounted: async function () {
        var _this=this;
        var r=await axios.get("/rest/api/v1/users")
        _this.users=r.data;

        _this.user=user;
        _this.reloadNews();

        var socket = io('http://localhost');
        socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                socket.connect();
            }
            // else the socket will automatically try to reconnect
        });
        socket.on('connect', () => {
            socket.emit("init", user);
            console.log("init websocket: ");
            var events=initEvents(_this)
                    socket.on("cmd", (dt)=>{
                        if(typeof (events[dt.message])=="function")
                            events[dt.message](dt.data);
                    })

               // }
        });


    }
});
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validatePass(p){
    if(!p || p.length<3)
        return false
    return true;
}

function initEvents(_this){
    return{
        pong: (data)=>{
            console.log("pong receive", data)
        },
        "userOnline": (data)=>{
            console.log("userOnline", data.name, data.suName )
            _this.users.forEach((u)=>{
                if(u.id==data.id)
                    u.isActive=true;
                return u;
            })
        },
        "userOffline": (data)=>{
            console.log("userOffline", data.name, data.suName )
            _this.users.forEach((u)=>{
                if(u.id==data.id)
                    u.isActive=false;
                return u;
            })
        },
        "newsChange":(data)=>{
            if(_this.programs.filter(p=>p.selected)[0].id==data.progId){
                if(_this.news.filter(e=>e.id==data.id).length>0)
                {
                    _this.news.forEach(n=>{
                        if(n.id==data.id)
                            n=data;
                        return n;
                    })
                    _this.news=_this.news.sort((a,b)=>{return moment(a.date).unix()-moment(b.date).unix()})
                }
                else
                {
                    _this.news.push(data)
                    _this.news=_this.news.sort((a,b)=>{return moment(b.date).unix()-moment(a.date).unix()})
                }
            }
           // console.log("newsChange socket", data.id,  )
        }
    }
}


