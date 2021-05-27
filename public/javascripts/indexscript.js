
var mainHeadApp = new Vue({
    el: '#main-page',
    data: {
        user:{},
        users:[],
        userMenu:false,
        panels:{rundown:true, dashboard:false},
        tabs:{archive:false,video:false,messager:false,rss:false},
        tabIsOpen:false,
        programs:[{id:1,title:'Новости 24', isSelected:true}],
        news:[],
        selNews:{},
        settings:{},
        loader:false,
        plots:[],
    },
    methods: {
        selectPlotAutor:async function(item){
            console.log("selectPlotAutor", item)
            closeAllPopup();
            var elem=createPopap(document.getElementById("plotAutors"+item.id))

            elem.classList.add("selectPlotAutorsDlg")
            this.users.forEach(u=>{
                var box=document.createElement("div")
                elem.appendChild(box)

                box.classList.add("listItem")
                box.classList.add("listItemFlex")

                var author=document.createElement("div")
                var camera=document.createElement("div")
                var editor=document.createElement("div")
                var name=document.createElement("div")

                author.classList.add("listIcon")
                author.classList.add("iconAutor")
                camera.classList.add("listIcon")
                camera.classList.add("iconCamera")
                editor.classList.add("listIcon")
                editor.classList.add("iconEditor")

                name.innerText=this.getUserNameFromId(u.id);
                box.setAttribute("userid", u.id);
                

                box.appendChild(author);
                box.appendChild(camera);
                box.appendChild(editor);
                box.appendChild(name);


            })


        },
        changePlot:async function(item){
            console.log("changeplot", item)
            var res=await axios.patch("/rest/api/v1/plot/",item);
        },
        clickNews:async function(item){
            this.loader=true;
            this.selNews=item;
            this.plots=[];
            var res=await axios.get("/rest/api/v1/plot/"+item.id);
            console.log(res.data)
            this.plots=res.data;
            this.loader=false;
        },
        addPlot:async function() {
            if (this.loader || !this.selNews.id)
                return;
            this.loader = true;
            var res = await axios.post("/rest/api/v1/plot/", {newsid: this.selNews.id})
            this.loader = false;
            this.plots.push(res.data);
            this.plots.sort((a,b)=>(a.sort-b.sort));
        },
        chekNewsFire:function(item){

            return moment(item.date).unix()> moment().unix() &&  moment(item.date).unix()< moment().endOf("day").unix()
        },
        chekNewsPast:function(item){
           return moment(item.date).unix()< moment().unix()
        },
        getUserNameFromId:function (id){
            var user=this.getUserFromId(id);
            return user?(user.suName+" "+ user.name):null;
        },
        getUserFromId:function (id){
            var ret=this.users.filter(u=>u.id==id);
            if(ret.length>0)
                return ret[0];
            else
                return null;
        },
        changeNewsOwner:function(){
            var elem=createPopap(document.getElementById("NewsOwner"));
            elem.classList.add("popupDlg")
            this.users.forEach(u=>{
                var item=document.createElement('div')
                item.classList.add("listItem")
                item.innerText=u.suName +" " + u.name;
                elem.appendChild(item)
                item.onclick=async ()=>{
                    this.selNews.ownerid=u.id;
                    closeAllPopup();
                    await this.newsChange(this.selNews)

                }
            })
        },
        changeNewsTime:async function(event){
            if(!this.selNews.date)
                return;
            let val=event.currentTarget.value.replace(/[^\d]/g, "")
            let m=val.match(/(\d{1,2})(\d\d)$/)
            if(m){
                this.selNews.date=
                    moment(this.selNews.date)
                        .startOf('day')
                        .add(m[1],"hours")
                        .add(m[2],"minutes")
                        .toDate()
                await this.newsChange(this.selNews)
            }
        },
        changeNewsDate:async function(){

            if(!this.selNews.date)
                return;
            closeAllPopup();

            var elem=document.createElement('div');
            elem.classList.add('popUpMenuWindow')
            elem.classList.add('popup')
            elem.id="prgDate"
            elem.addEventListener("click",(e)=>{e.stopPropagation()})
            var parent=document.getElementById("PrgDate");
            parent.appendChild(elem);
            var btn=document.createElement('div');
            btn.id="btn"
            elem.appendChild(btn)
            let first=true;
            new Datepicker('#btn', {
                inline: true,
                openOn:this.selNews.date,
                weekStart:this.settings.weekStart,
                onChange:async (e)=>{
                    if(!first) {
                        let old = moment(this.selNews.date)
                        var date = moment(e).startOf('day');
                        this.selNews.date = date.add(old.format("HH"), 'hours').add(old.format("mm"), 'minutes').toDate();
                        await this.newsChange(this.selNews)
                        first=true
                        closeAllPopup();
                    }
                    else
                        first=false;

                }
            });

        },
        newsChange:async function (selNews) {

            var r=await axios.patch("/rest/api/v1/news/",selNews);
            this.news.sort((a,b)=>{return moment(b.date).unix()-moment(a.date).unix()})
        },
        reloadProg:async function () {
            let res=(await axios.get("/rest/api/v1/prog/"));

            let selected=null;
            let sel=this.programs.filter(p=>p.isSelected)
            if(sel.length>0)
                selected=sel[0].id;
            res.data.forEach(p=>{
                p.isSelected=p.id==selected;
            });
            if( res.data.filter(p=>p.isSelected).length==0)
                res.data[0].isSelected=true;
           this.programs=res.data;
        },
        getSelProg:function(){
            let sel=this.programs.filter(p=>p.isSelected)
            return sel[0];
        },
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
            var r=await axios.get("/rest/api/v1/news/"+  this.getSelProg().id);
            this.news=r.data;
       },
        newsAdd:async  function(){
            var _this=this;
            var r=await axios.post("/rest/api/v1/news/",{progId:  _this.programs.filter(p=>p.selected)[0].id})
            _this.currNews=r.data;
           // console.log(r.data);
        },

    },
    computed:{
      //  fullName:this.user.name +' ' + this.user.suName

    },
    watch:{
    },
    mounted: async function () {
        var _this=this;
        let r=await axios.get("/rest/api/v1/users")
        r.data.sort(function(a, b){
            if(a.suName < b.suName) { return -1; }
            if(a.suName > b.suName) { return 1; }
            return 0;
        })
        _this.users=r.data;
         r=await axios.get("/rest/api/v1/settings")
         this.settings=r.data;

        _this.user=user;
        await this.reloadProg();
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

    window.addEventListener("click",()=>{closeAllPopup()})
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
function createPopap(parent) {
    var elem=document.createElement('div');
    elem.classList.add('popup')
    elem.addEventListener("click",(e)=>{e.stopPropagation()})
    parent.appendChild(elem);
    return elem;
}
function closeAllPopup() {
    var elems=document.querySelectorAll(".popup");
    elems.forEach(e=>{
        e.parentNode.removeChild(e);
    })
}


