class UserService {
    static userSessionMap = new Map()

    static addUserToSession(sessionId, username, ws) {

        if (this.userSessionMap.get(sessionId)) {
            let users = this.userSessionMap.get(sessionId);
            users.push({ username: username, ws: ws });
            this.userSessionMap.set(sessionId, users)
        } else {
            this.userSessionMap.set(sessionId, [{ username: username, ws: ws }]);
        }
    }

    static deleteUserFromSession(ws) {
        console.log(ws)
        let res = null;
        this.userSessionMap.forEach((value, key) => {
            for (let i = 0; i < value.length; i++) {
                if (value[i].ws.id === ws.id) {
                    let filtered = value.filter(x => x.ws !== ws);
                    this.userSessionMap.set(key, filtered);
                    res = key;
                    return;
                }
            }

        });
        return res;
    }

    static getUsersForSession(sessionId) {
        return this.userSessionMap.get(sessionId).map(x => x.username);
    }
}

module.exports = UserService;