import { makeAutoObservable } from "mobx";

export class LoginScreenStore {
    error: string | null = null;

    constructor(public username: string, public password: string) {
        makeAutoObservable(this);
    }

    isValid(): boolean {
        return this.username !== "" && this.password !== "";
    }

    async submit() {
        this.error = null;

        return fetch("/api/login/create", {
            credentials: "include",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            method: "POST",
            body: `username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`
        }).then((response) => {
            switch (response.status) {
                case 200:
                    return;
                case 401:
                    this.error = "Unknown username or password";
                    throw new Error("Unknown username or password");
                default:
                    this.error = "Something went wrong";
                    throw new Error("Something went wrong");
            }
        });
    }
}
