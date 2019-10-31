
function Sse() {
    this.users = [];
    this.send = function(event, data, callback) {
        for(var i=0;i<this.users.length;i++) {
            this.users[i].sse(event, data);
        }
    }
    this.remove = function(res) {
        if(this.users.indexOf(res)) this.users.splice(this.users.indexOf(res), 1);
    }
};

module.exports = new Sse();
