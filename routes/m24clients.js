class clients{
    constructor() {
        this.arr=[];
        this.count=0;
        this.event=new Object();
        this.event['test']=async (data)=>{ // массив по функциям, полученным от пользователя
            console.log("test event running");
        }
    }
    add(user,socket){
        this.count++;
        this.arr.push({id:this.count, user:user, socket:socket,isActive:true });

        for(var key in  this.event ){
            socket.on(key, async (data)=>{await this.event[key](data); })
        }
        setTimeout(()=>{this.send("userOnline",user)}, 500);
        return this.count;
    }
    remove(clientId){
        this.arr.forEach(e=>{
            if(e.id==clientId)
                e.isActive=false;
            {
                this.send("userOffline",e.user);
            }
            return e;
        })
    }
   send(message, data){
        this.arr.forEach(e=>{
            if(e.isActive)
            {
                try {
                    e.socket.emit("cmd", {message, data})
                }
                catch (ex) {
                    console.warn(ex);
                    e.isActive=false;
                    return e;
                }
            }
        });
    }


}


module.exports=clients