class AuthHelper {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = this.decodeToken(token);
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    static decodeToken(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }

    static getUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            return this.decodeToken(token);
        } catch {
            return null;
        }
    }

    static getUserRole() {
        const user = this.getUser();
        return user?.roles || null;
    }

    static isTeacher() {
        const roles = this.getUserRole();
        return roles?.includes('ROLE_TEACHER') || false;
    }

    static isStudent() {
        const roles = this.getUserRole();
        return roles?.includes('ROLE_STUDENT') || false;
    }

    static logout() {
        this.removeToken();
    }
}

export default AuthHelper;
