
var app = new Vue({
    el: '#app',
    data: {
        ready:false,
        login:"",
        pass:"",
        message:"",
        isLoading:false,
    },
    methods: {
        loginClick:function(e){
            var _this=this;
            _this.message="";
            if(e.keyCode==13)
                _this.$refs.pass.focus();
        },
        passClick:function(e){
            var _this=this;
            _this.message="";
            if(e.keyCode==13)
                _this.tryLogin();
        },
        tryLogin:async function () {

            var _this=this;
            if(!validateEmail(_this.login)){
                _this.$refs.login.focus();
                 return;
            }
            if(!validatePass(_this.pass)){
                _this.$refs.pass.focus();
                return;
            }
            _this.isLoading=true;
            try {
                var res = await axios.post("/rest/api/v1/login", {"login":_this.login, "pass":_this.pass});
                localStorage.setItem("login", _this.login);
               // _this.message="Login success, redirecting";
                setTimeout(()=>{document.location.href="/"},1000)

            }
            catch (e) {
                _this.message="E-mail or password is not correct";
                _this.pass="";
                _this.$refs.login.focus();
                _this.isLoading=false;
            }
            finally {

            }

        }
    },
    computed:{
    },
    watch:{
    },
    mounted: function () {
        var _this=this;
        _this.login=localStorage.getItem("login", _this.login)||"";
        setTimeout(()=>{_this.ready=true;_this.$refs.login.focus();},500)

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
