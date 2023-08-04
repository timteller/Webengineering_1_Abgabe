class API {
    constructor(groupKey) {
        this.baseUrl = "https://lukas.rip/api";
        this.groupKey = groupKey;
        this.authStr = localStorage.getItem("authStr");
    }

    createErrorFromMsg(msg) {
        return {
            success: false,
            msg: msg,
        };
    }

    createSuccessFromMsg(msg) {
        return {
            success: true,
            msg: msg,
        };
    }

    async createError(res) {
        let contentType = res.headers.get("content-type");
        let text = await res.text();
        let msg = text;
        if (contentType.includes("text/html")) {
            let htmlEl = document.createElement("html");
            htmlEl.innerHTML = text;
            msg = htmlEl.textContent.replace(/\s\s+/g, " ").trim();
        }

        return {
            success: false,
            httpCode: res.status,
            msg: msg,
        };
    }

    async createSuccess(res) {
        let contentType = res.headers.get("content-type");
        let data;
        try {
            if (contentType.includes("application/json")) {
                data = await res.json();
            } else {
                data = await res.text();
            }
        } catch {
            data = undefined;
        }

        return {
            success: true,
            httpCode: res.status,
            data: data,
        };
    }

    async formatReturn(res) {
        if (res.status < 200 || res.status >= 300) {
            return await this.createError(res);
        }
        return await this.createSuccess(res);
    }

    async sendRequest(method, endpoint, data, authenticated = false) {
        let headers = {};
        const methodsThatAllowData = ["POST", "PUT", "PATCH"];
        const methodsThatDontAllowData = ["GET", "DELETE"];
        const allowedMethods = [
            ...methodsThatDontAllowData,
            ...methodsThatAllowData,
        ];
        if (!allowedMethods.includes(method)) {
            return this.createErrorFromMsg(`Invalid request method: ${method}`);
        }

        headers["group-key"] = this.groupKey;
        headers["Content-Type"] = "application/json";

        if (authenticated && !this.authStr) {
            return this.createErrorFromMsg(
                "Cant't send autheticated reqest, no authetication details available"
            );
        }

        if (authenticated) {
            headers["authorization"] = this.authStr;
        }

        let options = {
            method: method,
            headers: headers,
        };

        if (data) {
            if (methodsThatAllowData.includes(method)) {
                options["body"] = JSON.stringify(data);
            } else {
                return this.createErrorFromMsg(
                    `Request method ${method} does not support data.`
                );
            }
        }

        let res = await fetch(`${this.baseUrl}${endpoint}`, options);

        return this.formatReturn(res);
    }

    async GET(endpoint, authenticated = false) {
        return await this.sendRequest("GET", endpoint, null, authenticated);
    }

    async POST(endpoint, data, authenticated = false) {
        return await this.sendRequest("POST", endpoint, data, authenticated);
    }

    async PATCH(endpoint, data, authenticated = false) {
        return await this.sendRequest("PATCH", endpoint, data, authenticated);
    }

    async PUT(endpoint, data, authenticated = false) {
        return await this.sendRequest("PUT", endpoint, data, authenticated);
    }

    async DELETE(endpoint, authenticated = false) {
        return await this.sendRequest("DELETE", endpoint, null, authenticated);
    }

    async login(username, password) {
        if(!username) {
            return this.createErrorFromMsg('Bitte einene Nutzername eingeben.');
        }
        if(!password) {
            return this.createErrorFromMsg('Bitte ein Passwort eingeben.');
        }
        localStorage.removeItem("authStr");
        localStorage.removeItem("username");
        this.authStr = this.generateAuthStr(username, password);
        let res = await this.GET(`/users/login`, true);
        if (!res.success) {
            this.authStr = undefined;
            return res;
        }
        localStorage.setItem("authStr", this.authStr);
        localStorage.setItem("username", username);
        return res;
    }

    logout() {
        localStorage.removeItem("authStr");
        localStorage.removeItem("username");
        this.authStr = undefined;
        return this.createSuccessFromMsg("logged out");
    }

    async getUsers() {
        return await this.GET("/users");
    }

    async getUser(username) {
        return await this.GET(`/users/${username}`);
    }

    async getUserPosts(username) {
        return await this.GET(`/users/${username}/posts`);
    }

    async getPosts() {
        return await this.GET("/posts");
    }

    async getPost(postId) {
        return await this.GET(`/posts/${postId}`);
    }

    async deletePost(postId) {
        return await this.DELETE(`/posts/${postId}`, true);
    }

    async createPost(postObj) {
        let validationRes = this.validatePostObj(postObj);
        if(!validationRes.success) {
            return validationRes;
        }
        return await this.POST(`/posts`, postObj, true);
    }

    async updatePost(postId, postObj) {
        let validationRes = this.validatePostObj(postObj);
        if(!validationRes.success) {
            return validationRes;
        }
        return await this.PUT(`/posts/${postId}`, postObj, true);
    }

    async createUser(username, password, displayName, description) {
        let user = {
            username: username,
            password: password,
            profile: {
                displayName: displayName,
                description: description,
            },
        };
        let validationRes = this.validateUserObj(user);
        if(!validationRes.success)
        {
            return validationRes;
        }
        return await this.POST(`/users`, user);
    }

    async updateUser(username, password, displayName, description) {
        let user = {
            username: username,
            password: password,
            profile: {
                displayName: displayName,
                description: description,
            },
        };

        let validationRes = this.validateUserObj(user);
        if(!validationRes.success)
        {
            return validationRes;
        }
        
        let res = await this.PATCH(`/users/${this.getLoggedInUser()}`, user, true);

        if(res.success) {
            let newAuthStr = this.generateAuthStr(username,password);
            this.authStr = newAuthStr;
            localStorage.setItem("authStr",newAuthStr);
        }
 
        return res;
    }

    async deleteUser() {
        if(!this.getLoggedInUser()) {
            return this.createErrorFromMsg('Du bist nicht eingeloggt');
        }
        let res = await this.DELETE(`/users/${this.getLoggedInUser()}`, true);
        if(res.success) {
            this.logout();
        }
        return res;
    }


    generateAuthStr(username, password) {
        return "Basic " + btoa(`${username}:${password}`);
    }

    getLoggedInUser() {
        return localStorage.getItem("username");
    }

    getPassword() {
        let authStr = localStorage.getItem("authStr");
        if(!authStr)
        {
            return false;
        }

        let usernameAndPassword = atob(authStr.replace('Basic ','')).split(':');
        let password = usernameAndPassword[1];
        return password;
    }

    validateUserObj(user) {
        if(user.username.length < 4 || user.username.length > 10)
        {
            return this.createErrorFromMsg('Der Nutzername muss zwischen 4 und 10 Zeichen lang sein.');
        }

        let pattern = /^[A-Za-z0-9]*$/;
        if(!pattern.test(user.username))
        {
            return this.createErrorFromMsg('Der Nutzername darf nur die Zeichen a-z, A-Z und 0-9 entahlten.');
        }

        if(user.profile.displayName.length < 4 || user.profile.displayName.length > 30)
        {
            return this.createErrorFromMsg('Der Anzeigename muss zwischen 4 und 30 Zeichen lang sein.');
        }

        if(user.profile.description && (user.profile.description.length < 1 || user.profile.description.length > 300))
        {
            return this.createErrorFromMsg('Die Beschreibung muss zwischen 1 und 300 Zeichen lang sein.');
        }

        if(user.password.length < 6 || user.password.lengt > 12)
        {
            return this.createErrorFromMsg('Das Passwort muss zwischen 6 und 12 Zeichen lang sein.');
        }

        let hasLetter = false;
        let hasNumber = false;
        let letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let numbers = '0123456789';
        for(let char of user.password) {
            if(letters.includes(char)) {
                hasLetter = true;
            }
            if(numbers.includes(char))
            {
                hasNumber = true;
            }
        }

        if(!hasLetter || !hasNumber)
        {
            return this.createErrorFromMsg('Das Passwort muss mindestens einen Buchstabe und eine Zahl enthalten.');
        }

        return {
            success: true
        }
    }

    validatePostObj(postObj) {
        if(!postObj.title) {
            return this.createErrorFromMsg('Bitte gib einen Titel ein.');
        }
        if(postObj.title.length < 4 || postObj.title.length > 60) {
            return this.createErrorFromMsg('Der Titel deines Posts muss zwishcne 4 und 60 Zeichen lang sein.');
        }

        let hasContent = false;

        let mainContentArrayRes = this.validateContentArray(postObj.content);
        if(!mainContentArrayRes.success) {
            return mainContentArrayRes;
        }

        if(postObj.content.length) {
            hasContent = true;
        }

        for(let section of postObj.sections) {
            if(!section.sectionTitle) {
                return this.createErrorFromMsg('Alle Sections müssen einen Titel haben');
            }
            if(section.sectionTitle.length < 4 || section.sectionTitle.length > 60) {
                return this.createErrorFromMsg('Alle Section-Titel müssen zwischne 4 und 60 Zeichen lang sein');
            }
            let contentArrayRes = this.validateContentArray(section.content);
            if(!contentArrayRes.success) {
                return contentArrayRes;
            }

            if(section.content?.length) {
                hasContent = true;
            }
        }

        if(!hasContent) {
            return this.createErrorFromMsg('Der Post muss Content haben.');
        }

        return {
            success: true
        }
        
    }

    validateContentArray(contentArray) {
        if(!contentArray) {
            return {
                success: true
            }
        }
        for(let contentEl of contentArray) {
            if(contentEl.__type == 'img') {
                if(!contentEl.caption) {
                    return this.createErrorFromMsg('Bitte gib für alle Bilder eine Caption ein.');
                }
                if(contentEl.caption.length < 10 || contentEl.caption.length > 100) {
                    return this.createErrorFromMsg('Die Caption aller Bilder muss zwischen 10 und 100 Zeichen lang sein');
                }
                if(!this.isValidImageUrl(contentEl.url)) {
                    return this.createErrorFromMsg('Alle Bilder müssen als Quelle eine gültige HTTPS-URL haben.');
                }
                
            }
            else if(contentEl.__type == 'text') {
                if(!contentEl.data) {
                    return this.createErrorFromMsg('Kein Textelement darf leer sein.');
                }
            }
        }
        return {
            success: true
        }
    }

    // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
    isValidImageUrl(string) {
        let url;
        try {
          url = new URL(string);
        } catch (_) {
          return false;  
        }
        return url.protocol === "https:";
    }
}

const api = new API("jr8au9hp");
// const api = new API('12345678');

